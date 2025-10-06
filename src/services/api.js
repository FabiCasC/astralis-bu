// API Configuration
const API_BASE_URL = "https://mrkite-astralis.hf.space";

// Custom error handling class
class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

// Helper function to make HTTP requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log(`🌐 Making request to: ${url}`);
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`❌ API Error ${response.status}:`, errorData);
      throw new APIError(
        errorData?.message ||
          `Error ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    console.log(`✅ API Success:`, data);
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network or parsing error
    console.error(`🚨 Network/Connection Error:`, error);
    throw new APIError("Connection error with server", 0, {
      originalError: error.message,
      url: url
    });
  }
}

// Function to build query parameters
function buildQueryParams(params) {
  const queryString = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      queryString.append(key, value);
    }
  });

  return queryString.toString();
}

export { APIError, makeRequest, buildQueryParams, API_BASE_URL };
