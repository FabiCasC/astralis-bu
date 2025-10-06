import React, { useState } from 'react';
import './ImpactScenarios.css';

function ImpactScenarios({ onApplyScenario }) {
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Escenarios de impacto basados en física real
  const impactScenarios = [
    {
      id: 'close_approach',
      name: '🌍 Aproximación Cercana',
      description: 'Asteroide que pasa muy cerca de la Tierra',
      probability: 'Alta',
      parameters: {
        position_km: [7000, 0, 0],     // Cerca de la Tierra (radio ~6371 km)
        velocity_kms: [-5, 0, 0],      // Velocidad baja dirigida hacia la Tierra
        density_kg_m3: 2500,           // Densidad rocosa típica
        dt: 0.1                        // Paso de tiempo preciso
      },
      impact_likelihood: '90%',
      description_detailed: 'Posición inicial a 7,000 km de la Tierra con velocidad directa hacia el planeta.'
    },
    {
      id: 'orbital_decay',
      name: '🛰️ Decaimiento Orbital',
      description: 'Asteroide en órbita decayente',
      probability: 'Alta',
      parameters: {
        position_km: [8000, 0, 0],     // Ligeramente más lejos
        velocity_kms: [0, -7, 0],      // Velocidad orbital pero insuficiente
        density_kg_m3: 3000,
        dt: 0.1
      },
      impact_likelihood: '85%',
      description_detailed: 'Órbita inestable que decae gradualmente hacia la Tierra.'
    },
    {
      id: 'high_speed_impact',
      name: '💥 Impacto de Alta Velocidad',
      description: 'Asteroide con velocidad extrema',
      probability: 'Media',
      parameters: {
        position_km: [15000, 5000, 0], // Posición más lejana
        velocity_kms: [-20, -8, 0],    // Velocidad muy alta hacia la Tierra
        density_kg_m3: 4000,           // Más denso
        dt: 0.05                       // Paso muy preciso para alta velocidad
      },
      impact_likelihood: '75%',
      description_detailed: 'Asteroide rápido desde distancia media con trayectoria de colisión.'
    },
    {
      id: 'grazing_impact',
      name: '🎯 Impacto Rasante',
      description: 'Trayectoria tangencial a la atmósfera',
      probability: 'Media',
      parameters: {
        position_km: [10000, 8000, 0], // Ángulo de aproximación
        velocity_kms: [-8, -6, 0],     // Velocidad angular
        density_kg_m3: 2000,           // Menos denso
        dt: 0.1
      },
      impact_likelihood: '60%',
      description_detailed: 'Trayectoria que roza la atmósfera terrestre con posible impacto.'
    },
    {
      id: 'retrograde_orbit',
      name: '🔄 Órbita Retrógrada',
      description: 'Asteroide en órbita contraria',
      probability: 'Baja',
      parameters: {
        position_km: [12000, 0, 0],
        velocity_kms: [0, 15, 0],      // Velocidad orbital contraria
        density_kg_m3: 1800,
        dt: 0.1
      },
      impact_likelihood: '40%',
      description_detailed: 'Órbita retrógrada que puede llevar a colisión eventual.'
    },
    {
      id: 'vertical_approach',
      name: '⬇️ Aproximación Vertical',
      description: 'Caída casi vertical hacia la Tierra',
      probability: 'Alta',
      parameters: {
        position_km: [0, 0, 9000],     // Directamente arriba
        velocity_kms: [0, 0, -12],     // Caída vertical
        density_kg_m3: 3500,
        dt: 0.1
      },
      impact_likelihood: '95%',
      description_detailed: 'Aproximación directa desde arriba con alta probabilidad de impacto.'
    }
  ];

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
  };

  const handleApplyScenario = () => {
    if (selectedScenario && onApplyScenario) {
      onApplyScenario(selectedScenario.parameters);
    }
  };

  const getProbabilityColor = (probability) => {
    switch (probability) {
      case 'Alta': return '#e74c3c';
      case 'Media': return '#f39c12';
      case 'Baja': return '#27ae60';
      default: return '#3498db';
    }
  };

  return (
    <div className="impact-scenarios">
      <h3 className="scenarios-title">🎯 Escenarios de Impacto</h3>
      <p className="scenarios-subtitle">
        Configuraciones de parámetros que pueden resultar en colisión con la Tierra
      </p>

      <div className="scenarios-grid">
        {impactScenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`scenario-card ${selectedScenario?.id === scenario.id ? 'selected' : ''}`}
            onClick={() => handleScenarioSelect(scenario)}
          >
            <div className="scenario-header">
              <h4 className="scenario-name">{scenario.name}</h4>
              <span 
                className="scenario-probability"
                style={{ backgroundColor: getProbabilityColor(scenario.probability) }}
              >
                {scenario.probability}
              </span>
            </div>
            
            <p className="scenario-description">{scenario.description}</p>
            
            <div className="scenario-details">
              <div className="detail-item">
                <strong>Probabilidad de Impacto:</strong> 
                <span className="impact-likelihood">{scenario.impact_likelihood}</span>
              </div>
              
              <div className="detail-item">
                <strong>Posición inicial:</strong>
                <span className="parameter-value">
                  [{scenario.parameters.position_km.join(', ')}] km
                </span>
              </div>
              
              <div className="detail-item">
                <strong>Velocidad:</strong>
                <span className="parameter-value">
                  [{scenario.parameters.velocity_kms.join(', ')}] km/s
                </span>
              </div>
              
              <div className="detail-item">
                <strong>Densidad:</strong>
                <span className="parameter-value">
                  {scenario.parameters.density_kg_m3} kg/m³
                </span>
              </div>
            </div>
            
            <p className="scenario-detailed">{scenario.description_detailed}</p>
          </div>
        ))}
      </div>

      {selectedScenario && (
        <div className="scenario-actions">
          <button 
            className="apply-scenario-btn"
            onClick={handleApplyScenario}
          >
            🚀 Aplicar Escenario: {selectedScenario.name}
          </button>
          
          <div className="scenario-warning">
            ⚠️ <strong>Advertencia:</strong> Este escenario tiene {selectedScenario.impact_likelihood} 
            de probabilidad de impacto con la Tierra
          </div>
        </div>
      )}

      <div className="physics-info">
        <h4>📚 Información Física</h4>
        <div className="physics-grid">
          <div className="physics-item">
            <strong>Radio de la Tierra:</strong> ~6,371 km
          </div>
          <div className="physics-item">
            <strong>Atmósfera:</strong> Comienza ~100 km de altura
          </div>
          <div className="physics-item">
            <strong>Velocidad de escape:</strong> 11.2 km/s
          </div>
          <div className="physics-item">
            <strong>Velocidades típicas de asteroides:</strong> 11-72 km/s
          </div>
        </div>
      </div>

      <div className="recommendations">
        <h4>💡 Recomendaciones para Impactos</h4>
        <ul>
          <li><strong>Posición cercana:</strong> Menos de 10,000 km del centro de la Tierra</li>
          <li><strong>Velocidad dirigida:</strong> Componentes negativas hacia la Tierra (x,y,z)</li>
          <li><strong>Densidad alta:</strong> 2,500-4,000 kg/m³ para asteroides rocosos</li>
          <li><strong>Paso de tiempo pequeño:</strong> 0.05-0.1 s para mayor precisión</li>
          <li><strong>Ángulo de entrada:</strong> Trayectorias entre 20-70° son más probables</li>
        </ul>
      </div>
    </div>
  );
}

export default ImpactScenarios;