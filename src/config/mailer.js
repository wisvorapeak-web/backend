import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize all available mail transporters from environment variables.
 * Supports MAIL_USER/MAIL_PASS and indexed accounts like MAIL_USER_1, MAIL_PASS_1, etc.
 */
const getTransporters = () => {
    const transportersList = [];
    
    // 1. Primary transporter from MAIL_USER / MAIL_PASS
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
        try {
            transportersList.push({
                transporter: nodemailer.createTransport({
                    host: process.env.MAIL_HOST || 'smtp.gmail.com',
                    port: parseInt(process.env.MAIL_PORT || '587'),
                    secure: process.env.MAIL_SECURE === 'true',
                    auth: {
                        user: process.env.MAIL_USER,
                        pass: process.env.MAIL_PASS,
                    },
                    pool: true,          // use connection pooling
                    maxConnections: 5,
                    maxMessages: 100,
                    rateDelta: 1000,      // 1 second between messages
                    rateLimit: 5,         // max 5 messages per rateDelta
                }),
                user: process.env.MAIL_USER,
                label: 'Primary'
            });
        } catch (err) {
            console.error('❌ Failed to create primary transporter:', err.message);
        }
    }

    // 2. Indexed accounts (MAIL_USER_1, MAIL_PASS_1, etc.)
    let i = 1;
    while (i <= 10) { // Support up to 10 accounts
        const user = process.env[`MAIL_USER_${i}`];
        const pass = process.env[`MAIL_PASS_${i}`];
        
        if (!user || !pass) {
            i++;
            continue;
        }

        // Skip duplicates
        const isDuplicate = transportersList.some(t => t.user === user);
        if (isDuplicate) {
            i++;
            continue;
        }

        try {
            transportersList.push({
                transporter: nodemailer.createTransport({
                    host: process.env[`MAIL_HOST_${i}`] || process.env.MAIL_HOST || 'smtp.gmail.com',
                    port: parseInt(process.env[`MAIL_PORT_${i}`] || process.env.MAIL_PORT || '587'),
                    secure: (process.env[`MAIL_SECURE_${i}`] || process.env.MAIL_SECURE) === 'true',
                    auth: { user, pass },
                    pool: true,
                    maxConnections: 5,
                    maxMessages: 100,
                    rateDelta: 1000,
                    rateLimit: 5,
                }),
                user,
                label: `Account ${i}`
            });
        } catch (err) {
            console.error(`❌ Failed to create transporter for MAIL_USER_${i}:`, err.message);
        }
        i++;
    }

    return transportersList;
};

const transporterPool = getTransporters();

// Export backward-compatible references
export const allTransporters = transporterPool.map(t => t.transporter);
export const transporter = transporterPool.length > 0 ? transporterPool[0].transporter : null;

let currentIndex = 0;

/**
 * Verify all transporters at startup (non-blocking)
 */
export const verifyTransporters = async () => {
    if (transporterPool.length === 0) {
        console.warn('⚠️  No mail transporters configured. Email sending will be disabled.');
        return;
    }

    console.log(`📧 Verifying ${transporterPool.length} mail transporter(s)...`);
    
    for (const entry of transporterPool) {
        try {
            await entry.transporter.verify();
            console.log(`  ✅ ${entry.label} (${entry.user}) — verified`);
        } catch (err) {
            console.error(`  ❌ ${entry.label} (${entry.user}) — failed: ${err.message}`);
        }
    }
};

/**
 * Get the next transporter using round-robin.
 */
const getNextTransporter = () => {
    if (transporterPool.length === 0) return null;
    const entry = transporterPool[currentIndex];
    currentIndex = (currentIndex + 1) % transporterPool.length;
    return entry;
};

/**
 * Find a transporter by the authenticated user email.
 */
const findTransporterByUser = (email) => {
    return transporterPool.find(t => t.user === email) || null;
};

/**
 * Sends an email with automatic retry and fallback.
 * 
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} from - Optional "From" header (e.g., "Name <email>")
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<boolean>} Success status
 */
export const sendEmail = async (to, subject, html, from = null, retries = 2) => {
    if (transporterPool.length === 0) {
        console.error('❌ No mail transporters configured. Cannot send email.');
        return false;
    }

    // Pick transporter: round-robin by default
    let entry = getNextTransporter();

    // If 'from' is a raw email that matches a configured account, use that transporter
    if (from) {
        const emailMatch = from.match(/<(.+)>|(\S+@\S+)/);
        const fromEmail = emailMatch ? (emailMatch[1] || emailMatch[2]) : from;
        const matchedEntry = findTransporterByUser(fromEmail);
        if (matchedEntry) {
            entry = matchedEntry;
        }
    }

    const accountUser = entry.user;
    const defaultFrom = `"Ascendix Summit" <${accountUser}>`;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const info = await entry.transporter.sendMail({
                from: from || defaultFrom,
                to,
                subject,
                html,
            });
            console.log(`✅ [${accountUser}] → ${to} (${info.messageId})`);
            return true;
        } catch (error) {
            const isLastAttempt = attempt === retries;
            
            if (isLastAttempt) {
                console.error(`❌ [${accountUser}] → ${to} FAILED after ${retries + 1} attempts: ${error.message}`);
                
                // Try fallback to next transporter if available
                if (transporterPool.length > 1) {
                    const fallback = getNextTransporter();
                    if (fallback && fallback.user !== accountUser) {
                        try {
                            const info = await fallback.transporter.sendMail({
                                from: from || `"Ascendix Summit" <${fallback.user}>`,
                                to,
                                subject,
                                html,
                            });
                            console.log(`✅ [FALLBACK ${fallback.user}] → ${to} (${info.messageId})`);
                            return true;
                        } catch (fallbackErr) {
                            console.error(`❌ [FALLBACK ${fallback.user}] → ${to} ALSO FAILED: ${fallbackErr.message}`);
                        }
                    }
                }
                return false;
            }

            // Wait before retry (exponential backoff: 1s, 2s)
            const delay = (attempt + 1) * 1000;
            console.warn(`⚠️  [${accountUser}] → ${to} attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
        }
    }

    return false;
};

/**
 * Get a summary of configured transporters (for admin UI)
 */
export const getTransporterStatus = () => {
    return transporterPool.map(t => ({
        user: t.user,
        label: t.label,
    }));
};
