import validator from 'validator';

/**
 * Utility to validate various forms in the application.
 * Returns an object with { isValid, errors }
 */
export const validateSubmission = (type, data) => {
    const errors = {};
    const { firstName, lastName, email, institution, country, title, abstractText, subject, message } = data;

    // Common Email Check
    if (!email || !validator.isEmail(email)) {
        errors.email = 'A valid email address is required.';
    }

    // Common Name Check
    if (!firstName || validator.isEmpty(firstName.trim())) {
        errors.firstName = 'First name is required.';
    }

    if (type === 'contact' || type === 'abstract' || type === 'registration') {
        if (!lastName || validator.isEmpty(lastName.trim())) {
            errors.lastName = 'Last name is required.';
        }
    }

    if (type === 'contact') {
        if (!subject || validator.isEmpty(subject.trim())) errors.subject = 'Subject is required.';
        if (!message || validator.isEmpty(message.trim())) errors.message = 'Message body cannot be empty.';
        if (message && message.length < 10) errors.message = 'Message must be at least 10 characters long.';
    }

    if (type === 'abstract') {
        if (!title || validator.isEmpty(title.trim())) errors.title = 'Abstract title is required.';
        if (!institution || validator.isEmpty(institution.trim())) errors.institution = 'Institution/Affiliation is required.';
        // if (!abstractText || validator.isEmpty(abstractText.trim())) errors.abstractText = 'Abstract description/text is required.';
    }

    if (type === 'registration') {
        if (!institution || validator.isEmpty(institution.trim())) errors.institution = 'Institution/Workplace is required.';
        if (!data.tier || validator.isEmpty(data.tier.toString().trim())) errors.tier = 'Please select a registration tier.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Sanitizes input to avoid basic XSS or malicious content.
 */
export const sanitizeData = (data) => {
    const sanitized = {};
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string') {
            sanitized[key] = validator.escape(data[key].trim());
        } else {
            sanitized[key] = data[key];
        }
    });
    return sanitized;
};
