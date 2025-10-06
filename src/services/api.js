// Configuración del API
const API_BASE_URL = "http://127.0.0.1:5000";

// Clase para manejar errores personalizados
class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

// Función helper para hacer peticiones HTTP
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
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new APIError(
        errorData?.message ||
          `Error ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Error de red o parsing
    throw new APIError("Error de conexión con el servidor", 0, {
      originalError: error.message,
    });
  }
}

// Función para construir query parameters
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
