import React, { useState } from 'react';
import { useNEOs, useTrajectoryCalculation } from '../hooks/useNEOs.js';
import TrajectoryParameters from './TrajectoryParameters.jsx';
import './TrajectoryExample.css';

/**
 * Componente de ejemplo que demuestra cómo usar los parámetros de trayectoria
 * para calcular la trayectoria de un NEO con los parámetros correctos
 */
function TrajectoryExample() {
  const [selectedNEOId, setSelectedNEOId] = useState('');
  const [trajectoryParams, setTrajectoryParams] = useState({
    position_km: [1000, 2000, 3000],
    velocity_kms: [10, 20, 30],
    density_kg_m3: 2500,
    dt: 0.5
  });

  // Hooks para obtener datos
  const { neos, loading: neosLoading, error: neosError } = useNEOs();
  const { trajectoryData, loading: trajectoryLoading, error: trajectoryError, calculateTrajectory } = useTrajectoryCalculation();

  const handleNEOChange = (event) => {
    setSelectedNEOId(event.target.value);
  };

  const handleParametersChange = (newParams) => {
    setTrajectoryParams(newParams);
  };

  const handleCalculateTrajectory = async () => {
    if (!selectedNEOId) {
      alert('Por favor selecciona un NEO primero');
      return;
    }

    try {
      console.log('Calculando trayectoria con parámetros:', {
        neoId: selectedNEOId,
        position_km: trajectoryParams.position_km,
        velocity_kms: trajectoryParams.velocity_kms,
        density_kg_m3: trajectoryParams.density_kg_m3,
        dt: trajectoryParams.dt
      });

      const trajectory = await calculateTrajectory(selectedNEOId, trajectoryParams);
      console.log('Trayectoria calculada:', trajectory);
    } catch (error) {
      console.error('Error calculando trayectoria:', error);
    }
  };

  const loadPreset = (preset) => {
    switch (preset) {
      case 'asteroid':
        setTrajectoryParams({
          position_km: [5000, 3000, 2000],
          velocity_kms: [15, -10, 5],
          density_kg_m3: 2500,
          dt: 0.5
        });
        break;
      case 'comet':
        setTrajectoryParams({
          position_km: [10000, 5000, 1000],
          velocity_kms: [25, -15, 8],
          density_kg_m3: 1000,
          dt: 0.3
        });
        break;
      case 'meteor':
        setTrajectoryParams({
          position_km: [2000, 1500, 500],
          velocity_kms: [30, 20, 10],
          density_kg_m3: 3500,
          dt: 0.1
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="trajectory-example">
      <h2 className="example-title">Ejemplo de Cálculo de Trayectoria</h2>
      
      {/* Selector de NEO */}
      <div className="example-section">
        <h3>1. Seleccionar NEO</h3>
        {neosLoading ? (
          <div className="loading">Cargando NEOs...</div>
        ) : neosError ? (
          <div className="error">Error: {neosError.message}</div>
        ) : (
          <select
            value={selectedNEOId}
            onChange={handleNEOChange}
            className="neo-select"
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

      {/* Parámetros de trayectoria */}
      <div className="example-section">
        <h3>2. Configurar Parámetros de Trayectoria</h3>
        <TrajectoryParameters 
          onParametersChange={handleParametersChange}
          initialParameters={trajectoryParams}
        />
      </div>

      {/* Presets rápidos */}
      <div className="example-section">
        <h3>3. Presets Rápidos</h3>
        <div className="presets">
          <button onClick={() => loadPreset('asteroid')} className="preset-button">
            Asteroide Típico
          </button>
          <button onClick={() => loadPreset('comet')} className="preset-button">
            Cometa
          </button>
          <button onClick={() => loadPreset('meteor')} className="preset-button">
            Meteoro
          </button>
        </div>
      </div>

      {/* Botón de cálculo */}
      <div className="example-section">
        <button
          onClick={handleCalculateTrajectory}
          disabled={!selectedNEOId || trajectoryLoading}
          className="calculate-button"
        >
          {trajectoryLoading ? 'Calculando Trayectoria...' : 'Calcular Trayectoria'}
        </button>
      </div>

      {/* Resultados */}
      {(trajectoryError || trajectoryData) && (
        <div className="example-section">
          <h3>4. Resultados</h3>
          {trajectoryError && (
            <div className="error">
              <strong>Error:</strong> {trajectoryError.message}
            </div>
          )}
          {trajectoryData && (
            <div className="results">
              <h4>Datos de la Trayectoria:</h4>
              <div className="result-item">
                <strong>Puntos calculados:</strong> {trajectoryData.trajectory?.length || 0}
              </div>
              {trajectoryData.impact_data && (
                <>
                  <div className="result-item">
                    <strong>Impacto detectado:</strong> Sí
                  </div>
                  {trajectoryData.impact_data.impact_energy && (
                    <div className="result-item">
                      <strong>Energía de impacto:</strong> {trajectoryData.impact_data.impact_energy.toExponential(2)} J
                    </div>
                  )}
                </>
              )}
              <details className="raw-data">
                <summary>Ver datos completos</summary>
                <pre>{JSON.stringify(trajectoryData, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TrajectoryExample;

