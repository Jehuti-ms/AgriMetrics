// ==================== TELEPHONE NUMBER FORMATTING ====================

// Format telephone number to: 1 (000) 000-0000
function formatPhoneNumber(input) {
    // Remove all non-digit characters
    let cleaned = input.toString().replace(/\D/g, '');
    
    // Remove leading 1 if present (country code)
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = cleaned.substring(1);
    }
    
    // Format: 1 (XXX) XXX-XXXX
    if (cleaned.length === 10) {
        const areaCode = cleaned.substring(0, 3);
        const prefix = cleaned.substring(3, 6);
        const lineNumber = cleaned.substring(6, 10);
        return `1 (${areaCode}) ${prefix}-${lineNumber}`;
    }
    
    // If not 10 digits, return original
    return input;
}

// Format while typing (for input fields)
function formatPhoneNumberTyping(value) {
    // Remove all non-digit characters
    let cleaned = value.toString().replace(/\D/g, '');
    
    // Remove leading 1 if present
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = cleaned.substring(1);
    }
    
    // Format as user types
    if (cleaned.length === 0) {
        return '';
    } else if (cleaned.length <= 3) {
        return `1 (${cleaned}`;
    } else if (cleaned.length <= 6) {
        const areaCode = cleaned.substring(0, 3);
        const prefix = cleaned.substring(3);
        return `1 (${areaCode}) ${prefix}`;
    } else {
        const areaCode = cleaned.substring(0, 3);
        const prefix = cleaned.substring(3, 6);
        const lineNumber = cleaned.substring(6, 10);
        return `1 (${areaCode}) ${prefix}-${lineNumber}`;
    }
}

// Validate phone number (returns true if valid 10-digit US number)
function isValidPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.toString().replace(/\D/g, '');
    // Check if it's 10 digits or 11 digits starting with 1
    if (cleaned.length === 10) return true;
    if (cleaned.length === 11 && cleaned.startsWith('1')) return true;
    return false;
}

// Extract digits only (for storage)
function extractPhoneDigits(phoneNumber) {
    return phoneNumber.toString().replace(/\D/g, '');
}

// Example usage:
// formatPhoneNumber('1234567890') => "1 (123) 456-7890"
// formatPhoneNumber('11234567890') => "1 (123) 456-7890"
// formatPhoneNumberTyping('123') => "1 (123"
// formatPhoneNumberTyping('123456') => "1 (123) 456"
// formatPhoneNumberTyping('1234567890') => "1 (123) 456-7890"
// isValidPhoneNumber('1234567890') => true
// isValidPhoneNumber('11234567890') => true
// isValidPhoneNumber('12345') => false
