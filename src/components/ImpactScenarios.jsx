import React, { useState } from 'react';
import './ImpactScenarios.css';

function ImpactScenarios({ onApplyScenario }) {
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Escenarios de impacto predefinidos
  const scenarios = [
    {
      id: 'low-impact',
      name: 'Impacto Bajo',
      description: 'Asteroide pequeño con baja velocidad',
      icon: '🟢',
      params: {
        position_km: [500, 1000, 1500],
        velocity_kms: [5, 10, 15],
        density_kg_m3: 2000,
        dt: 0.5
      },
      risk: 'Bajo',
      color: '#27ae60'
    },
    {
      id: 'medium-impact',
      name: 'Impacto Medio',
      description: 'Asteroide mediano con velocidad moderada',
      icon: '🟡',
      params: {
        position_km: [1000, 2000, 3000],
        velocity_kms: [10, 20, 30],
        density_kg_m3: 2500,
        dt: 0.5
      },
      risk: 'Medio',
      color: '#f39c12'
    },
    {
      id: 'high-impact',
      name: 'Impacto Alto',
      description: 'Asteroide grande con alta velocidad',
      icon: '🔴',
      params: {
        position_km: [2000, 4000, 6000],
        velocity_kms: [20, 40, 60],
        density_kg_m3: 3000,
        dt: 0.5
      },
      risk: 'Alto',
      color: '#e74c3c'
    },
    {
      id: 'catastrophic',
      name: 'Catastrófico',
      description: 'Asteroide masivo con velocidad extrema',
      icon: '💥',
      params: {
        position_km: [5000, 10000, 15000],
        velocity_kms: [50, 100, 150],
        density_kg_m3: 3500,
        dt: 0.5
      },
      risk: 'Extremo',
      color: '#8e44ad'
    }
  ];

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario.id);
  };

  const handleApplyScenario = () => {
    if (selectedScenario) {
      const scenario = scenarios.find(s => s.id === selectedScenario);
      if (scenario && onApplyScenario) {
        onApplyScenario(scenario.params);
      }
    }
  };

  return (
    <div className="impact-scenarios">
      <div className="scenarios-header">
        <h4>🎯 Escenarios de Impacto</h4>
        <p className="scenarios-subtitle">
          Selecciona un escenario para simular diferentes tipos de impacto
        </p>
      </div>

      <div className="scenarios-grid">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`scenario-card ${selectedScenario === scenario.id ? 'selected' : ''}`}
            style={{ borderColor: scenario.color }}
            onClick={() => handleScenarioSelect(scenario)}
          >
            <div className="scenario-icon" style={{ color: scenario.color }}>
              {scenario.icon}
            </div>
            <div className="scenario-content">
              <h5 className="scenario-name">{scenario.name}</h5>
              <p className="scenario-description">{scenario.description}</p>
              <div className="scenario-risk" style={{ color: scenario.color }}>
                Riesgo: {scenario.risk}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedScenario && (
        <div className="scenario-actions">
          <button
            onClick={handleApplyScenario}
            className="apply-scenario-btn"
            style={{
              backgroundColor: scenarios.find(s => s.id === selectedScenario)?.color || '#6b9fff'
            }}
          >
            ✅ Aplicar Escenario
          </button>
          <button
            onClick={() => setSelectedScenario(null)}
            className="cancel-scenario-btn"
          >
            ❌ Cancelar
          </button>
        </div>
      )}

      {/* Información adicional */}
      <div className="scenarios-info">
        <div className="info-card">
          <h6>📊 Parámetros del Escenario</h6>
          {selectedScenario ? (
            <div className="scenario-details">
              {(() => {
                const scenario = scenarios.find(s => s.id === selectedScenario);
                return (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">Posición:</span>
                      <span className="detail-value">
                        [{scenario.params.position_km.join(', ')}] km
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Velocidad:</span>
                      <span className="detail-value">
                        [{scenario.params.velocity_kms.join(', ')}] km/s
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Densidad:</span>
                      <span className="detail-value">{scenario.params.density_kg_m3} kg/m³</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Paso de tiempo:</span>
                      <span className="detail-value">{scenario.params.dt}s</span>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <p className="no-selection">Selecciona un escenario para ver los parámetros</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImpactScenarios;