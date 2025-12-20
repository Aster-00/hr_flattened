const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = {
  async get(endpoint: string): Promise<any> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        credentials: 'include', // Include cookies for authentication
      });
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to backend server. Please ensure the backend is running on ${API_BASE_URL}`);
      }
      throw error;
    }

    const contentType = response.headers.get('content-type') || '';

    // Check for HTML responses first
    if (contentType.includes('text/html')) {
      throw new Error(`API endpoint not found. Please ensure the backend is running on ${API_BASE_URL}`);
    }

    if (!response.ok) {
      // Try to parse error as JSON, but handle empty responses
      const text = await response.text();
      if (text) {
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData?.message || `API Error: ${response.status}`);
        } catch {
          throw new Error(`API Error: ${response.status}`);
        }
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    }

    // Handle empty responses (204 No Content or empty body)
    if (response.status === 204 || !contentType.includes('application/json')) {
      return null;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON response from API. Please check ${API_BASE_URL}${endpoint}`);
    }
  },

  async post(endpoint: string, data: any): Promise<any> {
    console.log('API POST:', endpoint, data);
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
      });
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to backend server. Please ensure the backend is running on ${API_BASE_URL}`);
      }
      throw error;
    }

    const contentType = response.headers.get('content-type') || '';

    // Check for HTML responses first
    if (contentType.includes('text/html')) {
      throw new Error(`API endpoint not found. Please ensure the backend is running on ${API_BASE_URL}`);
    }

    if (!response.ok) {
      // Try to parse error as JSON, but handle empty responses
      const text = await response.text();
      if (text) {
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData?.message || `API Error: ${response.status}`);
        } catch {
          throw new Error(`API Error: ${response.status}`);
        }
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    }

    // Handle empty responses (204 No Content or empty body)
    if (response.status === 204 || !contentType.includes('application/json')) {
      return null;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON response from API. Please check ${API_BASE_URL}${endpoint}`);
    }
  },

  async patch(endpoint: string, data: any): Promise<any> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
      });
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to backend server. Please ensure the backend is running on ${API_BASE_URL}`);
      }
      throw error;
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `API Error: ${response.status}`);
    }
    return response.json();
  },

  async delete(endpoint: string): Promise<any> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache'
        },
        credentials: 'include', // Include cookies for authentication
      });
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to backend server. Please ensure the backend is running on ${API_BASE_URL}`);
      }
      throw error;
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `API Error: ${response.status}`);
    }
    // Handle 204 No Content responses
    if (response.status === 204) {
      return;
    }
    return response.json();
  },
};
