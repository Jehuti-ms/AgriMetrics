// phone-utils.js
console.log('📞 Loading Phone Utilities...');

const PhoneUtils = {
    formatPhoneNumber(input) {
        if (!input) return '';
        let cleaned = input.toString().replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            cleaned = cleaned.substring(1);
        }
        if (cleaned.length === 10) {
            return `1 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
        }
        return input;
    },

    formatPhoneNumberTyping(value) {
        if (!value) return '';
        let cleaned = value.toString().replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            cleaned = cleaned.substring(1);
        }
        if (cleaned.length === 0) return '';
        if (cleaned.length <= 3) return `1 (${cleaned}`;
        if (cleaned.length <= 6) return `1 (${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
        return `1 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    },

    isValidPhoneNumber(phoneNumber) {
        if (!phoneNumber) return false;
        const cleaned = phoneNumber.toString().replace(/\D/g, '');
        return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
    },

    extractDigits(phoneNumber) {
        if (!phoneNumber) return '';
        return phoneNumber.toString().replace(/\D/g, '');
    },

    setupPhoneInput(inputElement) {
        if (!inputElement) return;
        inputElement.addEventListener('input', function(e) {
            const cursorPos = e.target.selectionStart;
            const oldLength = e.target.value.length;
            const formatted = PhoneUtils.formatPhoneNumberTyping(e.target.value);
            e.target.value = formatted;
            const newLength = formatted.length;
            const diff = newLength - oldLength;
            e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
        });
    }
};

window.PhoneUtils = PhoneUtils;
console.log('✅ PhoneUtils loaded successfully');
console.log('Test format:', PhoneUtils.formatPhoneNumber('1234567890'));
