// modules/date-utils.js - CORRECTED VERSION
console.log('📅 Loading DateUtils module...');

const DateUtils = {
    name: 'date-utils',
    
    initialize() {
        console.log('✅ DateUtils initialized');
        return true;
    },
    
    // Get today's date in YYYY-MM-DD format
    getToday() {
        const now = new Date();
        return this.formatDateForInput(now);
    },
    
    // Format date for input[type="date"] (YYYY-MM-DD)
    formatDateForInput(date) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    },
    
    // Format date for display (e.g., "Jan 15, 2024")
    formatDateForDisplay(date) {
        if (!date) return 'N/A';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    // Convert from storage format to display format
    fromStorageFormat(dateString) {
        return this.formatDateForInput(dateString);
    },
    
    // Convert to storage format (YYYY-MM-DD)
    toStorageFormat(dateString) {
        return this.formatDateForInput(dateString);
    },
    
    // Get readable month name
    getMonthName(monthIndex) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex] || '';
    },
    
    // Get days in month
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    },
    
    // Add days to a date
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    
    // Calculate difference in days between two dates
    getDaysDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    // Check if date is today
    isToday(date) {
        const today = this.getToday();
        const checkDate = this.formatDateForInput(date);
        return today === checkDate;
    },
    
    // Get start of week (Sunday)
    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    },
    
    // Get end of week (Saturday)
    getEndOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() + (6 - day);
        return new Date(d.setDate(diff));
    }
};

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


// Register globally
window.DateUtils = DateUtils;
console.log('✅ DateUtils module loaded');
