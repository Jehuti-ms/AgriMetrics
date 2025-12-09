// js/utils/date-utils.js - FIXED FOR GMT-4 TIMEZONE
console.log('📅 Loading DateUtils (GMT-4 Fixed)...');

const DateUtils = {
    // Get today's date in YYYY-MM-DD format (Bolivia GMT-4 timezone)
    getToday() {
        const now = new Date();
        
        // For GMT-4: Use LOCAL date methods, not UTC
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        
        const result = `${year}-${month}-${day}`;
        console.log('📅 DateUtils.getToday():', result, {
            localTime: now.toString(),
            timezoneOffset: now.getTimezoneOffset(),
            getDate: now.getDate(),
            getUTCDate: now.getUTCDate()
        });
        
        return result;
    },

    // Convert any date to YYYY-MM-DD for input fields (GMT-4 timezone safe)
    toInputFormat(dateString) {
        if (!dateString) return '';
        
        console.log('📅 DateUtils.toInputFormat input:', dateString);
        
        // If it's already in YYYY-MM-DD format from storage
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            // Parse it as midnight in LOCAL timezone
            // Important: Adding 'T00:00:00' makes JavaScript use local timezone
            const date = new Date(dateString + 'T00:00:00');
            
            // Get LOCAL date components (for GMT-4)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            const result = `${year}-${month}-${day}`;
            
            console.log('📅 DateUtils.toInputFormat result:', result, {
                original: dateString,
                dateObject: date.toString(),
                getDate: date.getDate(),
                getUTCDate: date.getUTCDate(),
                timezoneOffset: date.getTimezoneOffset()
            });
            
            return result;
        }
        
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (e) {
            console.error('Date conversion error:', e);
            return '';
        }
    },

    // Convert input date to storage format (YYYY-MM-DD as UTC midnight)
    toStorageFormat(dateString) {
        if (!dateString) return '';
        
        console.log('📅 DateUtils.toStorageFormat input:', dateString);
        
        // Input is YYYY-MM-DD (local date in GMT-4)
        // We need to store it as YYYY-MM-DD interpreted as UTC midnight
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            // Create date at midnight LOCAL time
            const localMidnight = new Date(dateString + 'T00:00:00');
            
            // Convert to UTC
            const utcYear = localMidnight.getUTCFullYear();
            const utcMonth = String(localMidnight.getUTCMonth() + 1).padStart(2, '0');
            const utcDay = String(localMidnight.getUTCDate()).padStart(2, '0');
            
            const result = `${utcYear}-${utcMonth}-${utcDay}`;
            
            console.log('📅 DateUtils.toStorageFormat result:', result, {
                input: dateString,
                localMidnight: localMidnight.toString(),
                localGetDate: localMidnight.getDate(),
                utcGetDate: localMidnight.getUTCDate(),
                timezoneOffset: localMidnight.getTimezoneOffset()
            });
            
            return result;
        }
        
        try {
            const date = new Date(dateString);
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (e) {
            console.error('Date storage conversion error:', e);
            return '';
        }
    },

    // Format for display (localized for GMT-4)
    toDisplayFormat(dateString, options = {}) {
        if (!dateString) return 'Invalid date';
        
        try {
            const date = new Date(dateString);
            const defaultOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC' // Force UTC to avoid timezone confusion in display
            };
            
            const result = date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
            
            console.log('📅 DateUtils.toDisplayFormat:', {
                input: dateString,
                output: result,
                dateObject: date.toString()
            });
            
            return result;
        } catch (e) {
            return 'Invalid date';
        }
    },

    // Add days to a date (timezone aware)
    addDays(dateString, days) {
        if (!dateString) return '';
        
        try {
            // Parse as local date
            const date = new Date(dateString + 'T00:00:00');
            date.setDate(date.getDate() + days);
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        } catch (e) {
            console.error('Date addDays error:', e);
            return '';
        }
    },

    // Compare dates (date only, ignoring time - GMT-4 aware)
    isSameDate(date1, date2) {
        if (!date1 || !date2) return false;
        
        // Convert both to input format for comparison
        const d1 = this.toInputFormat(date1);
        const d2 = this.toInputFormat(date2);
        
        return d1 === d2;
    },

    // Get timezone info
    getTimezoneInfo() {
        const now = new Date();
        return {
            offset: now.getTimezoneOffset(),
            offsetHours: now.getTimezoneOffset() / 60,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            localTime: now.toString(),
            utcTime: now.toISOString()
        };
    },

    // Debug function
    debugDate(dateString) {
        console.log('=== DATE DEBUG ===');
        console.log('Input:', dateString);
        
        if (dateString) {
            const date = new Date(dateString + (dateString.includes('T') ? '' : 'T00:00:00'));
            console.log('Date object:', date.toString());
            console.log('ISO:', date.toISOString());
            console.log('getDate() [LOCAL]:', date.getDate());
            console.log('getUTCDate() [UTC]:', date.getUTCDate());
            console.log('Timezone offset:', date.getTimezoneOffset(), 'minutes');
            console.log('toInputFormat:', this.toInputFormat(dateString));
            console.log('toStorageFormat:', this.toStorageFormat(dateString));
            console.log('toDisplayFormat:', this.toDisplayFormat(dateString));
        }
        
        console.log('Today:', this.getToday());
        console.log('Timezone info:', this.getTimezoneInfo());
        console.log('=== END DEBUG ===');
    }
};

// Make it globally available
window.DateUtils = DateUtils;
console.log('✅ DateUtils loaded for GMT-4 timezone');
