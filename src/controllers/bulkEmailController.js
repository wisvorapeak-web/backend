import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { sendEmail } from '../config/mailer.js';
import { layout } from '../utils/emailTemplates.js';

// In-memory storage for CSV files (no need to persist)
const csvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
            return cb(new Error('Only CSV files are allowed.'));
        }
        cb(null, true);
    }
});

export const csvMiddleware = csvUpload.single('csv');

/**
 * Send bulk emails from uploaded CSV
 * POST /api/admin/bulk-email
 * Body: multipart/form-data { csv: File, subject: string, content: string, fromName?: string }
 * CSV must have columns: name, email
 */
export const sendBulkEmail = async (req, res) => {
    try {
        const { subject, content, fromName, fromEmail } = req.body;

        if (!subject || !content) {
            return res.status(400).json({ error: 'Subject and content are required.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'CSV file is required.' });
        }

        // Parse CSV
        const csvContent = req.file.buffer.toString('utf-8');
        let records;

        try {
            records = parse(csvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true
            });
        } catch (parseError) {
            return res.status(400).json({ error: `Invalid CSV format: ${parseError.message}` });
        }

        if (!records || records.length === 0) {
            return res.status(400).json({ error: 'CSV file is empty or has no valid rows.' });
        }

        // Validate columns
        const firstRow = records[0];
        if (!firstRow.name && !firstRow.Name) {
            return res.status(400).json({ error: 'CSV must contain a "name" column.' });
        }
        if (!firstRow.email && !firstRow.Email) {
            return res.status(400).json({ error: 'CSV must contain an "email" column.' });
        }

        // Process and validate all rows
        const validRecipients = [];
        const errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        records.forEach((row, index) => {
            const name = row.name || row.Name || '';
            const email = (row.email || row.Email || '').trim().toLowerCase();

            if (!email) {
                errors.push(`Row ${index + 2}: Missing email`);
                return;
            }
            if (!emailRegex.test(email)) {
                errors.push(`Row ${index + 2}: Invalid email "${email}"`);
                return;
            }
            if (!name.trim()) {
                errors.push(`Row ${index + 2}: Missing name for ${email}`);
                return;
            }

            validRecipients.push({ name: name.trim(), email });
        });

        if (validRecipients.length === 0) {
            return res.status(400).json({ 
                error: 'No valid recipients found in CSV.',
                details: errors.slice(0, 10) // Show first 10 errors
            });
        }

        // Send emails in batches of 5 to avoid overwhelming SMTP
        const BATCH_SIZE = 5;
        const results = { sent: 0, failed: 0, failedEmails: [] };
        const senderName = fromName || 'Ascendix World Food, AgroTech & Animal Science';
        const senderEmail = fromEmail || 'info@foodagriexpo.com';

        for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
            const batch = validRecipients.slice(i, i + BATCH_SIZE);
            
            const promises = batch.map(async (recipient) => {
                try {
                    // Personalize content: replace {{name}} placeholder
                    const personalizedContent = content
                        .replace(/\{\{name\}\}/gi, recipient.name)
                        .replace(/\{\{email\}\}/gi, recipient.email);

                    const htmlBody = layout(`
                        <h2 style="color: #00113a;">${subject}</h2>
                        <p>Dear ${recipient.name},</p>
                        <div style="white-space: pre-line; line-height: 1.8;">
                            ${personalizedContent}
                        </div>
                        <br />
                        <p style="color: #64748b; font-size: 12px;">
                            This email was sent from ${senderName}.<br/>
                            If you believe you received this in error, please disregard.
                        </p>
                    `);

                    const success = await sendEmail(
                        recipient.email, 
                        subject, 
                        htmlBody,
                        `"${senderName}" <${senderEmail}>`
                    );
                    
                    if (success) {
                        results.sent++;
                    } else {
                        results.failed++;
                        results.failedEmails.push(recipient.email);
                    }
                } catch (err) {
                    results.failed++;
                    results.failedEmails.push(recipient.email);
                }
            });

            await Promise.all(promises);

            // Small delay between batches to respect SMTP rate limits
            if (i + BATCH_SIZE < validRecipients.length) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        res.status(200).json({
            message: `Bulk email completed. ${results.sent} sent, ${results.failed} failed.`,
            total: validRecipients.length,
            sent: results.sent,
            failed: results.failed,
            failedEmails: results.failedEmails,
            skipped: errors.length,
            skippedDetails: errors.slice(0, 10)
        });

    } catch (error) {
        console.error('Bulk Email Error:', error);
        res.status(500).json({ error: 'Failed to process bulk email.' });
    }
};
