// Add this to your main app.js or create a date-utils.js file:
window.DateUtils = {
    // Get current date in YYYY-MM-DD format (timezone safe)
    getToday: () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Convert any date to YYYY-MM-DD for input fields
    toInputFormat: (dateString) => {
        if (!dateString) return '';
        
        // If already in correct format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        try {
            const date = new Date(dateString);
            // Adjust for timezone offset
            const adjustedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
            return adjustedDate.toISOString().split('T')[0];
        } catch (e) {
            console.error('Date conversion error:', e);
            return '';
        }
    },

    // Format for display (localized)
    toDisplayFormat: (dateString, options = {}) => {
        if (!dateString) return 'Invalid date';
        
        try {
            const date = new Date(dateString);
            const defaultOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC' // Use UTC to avoid timezone confusion
            };
            
            return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
        } catch (e) {
            return 'Invalid date';
        }
    },

    // Compare dates (date only, ignoring time)
    isSameDate: (date1, date2) => {
        if (!date1 || !date2) return false;
        
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    },

    // Add days to a date
    addDays: (dateString, days) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
};
