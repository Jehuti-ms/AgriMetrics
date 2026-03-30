// phone-utils.js
console.log('📞 Loading Phone Utilities...');

const PhoneUtils = {
  normalizePhone(input) {
    if (!input) return '';
    let digits = input.replace(/\D/g, '');
    return digits.length > 15 ? digits.substring(0, 15) : digits;
  },

  validatePhone(input) {
    if (!input) return false;
    const digits = input.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  },

  formatPhone(input, defaultCountry = 'BB') {
    if (!input) return '';
    const digits = input.replace(/\D/g, '');
    return digits ? `+${digits}` : '';
  }
};

window.PhoneUtils = PhoneUtils;
console.log('✅ PhoneUtils loaded successfully');
