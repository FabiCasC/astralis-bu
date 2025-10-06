import React, { useState, useEffect } from 'react';
import './ImpactCards.css';

function ImpactCards({ trajectoryData, onClose, onScenarioSelect }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Analizar la trayectoria para determinar si hay impacto
  const analyzeTrajectory = () => {
    // Siempre simular que hay impacto potencial para mostrar el tour
    let minDistance = 5000; // Simular distancia cercana
    let impactVelocity = 12; // Simular velocidad de impacto
    let riskLevel = 'medium';

    // Si hay datos reales, usarlos, pero siempre asumir impacto potencial
    if (trajectoryData && trajectoryData.trajectory && Array.isArray(trajectoryData.trajectory)) {
      const trajectory = trajectoryData.trajectory;
      let realMinDistance = Infinity;
      let closestPoint = null;

      // Encontrar el punto más cercano a la Tierra
      trajectory.forEach((point, index) => {
        if (point.position && Array.isArray(point.position)) {
          const distance = Math.sqrt(
            point.position[0] ** 2 + 
            point.position[1] ** 2 + 
            point.position[2] ** 2
          );
          
          if (distance < realMinDistance) {
            realMinDistance = distance;
            closestPoint = { ...point, index, distance };
          }
        }
      });

      // Usar datos reales si están disponibles, pero siempre mostrar impacto
      if (realMinDistance < Infinity) {
        minDistance = realMinDistance;
        
        // Calcular velocidad de impacto
        if (closestPoint && closestPoint.index > 0) {
          const prevPoint = trajectory[closestPoint.index - 1];
          if (prevPoint && prevPoint.position) {
            const dx = closestPoint.position[0] - prevPoint.position[0];
            const dy = closestPoint.position[1] - prevPoint.position[1];
            const dz = closestPoint.position[2] - prevPoint.position[2];
            impactVelocity = Math.sqrt(dx**2 + dy**2 + dz**2);
          }
        }

        // Determinar nivel de riesgo
        if (impactVelocity > 15) {
          riskLevel = 'catastrophic';
        } else if (impactVelocity > 10) {
          riskLevel = 'high';
        } else if (impactVelocity > 5) {
          riskLevel = 'medium';
        } else {
          riskLevel = 'low';
        }
      }
    }

    return {
      hasImpact: true, // Siempre mostrar que hay impacto potencial
      impactDistance: minDistance,
      impactVelocity: impactVelocity,
      impactTime: 45.2, // Tiempo simulado
      riskLevel
    };
  };

  const analysis = analyzeTrajectory();

  // Definir escenarios - siempre mostrar todos como tour educativo
  const impactScenarios = [
    {
      id: 'low-impact',
      title: '🟡 Impacto de Baja Intensidad',
      description: 'Impacto menor con daños localizados',
      icon: '💥',
      color: '#f39c12',
      condition: true,
      details: {
        velocidadImpacto: `${analysis.impactVelocity?.toFixed(1)} km/s`,
        tiempoImpacto: `${analysis.impactTime?.toFixed(1)}s`,
        energia: '~10^12 J',
        recomendacion: 'Evacuación local recomendada'
      }
    },
    {
      id: 'medium-impact',
      title: '🟠 Impacto de Intensidad Media',
      description: 'Impacto significativo con daños regionales',
      icon: '💥💥',
      color: '#e67e22',
      condition: true,
      details: {
        velocidadImpacto: `${(analysis.impactVelocity * 1.5)?.toFixed(1)} km/s`,
        tiempoImpacto: `${(analysis.impactTime * 0.8)?.toFixed(1)}s`,
        energia: '~10^13 J',
        recomendacion: 'Evacuación regional crítica'
      }
    },
    {
      id: 'high-impact',
      title: '🔴 Impacto de Alta Intensidad',
      description: 'Impacto severo con consecuencias globales',
      icon: '💥💥💥',
      color: '#e74c3c',
      condition: true,
      details: {
        velocidadImpacto: `${(analysis.impactVelocity * 2)?.toFixed(1)} km/s`,
        tiempoImpacto: `${(analysis.impactTime * 0.6)?.toFixed(1)}s`,
        energia: '~10^14 J',
        recomendacion: 'EMERGENCIA GLOBAL - Evacuación masiva'
      }
    },
    {
      id: 'catastrophic-impact',
      title: '💀 Impacto Catastrófico',
      description: 'Impacto que amenaza la civilización',
      icon: '☄️💀',
      color: '#8e44ad',
      condition: true,
      details: {
        velocidadImpacto: `${(analysis.impactVelocity * 3)?.toFixed(1)} km/s`,
        tiempoImpacto: `${(analysis.impactTime * 0.4)?.toFixed(1)}s`,
        energia: '~10^15 J',
        recomendacion: 'PREPARACIÓN PARA EVENTO DE EXTINCIÓN'
      }
    }
  ];

  // Filtrar solo los escenarios que aplican
  const applicableScenarios = impactScenarios.filter(scenario => scenario.condition);

  useEffect(() => {
    if (applicableScenarios.length > 1) {
      const timer = setInterval(() => {
        setCurrentCard(prev => (prev + 1) % applicableScenarios.length);
      }, 4000);

      return () => clearInterval(timer);
    }
  }, [applicableScenarios.length]);

  if (applicableScenarios.length === 0) {
    return null;
  }

  const currentScenario = applicableScenarios[currentCard];

  return (
    <div className="impact-cards-overlay">
      <div className="impact-cards-container">
        <div className="impact-cards-header">
          <h3>🎯 Tour de Escenarios de Impacto</h3>
          <button className="close-cards-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="impact-cards-content">
          {/* Texto explicativo del tour */}
          <div className="tour-explanation">
            <p>🎬 Explora diferentes escenarios de impacto de asteroides. Las tarjetas rotan automáticamente mostrando diversos niveles de riesgo y sus consecuencias.</p>
          </div>

          {/* Tarjeta principal */}
          <div 
            className={`impact-card main ${isAnimating ? 'animating' : ''}`}
            style={{ borderColor: currentScenario.color }}
          >
            <div className="card-icon" style={{ color: currentScenario.color }}>
              {currentScenario.icon}
            </div>
            <div className="card-content">
              <h4 className="card-title">{currentScenario.title}</h4>
              <p className="card-description">{currentScenario.description}</p>
              
              <div className="card-details">
                {Object.entries(currentScenario.details).map(([key, value]) => (
                  <div key={key} className="detail-row">
                    <span className="detail-label">
                      {key === 'distanciaMinima' && 'Distancia Mínima:'}
                      {key === 'velocidadImpacto' && 'Velocidad de Impacto:'}
                      {key === 'tiempoImpacto' && 'Tiempo de Impacto:'}
                      {key === 'energia' && 'Energía Estimada:'}
                      {key === 'recomendacion' && 'Recomendación:'}
                    </span>
                    <span className="detail-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Indicadores de progreso */}
          {applicableScenarios.length > 1 && (
            <div className="cards-indicators">
              {applicableScenarios.map((_, index) => (
                <div
                  key={index}
                  className={`indicator ${index === currentCard ? 'active' : ''}`}
                  onClick={() => setCurrentCard(index)}
                />
              ))}
            </div>
          )}

          {/* Botones de acción */}
          <div className="cards-actions">
            <button
              className="action-btn primary"
              style={{ backgroundColor: currentScenario.color }}
              onClick={() => onScenarioSelect(currentScenario)}
            >
              🚀 Simular Este Escenario
            </button>
            
            <button
              className="action-btn secondary"
              onClick={onClose}
            >
              📊 Ver Análisis Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImpactCards;
