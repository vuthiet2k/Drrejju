export const convertToInternational = function (phone, countryCode = '84') {
  if (!phone) return '';

  // Remove any spaces, dashes, or formatting
  const cleaned = phone.replace(/[^0-9]/g, '');

  // If it starts with 0, replace with country code
  if (cleaned.startsWith('0')) {
    return countryCode + cleaned.slice(1);
  }

  // If already in international format
  if (cleaned.startsWith(countryCode)) {
    return cleaned;
  }

  // Fallback: just return cleaned number
  return cleaned;
}