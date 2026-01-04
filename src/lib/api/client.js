/**
 * Centralized API client with automatic org-slug header injection
 * Provides consistent error handling and request/response interceptors
 * 
 * Usage:
 * import { api } from '@/src/lib/api/client';
 * const data = await api.get('/api/sales', { orgSlug });
 * await api.post('/api/sales', saleData, { orgSlug });
 */

const DEFAULT_TIMEOUT = 30000; // 30 seconds

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  let data;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch (error) {
    throw new ApiError('Invalid response format', response.status);
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error || data?.message || `HTTP ${response.status}`,
      response.status,
      data
    );
  }

  return data;
}

export const api = {
  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    const { orgSlug, timeout, ...fetchOptions } = options;
    const headers = {
      ...fetchOptions.headers,
    };

    if (orgSlug) {
      headers['x-org-slug'] = orgSlug;
    }

    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          ...fetchOptions,
          method: 'GET',
          headers,
        },
        timeout
      );

      return await handleResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.message || 'Network error',
        0,
        { originalError: error }
      );
    }
  },

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    const { orgSlug, timeout, ...fetchOptions } = options;
    const headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (orgSlug) {
      headers['x-org-slug'] = orgSlug;
    }

    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          ...fetchOptions,
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        },
        timeout
      );

      return await handleResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.message || 'Network error',
        0,
        { originalError: error }
      );
    }
  },

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    const { orgSlug, timeout, ...fetchOptions } = options;
    const headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (orgSlug) {
      headers['x-org-slug'] = orgSlug;
    }

    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          ...fetchOptions,
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        },
        timeout
      );

      return await handleResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.message || 'Network error',
        0,
        { originalError: error }
      );
    }
  },

  /**
   * DELETE request
   */
  async delete(endpoint, data, options = {}) {
    const { orgSlug, timeout, ...fetchOptions } = options;
    const headers = {
      ...fetchOptions.headers,
    };

    if (orgSlug) {
      headers['x-org-slug'] = orgSlug;
    }

    const requestOptions = {
      ...fetchOptions,
      method: 'DELETE',
      headers,
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetchWithTimeout(
        endpoint,
        requestOptions,
        timeout
      );

      return await handleResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.message || 'Network error',
        0,
        { originalError: error }
      );
    }
  },
};

export { ApiError };

