import { API_BASE_URL } from '../config/apiConfig';

const API_BASE = `${API_BASE_URL}/inquiries`;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Fetch all customer inquiries directed to the authenticated vendor.
 * Calls GET /api/inquiries/vendor/my-inquiries
 */
export async function getVendorInquiries() {
  const response = await fetch(`${API_BASE}/vendor/my-inquiries`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to load vendor inquiries';
    try {
      const errData = await response.json();
      errorMsg = errData.message || errorMsg;
    } catch {
      // response not JSON
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}

/**
 * Send a reply to a customer inquiry and transition status to 'Replied'.
 * Calls PATCH /api/inquiries/{inquiryId}/reply
 * @param {number|string} inquiryId 
 * @param {string|object} responseData Either string message or { replyMessage: '...' }
 */
export async function replyToInquiry(inquiryId, responseData) {
  const body = typeof responseData === 'string'
    ? { replyMessage: responseData }
    : {
        replyMessage: responseData?.replyMessage || responseData?.message || responseData?.vendorReply || '',
        ...responseData,
      };

  const response = await fetch(`${API_BASE}/${inquiryId}/reply`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to send reply to inquiry';
    try {
      const errData = await response.json();
      errorMsg = errData.message || errorMsg;
    } catch {
      // response not JSON
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}

/**
 * Updates inquiry status (Pending / Replied / Closed / Responded).
 * Calls PATCH /api/inquiries/{inquiryId}/status
 */
export async function updateInquiryStatus(inquiryId, status) {
  const response = await fetch(`${API_BASE}/${inquiryId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to update inquiry status';
    try {
      const errData = await response.json();
      errorMsg = errData.message || errorMsg;
    } catch {
      // response not JSON
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}
