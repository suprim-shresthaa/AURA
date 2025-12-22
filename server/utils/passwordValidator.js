/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters long
 * - One uppercase letter
 * - One lowercase letter
 * - One number
 * - One special character
 * 
 * @param {string} password - The password to validate
 * @returns {{isValid: boolean, errors: string[]}} - Validation result with errors array
 */
export const validatePassword = (password) => {
    const errors = [];

    if (!password || typeof password !== 'string') {
        return {
            isValid: false,
            errors: ['Password is required']
        };
    }

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must include at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must include at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must include at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must include at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

