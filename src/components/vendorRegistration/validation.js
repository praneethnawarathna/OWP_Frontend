/**
 * validation.js — Pure validation functions for Vendor Registration Wizard
 * Mirrors backend Section A validation rules.
 */

// Sri Lankan phone number pattern (+94XXXXXXXXX or 0XXXXXXXXX)
const PHONE_REGEX = /^(\+94|0)\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Strips whitespace and hyphens from phone numbers
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/[\s-]/g, '');
}

/**
 * Sanitizes raw phone input in real-time (use in onChange handlers).
 * Keeps only digits, preserving one leading '+' if the original started with one.
 * Does NOT cap length — the existing PHONE_REGEX still enforces format on blur/submit.
 */
export function sanitizePhoneInput(value) {
  if (!value) return '';
  const str = String(value);
  const hasPlus = str.startsWith('+');
  const digits = str.replace(/\D/g, '');
  return hasPlus ? '+' + digits : digits;
}

/**
 * Validates Sri Lankan phone number format
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  return PHONE_REGEX.test(normalized);
}

/**
 * Validates email format and length
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  return trimmed.length <= 255 && EMAIL_REGEX.test(trimmed);
}

/**
 * Calculates password strength and returns rating metadata
 */
export function calculatePasswordStrength(password) {
  if (!password) {
    return { score: 0, label: 'None', color: 'bg-gray-200', textClass: 'text-gray-400' };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { score: 1, label: 'Weak', color: 'bg-rose-500', textClass: 'text-rose-600' };
  }
  if (score === 3 || score === 4) {
    return { score: 2, label: 'Medium', color: 'bg-amber-500', textClass: 'text-amber-600' };
  }
  return { score: 3, label: 'Strong', color: 'bg-emerald-500', textClass: 'text-emerald-600' };
}

/**
 * Verifies if password fulfills all backend requirements
 */
export function isValidPassword(password) {
  if (!password || password.length < 8 || password.length > 128) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  return hasUpper && hasLower && hasDigit;
}

/**
 * Step 1: Account Step validation
 */
export function validateAccountStep(data, isGoogleFlow = false) {
  const errors = {};

  // Full Name
  const fullName = data.fullName?.trim() || '';
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  } else if (fullName.length > 100) {
    errors.fullName = 'Full name cannot exceed 100 characters.';
  }

  // Email
  const email = data.email?.trim() || '';
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  // Password & Confirmation (only required if not Google sign-in flow)
  if (!isGoogleFlow) {
    const password = data.password || '';
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!isValidPassword(password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
    }

    const confirmPassword = data.confirmPassword || '';
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }

  // Phone Number
  const phoneNumber = data.phoneNumber?.trim() || '';
  if (!phoneNumber) {
    errors.phoneNumber = 'Phone number is required.';
  } else if (!isValidPhone(phoneNumber)) {
    errors.phoneNumber = 'Enter a valid Sri Lankan number (e.g. 0771234567 or +94771234567).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Step 2: Business Step validation
 */
export function validateBusinessStep(data, _options = {}) {
  const errors = {};

  // Business Name
  const businessName = data.businessName?.trim() || '';
  if (!businessName) {
    errors.businessName = 'Business name is required.';
  } else if (businessName.length < 2) {
    errors.businessName = 'Business name must be at least 2 characters.';
  } else if (businessName.length > 150) {
    errors.businessName = 'Business name cannot exceed 150 characters.';
  }

  // Business Type
  const businessType = data.businessType?.trim() || '';
  if (!businessType) {
    errors.businessType = 'Please select a business structure.';
  }

  // Category
  const category = data.category?.trim() || '';
  if (!category) {
    errors.category = 'Please select your primary wedding category.';
  }

  // Tagline (Optional)
  const tagline = data.tagline?.trim() || '';
  if (tagline.length > 250) {
    errors.tagline = 'Tagline cannot exceed 250 characters.';
  }

  // Description
  const description = data.description?.trim() || '';
  if (!description) {
    errors.description = 'Business description is required.';
  } else if (description.length < 50) {
    errors.description = `Description must be at least 50 characters (currently ${description.length}).`;
  } else if (description.length > 500) {
    errors.description = `Description cannot exceed 500 characters (currently ${description.length}).`;
  }

  // Years in Business (Optional)
  if (data.yearsInBusiness !== '' && data.yearsInBusiness !== null && data.yearsInBusiness !== undefined) {
    const years = Number(data.yearsInBusiness);
    if (isNaN(years) || !Number.isInteger(years) || years < 0 || years > 80) {
      errors.yearsInBusiness = 'Years in business must be a whole number between 0 and 80.';
    }
  }

  // Business Registration Number (Optional)
  const brn = data.businessRegistrationNumber?.trim() || '';
  if (brn.length > 50) {
    errors.businessRegistrationNumber = 'Business registration number cannot exceed 50 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Step 3: Contact & Location Step validation
 */
export function validateContactLocationStep(data, _options = {}) {
  const errors = {};

  // Business Email
  const businessEmail = data.businessEmail?.trim() || '';
  if (!businessEmail) {
    errors.businessEmail = 'Business inquiry email is required.';
  } else if (!isValidEmail(businessEmail)) {
    errors.businessEmail = 'Please enter a valid business email.';
  }

  // Contact Number
  const contactNumber = data.contactNumber?.trim() || '';
  if (!contactNumber) {
    errors.contactNumber = 'Primary contact number is required.';
  } else if (!isValidPhone(contactNumber)) {
    errors.contactNumber = 'Enter a valid Sri Lankan phone number (e.g. 0771234567).';
  }

  // Alternate Phone Number (Optional)
  const altPhone = data.altPhoneNumber?.trim() || '';
  if (altPhone && !isValidPhone(altPhone)) {
    errors.altPhoneNumber = 'Alternate phone number must be a valid Sri Lankan number.';
  }

  // Website URL (Optional)
  const website = data.websiteUrl?.trim() || '';
  if (website) {
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      errors.websiteUrl = 'Website URL must start with http:// or https://';
    } else if (website.length > 500) {
      errors.websiteUrl = 'Website URL cannot exceed 500 characters.';
    }
  }

  // Address
  const address = data.address?.trim() || '';
  if (!address) {
    errors.address = 'Business address is required.';
  } else if (address.length > 300) {
    errors.address = 'Address cannot exceed 300 characters.';
  }

  // City
  const city = data.city?.trim() || '';
  if (!city) {
    errors.city = 'City is required.';
  } else if (city.length > 100) {
    errors.city = 'City cannot exceed 100 characters.';
  }

  // District
  const district = data.district?.trim() || '';
  if (!district) {
    errors.district = 'Please select a district.';
  }

  // Postal Code (Optional)
  const postalCode = data.postalCode?.trim() || '';
  if (postalCode.length > 30) {
    errors.postalCode = 'Postal code cannot exceed 30 characters.';
  }

  // Service Areas
  const serviceAreas = Array.isArray(data.serviceAreas) ? data.serviceAreas : [];
  if (serviceAreas.length === 0) {
    errors.serviceAreas = 'Please select at least one district you provide services in.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Step 4: Review & Submit Step validation
 */
export function validateReviewStep(data) {
  const errors = {};

  if (!data.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions to complete registration.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Field-to-step mapping for navigating to errors
 */
const FIELD_STEP_INDEX = {
  // Step 0: Account
  fullname: 0,
  email: 0,
  password: 0,
  confirmpassword: 0,
  phonenumber: 0,
  googleidtoken: 0,

  // Step 1: Business
  businessname: 1,
  businesstype: 1,
  category: 1,
  tagline: 1,
  description: 1,
  yearsinbusiness: 1,
  businessregistrationnumber: 1,

  // Step 2: Contact & Location
  businessemail: 2,
  contactnumber: 2,
  altphonenumber: 2,
  websiteurl: 2,
  address: 2,
  city: 2,
  district: 2,
  postalcode: 2,
  serviceareas: 2,

  // Step 3: Review & Terms
  acceptterms: 3,
};

/**
 * Finds the wizard step index (0-3) for a given error field name
 */
export function getStepForField(fieldName) {
  if (!fieldName) return 0;
  const normalized = String(fieldName).toLowerCase().replace(/[^a-z]/g, '');
  return FIELD_STEP_INDEX[normalized] ?? 0;
}
