/**
 * registrationApi.js — API client for Vendor Registration
 * Backend: ASP.NET Core Web API (VendorRegistrationController)
 */

const API_BASE = 'http://localhost:5131/api';

/**
 * Loads registration options (categories, districts, business types)
 * GET /api/VendorRegistration/options
 */
export async function fetchOptions() {
  try {
    const response = await fetch(`${API_BASE}/VendorRegistration/options`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load registration options (HTTP ${response.status})`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the server. Please check your connection or ensure the backend is running.');
    }
    throw err;
  }
}

/**
 * Submits the vendor registration payload
 * POST /api/VendorRegistration/register
 *
 * @param {Object} payload VendorRegistrationRequest
 * @returns {Promise<{ ok: boolean, status: number, data?: any, error?: any }>}
 */
export async function submitRegistration(payload) {
  try {
    const response = await fetch(`${API_BASE}/VendorRegistration/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        data,
      };
    }

    // Handle structured HTTP errors
    return {
      ok: false,
      status: response.status,
      data,
      error: {
        status: response.status,
        code: data?.code,
        field: data?.field,
        message: data?.message || data?.detail || data?.title || 'Registration request failed.',
        errors: data?.errors || null, // ASP.NET ValidationProblemDetails
      },
    };
  } catch {
    return {
      ok: false,
      status: 0,
      error: {
        status: 0,
        message: 'Network error: Unable to connect to the backend server. Please verify the service is running and try again.',
      },
    };
  }
}

export { API_BASE };
