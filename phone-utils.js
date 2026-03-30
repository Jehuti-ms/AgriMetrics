// phone-utils.js
import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Normalize input to raw digits (canonical storage).
 * @param {string} input - User typed phone number
 * @returns {string} Digits only, max 15
 */
export function normalizePhone(input) {
  let digits = input.replace(/\D/g, '');
  return digits.length > 15 ? digits.substring(0, 15) : digits;
}

/**
 * Validate phone number against libphonenumber rules.
 * @param {string} input - Raw digits or formatted number
 * @param {string} defaultCountry - e.g. 'BB' for Barbados
 * @returns {boolean} True if valid, false otherwise
 */
export function validatePhone(input, defaultCountry = 'BB') {
  try {
    const phoneNumber = parsePhoneNumberFromString(input, defaultCountry);
    return phoneNumber ? phoneNumber.isValid() : false;
  } catch {
    return false;
  }
}

/**
 * Format phone number for display (international style).
 * @param {string} input - Raw digits or formatted number
 * @param {string} defaultCountry - e.g. 'BB'
 * @returns {string} Formatted number or original input
 */
export function formatPhone(input, defaultCountry = 'BB') {
  try {
    const phoneNumber = parsePhoneNumberFromString(input, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : input;
  } catch {
    return input;
  }
}
