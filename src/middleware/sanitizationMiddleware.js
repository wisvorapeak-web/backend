import xss from 'xss';
import validator from 'validator';

/**
 * Sanitize user input to prevent XSS attacks
 * Applies to all request bodies
 */
export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // req.query and req.params are read-only in newer Node versions
  // Sanitize individual values in-place instead of reassigning
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    }
  }

  if (req.params && typeof req.params === 'object') {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key]);
      }
    }
  }

  next();
};

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? xss(obj) : obj;
  }

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = xss(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate strong password
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const validatePassword = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

/**
 * Validate phone number (basic)
 */
export const validatePhone = (phone) => {
  return validator.isMobilePhone(phone);
};

/**
 * Trim and validate required fields
 */
export const validateRequired = (fields) => {
  const errors = [];
  for (const field of fields) {
    if (!field || (typeof field === 'string' && !field.trim())) {
      errors.push(`Field is required`);
    }
  }
  return errors;
};

/**
 * Validate input length
 */
export const validateLength = (value, minLength, maxLength, fieldName = 'Field') => {
  const errors = [];
  if (value && (value.length < minLength || value.length > maxLength)) {
    errors.push(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
  }
  return errors;
};
