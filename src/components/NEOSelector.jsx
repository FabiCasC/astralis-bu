import React, { useState } from 'react';
import { useNEOs, useNEODetails, useTrajectoryCalculation } from '../hooks/useNEOs.js';
import TrajectoryParameters from './TrajectoryParameters.jsx';
import './NEOSelector.css';

function NEOSelector({ onNEOSelected, onTrajectoryCalculated, onParametersChange }) {
  const [selectedNEOId, setSelectedNEOId] = useState('');
  const [trajectoryParams, setTrajectoryParams] = useState({
    position_km: [1000, 2000, 3000],
    velocity_kms: [10, 20, 30],
    density_kg_m3: 2500,
    dt: 0.5
  });

  // Datos de ejemplo para NEOs si no hay datos reales
  const exampleNEOs = [
    { id: '2000433', name: '433 Eros' },
    { id: '2001862', name: '1862 Apollo' },
    { id: '2001221', name: '1221 Amor' },
    { id: '2004179', name: '4179 Toutatis' },
    { id: '20025143', name: '25143 Itokawa' },
    { id: '20065803', name: '65803 Didymos' },
    { id: '200101955', name: '101955 Bennu' },
    { id: '200162173', name: '162173 Ryugu' }
  ];

  // Hooks para obtener datos
  const { neos, loading: neosLoading, error: neosError } = useNEOs();
  const { neoData, loading: detailsLoading, error: detailsError } = useNEODetails(selectedNEOId);
  const { trajectoryData, loading: trajectoryLoading, error: trajectoryError, calculateTrajectory } = useTrajectoryCalculation();

  const handleNEOChange = (event) => {
    const neoId = event.target.value;
    setSelectedNEOId(neoId);
    
    // Cargar parámetros por defecto basados en el NEO seleccionado
    if (neoId) {
      const defaultParams = generateDefaultParams(neoId);
      setTrajectoryParams(defaultParams);
      if (onParametersChange) {
        onParametersChange(defaultParams);
      }
    }
    
    if (onNEOSelected) {
      onNEOSelected(neoId);
    }
  };

  // Generar parámetros por defecto basados en el NEO
  const generateDefaultParams = (neoId) => {
    const baseParams = {
      position_km: [1000, 2000, 3000],
      velocity_kms: [10, 20, 30],
      density_kg_m3: 2500,
      dt: 0.5
    };

    // Variar parámetros según el NEO para simular diferentes tipos
    const variations = {
      '2000433': { position_km: [800, 1500, 2200], velocity_kms: [12, 18, 25], density_kg_m3: 2700 },
      '2001862': { position_km: [1200, 2500, 3800], velocity_kms: [8, 15, 22], density_kg_m3: 2300 },
      '2001221': { position_km: [900, 1800, 2700], velocity_kms: [11, 19, 28], density_kg_m3: 2600 },
      '2004179': { position_km: [1500, 3000, 4500], velocity_kms: [7, 14, 21], density_kg_m3: 2100 },
      '20025143': { position_km: [600, 1200, 1800], velocity_kms: [15, 25, 35], density_kg_m3: 2900 },
      '20065803': { position_km: [1100, 2200, 3300], velocity_kms: [9, 17, 24], density_kg_m3: 2400 },
      '200101955': { position_km: [700, 1400, 2100], velocity_kms: [13, 21, 29], density_kg_m3: 2800 },
      '200162173': { position_km: [1000, 2000, 3000], velocity_kms: [10, 20, 30], density_kg_m3: 2500 }
    };

    return { ...baseParams, ...(variations[neoId] || {}) };
  };

  const handleCalculateTrajectory = async () => {
    if (!selectedNEOId) {
      alert('Por favor selecciona un NEO primero');
      return;
    }

    try {
      const trajectory = await calculateTrajectory(selectedNEOId, trajectoryParams);
      if (onTrajectoryCalculated) {
        onTrajectoryCalculated(trajectory);
      }
      // Las tarjetas de impacto se mostrarán automáticamente en el componente principal
    } catch (error) {
      console.error('Error calculando trayectoria:', error);
      alert('Error calculando la trayectoria. Inténtalo de nuevo.');
    }
  };



  const handleParametersChange = (newParams) => {
    setTrajectoryParams(newParams);
    // Pasar los parámetros al componente padre para la visualización
    if (onParametersChange) {
      onParametersChange(newParams);
    }
  };


  return (
    <div className="neo-selector">
      <h3 className="neo-selector-title">Select NEO</h3>
      
      {/* NEO Selector */}
      <div className="neo-selector-section">
        <label htmlFor="neo-select" className="neo-selector-label">
          Available NEOs:
        </label>
        {neosLoading ? (
          <div className="loading-spinner">Loading NEOs...</div>
        ) : neosError || !neos || neos.length === 0 ? (
          <div className="neo-examples">
            <p className="examples-info">📡 Using sample data while connecting to server...</p>
            <select
              id="neo-select"
              value={selectedNEOId}
              onChange={handleNEOChange}
              className="neo-selector-select"
            >
              <option value="">Selecciona un NEO</option>
              {exampleNEOs.map(neo => (
                <option key={neo.id} value={neo.id}>
                  {neo.name} (ID: {neo.id})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <select
            id="neo-select"
            value={selectedNEOId}
            onChange={handleNEOChange}
            className="neo-selector-select"
          >
            <option value="">Selecciona un NEO</option>
            {neos.map(neo => (
              <option key={neo.id} value={neo.id}>
                {neo.name} (ID: {neo.id})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selected NEO details */}
      {selectedNEOId && (
        <div className="neo-selector-section">
          <h4 className="neo-details-title">NEO Details</h4>
          {detailsLoading ? (
            <div className="loading-spinner">Loading details...</div>
          ) : detailsError ? (
            <div className="error-message">
              Error: {detailsError.message}
            </div>
          ) : neoData ? (
            <div className="neo-details">
              <div className="neo-detail-item">
                <strong>Name:</strong> {neoData.name}
              </div>
              <div className="neo-detail-item">
                <strong>ID:</strong> {neoData.id}
              </div>
              {neoData.estimated_diameter && (
                <div className="neo-detail-item">
                  <strong>Estimated diameter:</strong> 
                  {neoData.estimated_diameter.kilometers?.estimated_diameter_min?.toFixed(2)} - 
                  {neoData.estimated_diameter.kilometers?.estimated_diameter_max?.toFixed(2)} km
                </div>
              )}
              {neoData.is_potentially_hazardous_asteroid !== undefined && (
                <div className="neo-detail-item">
                  <strong>Potentially hazardous:</strong> 
                  {neoData.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Trajectory parameters */}
      {selectedNEOId && (
        <div className="neo-selector-section">
          <TrajectoryParameters 
            parameters={trajectoryParams}
            onParametersChange={handleParametersChange}
          />
          
          {/* Button to calculate trajectory */}
          <div className="trajectory-controls">
            <button
              onClick={handleCalculateTrajectory}
              disabled={trajectoryLoading}
              className="calculate-trajectory-btn"
            >
              {trajectoryLoading ? '🔄 Calculating...' : '🚀 Calculate Trajectory'}
            </button>
            
          </div>

        </div>
      )}

      {/* Trajectory results */}
      {trajectoryError && (
        <div className="error-message">
          Error calculating trajectory: {trajectoryError.message}
        </div>
      )}

      {trajectoryData && (
        <div className="neo-selector-section">
          <h4 className="trajectory-results-title">Trajectory Results</h4>
          <div className="trajectory-results">
            <div className="trajectory-result-item">
              <strong>Calculated points:</strong> {trajectoryData.trajectory?.length || 0}
            </div>
            {trajectoryData.impact_data && (
              <div className="trajectory-result-item">
                <strong>Impact detected:</strong> Yes
              </div>
            )}
            {trajectoryData.impact_data?.impact_energy && (
              <div className="trajectory-result-item">
                <strong>Impact energy:</strong> {trajectoryData.impact_data.impact_energy.toExponential(2)} J
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default NEOSelector;
