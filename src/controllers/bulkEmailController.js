import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { sendEmail, allTransporters } from '../config/mailer.js';
import { layout } from '../utils/emailTemplates.js';

// In-memory CSV upload handler
const csvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.originalname.endsWith('.csv')) {
            return cb(new Error('Only CSV files are allowed.'));
        }
        cb(null, true);
    }
});

export const csvMiddleware = csvUpload.single('csv');

/**
 * Send bulk emails from uploaded CSV
 * POST /api/admin/bulk-email
 * Supports SSE streaming for real-time progress updates
 */
export const sendBulkEmail = async (req, res) => {
    try {
        const { subject, content, fromName, fromEmail, nameColumn, emailColumn } = req.body;

        console.log('──────────────────────────────────────');
        console.log('📬 BULK EMAIL DISPATCH');
        console.log('  Subject:', subject);
        console.log('  From:', fromName ? `${fromName} <${fromEmail}>` : fromEmail);
        console.log('  Name Column:', nameColumn);
        console.log('  Email Column:', emailColumn);
        console.log('  File:', req.file ? `${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)` : 'MISSING');
        console.log('──────────────────────────────────────');

        // --- Validate required fields ---
        if (!subject || !content) {
            return res.status(400).json({ error: 'Subject and content are required.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'CSV file is required.' });
        }

        // --- Parse CSV ---
        const csvContent = req.file.buffer.toString('utf-8');
        let records;

        try {
            records = parse(csvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true,
                bom: true
            });
        } catch (parseError) {
            console.error('❌ CSV Parse Error:', parseError.message);
            return res.status(400).json({ error: `Invalid CSV format: ${parseError.message}` });
        }

        if (!records || records.length === 0) {
            return res.status(400).json({ error: 'CSV file is empty or has no valid rows.' });
        }

        console.log(`  📋 Parsed ${records.length} rows`);

        // --- Enforce limit (300 per active transporter account) ---
        const accountCount = Math.max(1, allTransporters.length);
        const MAX_RECIPIENTS = accountCount * 300;
        if (records.length > MAX_RECIPIENTS) {
            return res.status(400).json({
                error: `Maximum ${MAX_RECIPIENTS} recipients per batch (${accountCount} account(s) × 300). You uploaded ${records.length}.`
            });
        }

        // --- Resolve column names ---
        const availableColumns = Object.keys(records[0]);
        console.log('  📊 Available columns:', availableColumns);

        const resolvedNameCol = resolveColumn(
            nameColumn,
            availableColumns,
            ['name', 'full name', 'fullname', 'first name', 'firstname', 'recipient_name', 'recipient name']
        );
        const resolvedEmailCol = resolveColumn(
            emailColumn,
            availableColumns,
            ['email', 'email address', 'emailaddress', 'mail', 'e-mail']
        );

        if (!resolvedNameCol) {
            return res.status(400).json({
                error: 'Could not identify the Name column.',
                details: `Available columns: ${availableColumns.join(', ')}.`,
                availableColumns
            });
        }

        if (!resolvedEmailCol) {
            return res.status(400).json({
                error: 'Could not identify the Email column.',
                details: `Available columns: ${availableColumns.join(', ')}.`,
                availableColumns
            });
        }

        console.log(`  ✅ Columns: name="${resolvedNameCol}", email="${resolvedEmailCol}"`);

        // --- Extract, validate, and deduplicate recipients ---
        const validRecipients = [];
        const seenEmails = new Set();
        const errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        records.forEach((row, index) => {
            const name = (row[resolvedNameCol] || '').toString().trim();
            const email = (row[resolvedEmailCol] || '').toString().trim().toLowerCase();

            if (!email) {
                errors.push(`Row ${index + 2}: Missing email`);
                return;
            }
            if (!emailRegex.test(email)) {
                errors.push(`Row ${index + 2}: Invalid email "${email}"`);
                return;
            }
            if (seenEmails.has(email)) {
                errors.push(`Row ${index + 2}: Duplicate email "${email}" (skipped)`);
                return;
            }
            if (!name) {
                errors.push(`Row ${index + 2}: Missing name for ${email}`);
                return;
            }

            seenEmails.add(email);
            validRecipients.push({ name, email });
        });

        if (validRecipients.length === 0) {
            return res.status(400).json({
                error: 'No valid recipients found in CSV.',
                details: errors.slice(0, 10)
            });
        }

        console.log(`  ✅ ${validRecipients.length} unique recipients, ${errors.length} skipped`);

        // --- Start SSE stream ---
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Nginx compatibility
        if (res.flushHeaders) res.flushHeaders();

        // Track if client disconnected
        let clientDisconnected = false;
        req.on('close', () => { clientDisconnected = true; });

        const sendSSE = (data) => {
            if (!clientDisconnected) {
                try {
                    res.write(`data: ${JSON.stringify(data)}\n\n`);
                } catch (e) {
                    clientDisconnected = true;
                }
            }
        };

        // --- Send emails in controlled batches ---
        const BATCH_SIZE = 5;
        const BATCH_DELAY_MS = 1500; // 1.5s pause between batches
        const results = { sent: 0, failed: 0, failedEmails: [] };
        const senderName = fromName || 'Ascendix World Food, AgroTech & Animal Science';
        const senderEmail = fromEmail || allTransporters.length > 0 ? fromEmail : undefined;

        for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
            if (clientDisconnected) {
                console.log('  ⚠️  Client disconnected, aborting bulk email.');
                break;
            }

            const batch = validRecipients.slice(i, i + BATCH_SIZE);

            const promises = batch.map(async (recipient) => {
                try {
                    // Personalize content
                    const personalizedContent = content
                        .replace(/\{\{name\}\}/gi, recipient.name)
                        .replace(/\{\{email\}\}/gi, recipient.email);

                    const htmlBody = layout(`
                        <h2 style="color: #00113a; font-size: 22px; font-weight: 700; margin-top: 0;">${subject}</h2>
                        <p style="font-size: 16px; color: #475569; margin-bottom: 20px;">Dear ${recipient.name},</p>
                        <div style="white-space: pre-line; line-height: 1.8; font-size: 15px; color: #334155;">
                            ${personalizedContent}
                        </div>
                    `);

                    const fromHeader = senderEmail
                        ? `"${senderName}" <${senderEmail}>`
                        : undefined;

                    const success = await sendEmail(
                        recipient.email,
                        subject,
                        htmlBody,
                        fromHeader
                    );

                    if (success) {
                        results.sent++;
                    } else {
                        results.failed++;
                        results.failedEmails.push(recipient.email);
                    }
                } catch (err) {
                    console.error(`  ❌ Exception for ${recipient.email}:`, err.message);
                    results.failed++;
                    results.failedEmails.push(recipient.email);
                }
            });

            await Promise.all(promises);

            // Send progress update
            const processed = Math.min(i + BATCH_SIZE, validRecipients.length);
            const progressPercentage = Math.round((processed / validRecipients.length) * 100);
            sendSSE({
                type: 'progress',
                progress: progressPercentage,
                sent: results.sent,
                failed: results.failed,
                total: validRecipients.length,
                processed
            });

            // Rate-limit pause between batches
            if (i + BATCH_SIZE < validRecipients.length) {
                await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
            }
        }

        // --- Send final result ---
        const finalResult = {
            type: 'complete',
            message: `Bulk email completed. ${results.sent} sent, ${results.failed} failed.`,
            total: validRecipients.length,
            sent: results.sent,
            failed: results.failed,
            failedEmails: results.failedEmails,
            skipped: errors.length,
            skippedDetails: errors.slice(0, 20)
        };

        console.log(`  📊 RESULT: ${results.sent} sent, ${results.failed} failed, ${errors.length} skipped`);
        sendSSE(finalResult);
        res.end();

    } catch (error) {
        console.error('❌ Bulk Email Critical Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process bulk email dispatch.' });
        } else {
            try {
                res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Internal server error during dispatch.' })}\n\n`);
                res.end();
            } catch (e) {
                // Connection already closed
            }
        }
    }
};

/**
 * Resolve a column name from client input or fuzzy-match fallback candidates.
 */
function resolveColumn(clientValue, availableColumns, fallbackCandidates) {
    if (clientValue) {
        // Exact match
        const exact = availableColumns.find(c => c === clientValue);
        if (exact) return exact;

        // Case-insensitive match
        const ci = availableColumns.find(c => c.toLowerCase() === clientValue.toLowerCase());
        if (ci) return ci;

        // Trimmed and cleaned match
        const cleaned = availableColumns.find(c => 
            c.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === clientValue.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
        );
        if (cleaned) return cleaned;
    }

    // Fallback: try common candidates
    for (const candidate of fallbackCandidates) {
        const match = availableColumns.find(c => c.toLowerCase() === candidate.toLowerCase());
        if (match) return match;
    }

    return null;
}
