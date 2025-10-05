import { makeRequest, buildQueryParams, APIError } from './api.js';

/**
 * Servicio para interactuar con la NASA API a través del backend Flask
 */
class NASAApiService {
  
  /**
   * Obtiene la lista de NEOs disponibles
   * @returns {Promise<Array>} Lista de NEOs con id y name
   */
  async getBrowseIds() {
    try {
      const response = await makeRequest('/nasa/get_browse_ids');
      return response;
    } catch (error) {
      console.error('Error obteniendo IDs de NEOs:', error);
      throw new APIError(
        'No se pudieron obtener los NEOs disponibles',
        error.status || 500,
        error.data
      );
    }
  }

  /**
   * Obtiene datos completos de un NEO específico
   * @param {string} asteroidId - ID del asteroide
   * @returns {Promise<Object>} Datos completos del NEO
   */
  async getNEODetails(asteroidId) {
    if (!asteroidId) {
      throw new APIError('ID del asteroide es requerido', 400);
    }

    try {
      const params = buildQueryParams({ asteroid_id: asteroidId });
      const response = await makeRequest(`/nasa/neo?${params}`);
      return response;
    } catch (error) {
      console.error(`Error obteniendo detalles del NEO ${asteroidId}:`, error);
      throw new APIError(
        `No se pudieron obtener los detalles del asteroide ${asteroidId}`,
        error.status || 500,
        error.data
      );
    }
  }

  /**
   * Obtiene NEOs por rango de fechas
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Datos de NEOs en el rango especificado
   */
  async getNEOsByDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new APIError('start_date y end_date son requeridos', 400);
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new APIError('Las fechas deben estar en formato YYYY-MM-DD', 400);
    }

    try {
      const params = buildQueryParams({ 
        start_date: startDate, 
        end_date: endDate 
      });
      const response = await makeRequest(`/nasa/feed?${params}`);
      return response;
    } catch (error) {
      console.error(`Error obteniendo NEOs para ${startDate} - ${endDate}:`, error);
      throw new APIError(
        `No se pudieron obtener los NEOs para el rango ${startDate} - ${endDate}`,
        error.status || 500,
        error.data
      );
    }
  }

  /**
   * Calcula la trayectoria de un NEO
   * @param {string} neoId - ID del NEO
   * @param {Object} options - Opciones para el cálculo
   * @param {Array<number>} options.position_km - Posición inicial [x, y, z] en km (REQUERIDO)
   * @param {Array<number>} options.velocity_kms - Velocidad inicial [vx, vy, vz] en km/s (REQUERIDO)
   * @param {number} options.density_kg_m3 - Densidad en kg/m³ (opcional)
   * @param {number} options.dt - Paso de tiempo (opcional, default: 0.5)
   * @returns {Promise<Object>} Trayectoria calculada con datos de impacto
   */
  async calculateTrajectory(neoId, options = {}) {
    if (!neoId) {
      throw new APIError('ID del NEO es requerido', 400);
    }

    // Validar parámetros requeridos
    if (!options.position_km || !Array.isArray(options.position_km) || options.position_km.length !== 3) {
      throw new APIError('position_km es requerido y debe ser un array de 3 elementos [x, y, z]', 400);
    }

    if (!options.velocity_kms || !Array.isArray(options.velocity_kms) || options.velocity_kms.length !== 3) {
      throw new APIError('velocity_kms es requerido y debe ser un array de 3 elementos [vx, vy, vz]', 400);
    }

    try {
      const params = {
        position_km: JSON.stringify(options.position_km),
        velocity_kms: JSON.stringify(options.velocity_kms)
      };
      
      // Agregar parámetros opcionales
      if (options.density_kg_m3 !== undefined) {
        params.density_kg_m3 = options.density_kg_m3;
      }
      if (options.dt !== undefined) {
        params.dt = options.dt;
      }

      const queryString = buildQueryParams(params);
      const endpoint = `/nasa/trajectory/${neoId}?${queryString}`;
      
      const response = await makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error(`Error calculando trayectoria para NEO ${neoId}:`, error);
      throw new APIError(
        `No se pudo calcular la trayectoria del NEO ${neoId}`,
        error.status || 500,
        error.data
      );
    }
  }

  /**
   * Obtiene datos de un NEO y calcula su trayectoria
   * @param {string} neoId - ID del NEO
   * @param {Object} trajectoryOptions - Opciones para el cálculo de trayectoria
   * @returns {Promise<Object>} Objeto con datos del NEO y su trayectoria
   */
  async getNEOWithTrajectory(neoId, trajectoryOptions = {}) {
    try {
      const [neoData, trajectory] = await Promise.all([
        this.getNEODetails(neoId),
        this.calculateTrajectory(neoId, trajectoryOptions)
      ]);

      return {
        neo: neoData,
        trajectory: trajectory,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error obteniendo NEO con trayectoria ${neoId}:`, error);
      throw new APIError(
        `No se pudieron obtener los datos completos del NEO ${neoId}`,
        error.status || 500,
        error.data
      );
    }
  }
}

// Crear instancia única del servicio
const nasaApiService = new NASAApiService();

export default nasaApiService;
export { NASAApiService };
