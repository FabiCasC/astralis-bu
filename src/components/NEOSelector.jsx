import React, { useState } from 'react';
import { useNEOs, useNEODetails, useTrajectoryCalculation } from '../hooks/useNEOs.js';
import TrajectoryParameters from './TrajectoryParameters.jsx';
import ImpactScenarios from './ImpactScenarios.jsx';
import './NEOSelector.css';

function NEOSelector({ onNEOSelected, onTrajectoryCalculated, onParametersChange }) {
  const [selectedNEOId, setSelectedNEOId] = useState('');
  const [showImpactScenarios, setShowImpactScenarios] = useState(false);
  const [trajectoryParams, setTrajectoryParams] = useState({
    position_km: [1000, 2000, 3000],
    velocity_kms: [10, 20, 30],
    density_kg_m3: 2500,
    dt: 0.5
  });

  // Hooks para obtener datos
  const { neos, loading: neosLoading, error: neosError } = useNEOs();
  const { neoData, loading: detailsLoading, error: detailsError } = useNEODetails(selectedNEOId);
  const { trajectoryData, loading: trajectoryLoading, error: trajectoryError, calculateTrajectory } = useTrajectoryCalculation();

  const handleNEOChange = (event) => {
    const neoId = event.target.value;
    setSelectedNEOId(neoId);
    if (onNEOSelected) {
      onNEOSelected(neoId);
    }
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
    } catch (error) {
      console.error('Error calculando trayectoria:', error);
    }
  };

  const handleParametersChange = (newParams) => {
    setTrajectoryParams(newParams);
    // Pasar los parámetros al componente padre para la visualización
    if (onParametersChange) {
      onParametersChange(newParams);
    }
  };

  const handleApplyImpactScenario = (scenarioParams) => {
    console.log('🎯 Aplicando escenario de impacto:', scenarioParams);
    setTrajectoryParams(scenarioParams);
    // También notificar al componente padre
    if (onParametersChange) {
      onParametersChange(scenarioParams);
    }
    setShowImpactScenarios(false);
  };

  return (
    <div className="neo-selector">
      <h3 className="neo-selector-title">Seleccionar NEO</h3>
      
      {/* Selector de NEOs */}
      <div className="neo-selector-section">
        <label htmlFor="neo-select" className="neo-selector-label">
          NEO Disponibles:
        </label>
        {neosLoading ? (
          <div className="loading-spinner">Cargando NEOs...</div>
        ) : neosError ? (
          <div className="error-message">
            Error: {neosError.message}
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

      {/* Detalles del NEO seleccionado */}
      {selectedNEOId && (
        <div className="neo-selector-section">
          <h4 className="neo-details-title">Detalles del NEO</h4>
          {detailsLoading ? (
            <div className="loading-spinner">Cargando detalles...</div>
          ) : detailsError ? (
            <div className="error-message">
              Error: {detailsError.message}
            </div>
          ) : neoData ? (
            <div className="neo-details">
              <div className="neo-detail-item">
                <strong>Nombre:</strong> {neoData.name}
              </div>
              <div className="neo-detail-item">
                <strong>ID:</strong> {neoData.id}
              </div>
              {neoData.estimated_diameter && (
                <div className="neo-detail-item">
                  <strong>Diámetro estimado:</strong> 
                  {neoData.estimated_diameter.kilometers?.estimated_diameter_min?.toFixed(2)} - 
                  {neoData.estimated_diameter.kilometers?.estimated_diameter_max?.toFixed(2)} km
                </div>
              )}
              {neoData.is_potentially_hazardous_asteroid !== undefined && (
                <div className="neo-detail-item">
                  <strong>Potencialmente peligroso:</strong> 
                  {neoData.is_potentially_hazardous_asteroid ? 'Sí' : 'No'}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Parámetros de trayectoria */}
      {selectedNEOId && (
        <div className="neo-selector-section">
          <div className="trajectory-controls">
            <button
              onClick={() => setShowImpactScenarios(!showImpactScenarios)}
              className="impact-scenarios-toggle"
              style={{
                marginBottom: '16px',
                padding: '10px 16px',
                backgroundColor: showImpactScenarios ? '#ff6b47' : '#6b9fff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              {showImpactScenarios ? '📊 Ocultar Escenarios de Impacto' : '🎯 Ver Escenarios de Impacto'}
            </button>
          </div>

          {showImpactScenarios && (
            <ImpactScenarios onApplyScenario={handleApplyImpactScenario} />
          )}
          
          <TrajectoryParameters 
            onParametersChange={handleParametersChange}
            initialParameters={trajectoryParams}
            key={JSON.stringify(trajectoryParams)} // Force re-render when params change
          />
          
          <button
            onClick={handleCalculateTrajectory}
            disabled={trajectoryLoading}
            className="trajectory-button"
          >
            {trajectoryLoading ? 'Calculando...' : 'Calcular Trayectoria'}
          </button>
        </div>
      )}

      {/* Resultados de la trayectoria */}
      {trajectoryError && (
        <div className="error-message">
          Error calculando trayectoria: {trajectoryError.message}
        </div>
      )}

      {trajectoryData && (
        <div className="neo-selector-section">
          <h4 className="trajectory-results-title">Resultados de Trayectoria</h4>
          <div className="trajectory-results">
            <div className="trajectory-result-item">
              <strong>Puntos calculados:</strong> {trajectoryData.trajectory?.length || 0}
            </div>
            {trajectoryData.impact_data && (
              <div className="trajectory-result-item">
                <strong>Impacto detectado:</strong> Sí
              </div>
            )}
            {trajectoryData.impact_data?.impact_energy && (
              <div className="trajectory-result-item">
                <strong>Energía de impacto:</strong> {trajectoryData.impact_data.impact_energy.toExponential(2)} J
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NEOSelector;
