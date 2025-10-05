import { useState, useEffect, useCallback, useMemo } from 'react';
import nasaApiService from '../services/nasaApi.js';

/**
 * Hook para obtener la lista de NEOs disponibles
 */
export function useNEOs() {
  const [neos, setNeos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNEOs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await nasaApiService.getBrowseIds();
      setNeos(data);
    } catch (err) {
      setError(err);
      console.error('Error fetching NEOs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNEOs();
  }, [fetchNEOs]);

  const refetch = useCallback(() => {
    fetchNEOs();
  }, [fetchNEOs]);

  return {
    neos,
    loading,
    error,
    refetch,
    hasError: error !== null,
    isSuccess: !loading && !error && neos.length > 0
  };
}

/**
 * Hook para obtener detalles de un NEO específico
 */
export function useNEODetails(asteroidId) {
  const [neoData, setNeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNEODetails = useCallback(async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await nasaApiService.getNEODetails(id);
      setNeoData(data);
    } catch (err) {
      setError(err);
      console.error(`Error fetching NEO details for ${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (asteroidId) {
      fetchNEODetails(asteroidId);
    }
  }, [asteroidId, fetchNEODetails]);

  const refetch = useCallback(() => {
    if (asteroidId) {
      fetchNEODetails(asteroidId);
    }
  }, [asteroidId, fetchNEODetails]);

  return {
    neoData,
    loading,
    error,
    refetch,
    hasError: error !== null,
    isSuccess: !loading && !error && neoData !== null
  };
}

/**
 * Hook para obtener NEOs por rango de fechas
 */
export function useNEOsByDateRange(startDate, endDate, autoFetch = true) {
  const [neosData, setNeosData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNEOsByDateRange = useCallback(async (start, end) => {
    if (!start || !end) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await nasaApiService.getNEOsByDateRange(start, end);
      setNeosData(data);
    } catch (err) {
      setError(err);
      console.error(`Error fetching NEOs for date range ${start} - ${end}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch && startDate && endDate) {
      fetchNEOsByDateRange(startDate, endDate);
    }
  }, [startDate, endDate, autoFetch, fetchNEOsByDateRange]);

  const refetch = useCallback(() => {
    if (startDate && endDate) {
      fetchNEOsByDateRange(startDate, endDate);
    }
  }, [startDate, endDate, fetchNEOsByDateRange]);

  return {
    neosData,
    loading,
    error,
    refetch,
    hasError: error !== null,
    isSuccess: !loading && !error && neosData !== null
  };
}

/**
 * Hook para calcular trayectorias de NEOs
 */
export function useTrajectoryCalculation() {
  const [trajectoryData, setTrajectoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateTrajectory = useCallback(async (neoId, options = {}) => {
    if (!neoId) return;
    
    setLoading(true);
    setError(null);
    setTrajectoryData(null);
    
    try {
      const data = await nasaApiService.calculateTrajectory(neoId, options);
      setTrajectoryData(data);
      return data;
    } catch (err) {
      setError(err);
      console.error(`Error calculating trajectory for ${neoId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearTrajectory = useCallback(() => {
    setTrajectoryData(null);
    setError(null);
  }, []);

  return {
    trajectoryData,
    loading,
    error,
    calculateTrajectory,
    clearTrajectory,
    hasError: error !== null,
    isSuccess: !loading && !error && trajectoryData !== null
  };
}

/**
 * Hook para obtener NEO completo con trayectoria
 */
export function useNEOWithTrajectory(neoId, trajectoryOptions = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNEOWithTrajectory = useCallback(async (id, options) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await nasaApiService.getNEOWithTrajectory(id, options);
      setData(result);
    } catch (err) {
      setError(err);
      console.error(`Error fetching NEO with trajectory for ${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear una versión estable de trajectoryOptions usando useMemo
  const stableTrajectoryOptions = useMemo(() => trajectoryOptions, [
    trajectoryOptions.position_km?.[0],
    trajectoryOptions.position_km?.[1], 
    trajectoryOptions.position_km?.[2],
    trajectoryOptions.velocity_kms?.[0],
    trajectoryOptions.velocity_kms?.[1],
    trajectoryOptions.velocity_kms?.[2],
    trajectoryOptions.density_kg_m3,
    trajectoryOptions.dt
  ]);
  
  useEffect(() => {
    if (neoId) {
      fetchNEOWithTrajectory(neoId, stableTrajectoryOptions);
    }
  }, [neoId, stableTrajectoryOptions, fetchNEOWithTrajectory]);

  const refetch = useCallback(() => {
    if (neoId) {
      fetchNEOWithTrajectory(neoId, stableTrajectoryOptions);
    }
  }, [neoId, stableTrajectoryOptions, fetchNEOWithTrajectory]);

  return {
    data,
    loading,
    error,
    refetch,
    hasError: error !== null,
    isSuccess: !loading && !error && data !== null
  };
}
