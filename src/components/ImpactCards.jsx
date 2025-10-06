import React, { useState, useEffect } from 'react';
import './ImpactCards.css';

function ImpactCards({ trajectoryData, onClose, onScenarioSelect }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Analyze trajectory to determine if there's impact
  const analyzeTrajectory = () => {
    // Always simulate potential impact to show the tour
    let minDistance = 5000; // Simulate close distance
    let impactVelocity = 12; // Simulate impact velocity
    let riskLevel = 'medium';

    // If there are real data, use them, but always assume potential impact
    if (trajectoryData && trajectoryData.trajectory && Array.isArray(trajectoryData.trajectory)) {
      const trajectory = trajectoryData.trajectory;
      let realMinDistance = Infinity;
      let closestPoint = null;

      // Find the closest point to Earth
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

      // Use real data if available, but always show impact
      if (realMinDistance < Infinity) {
        minDistance = realMinDistance;
        
        // Calculate impact velocity
        if (closestPoint && closestPoint.index > 0) {
          const prevPoint = trajectory[closestPoint.index - 1];
          if (prevPoint && prevPoint.position) {
            const dx = closestPoint.position[0] - prevPoint.position[0];
            const dy = closestPoint.position[1] - prevPoint.position[1];
            const dz = closestPoint.position[2] - prevPoint.position[2];
            impactVelocity = Math.sqrt(dx**2 + dy**2 + dz**2);
          }
        }

        // Determine risk level
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
      hasImpact: true, // Always show potential impact
      impactDistance: minDistance,
      impactVelocity: impactVelocity,
      impactTime: 45.2, // Simulated time
      riskLevel
    };
  };

  const analysis = analyzeTrajectory();

  // Define scenarios - always show all as educational tour
  const impactScenarios = [
    {
      id: 'low-impact',
      title: '🟡 Low Intensity Impact',
      description: 'Minor impact with localized damage',
      icon: '💥',
      color: '#f39c12',
      condition: true,
      details: {
        impactVelocity: `${analysis.impactVelocity?.toFixed(1)} km/s`,
        impactTime: `${analysis.impactTime?.toFixed(1)}s`,
        energy: '~10^12 J',
        recommendation: 'Local evacuation recommended'
      }
    },
    {
      id: 'medium-impact',
      title: '🟠 Medium Intensity Impact',
      description: 'Significant impact with regional damage',
      icon: '💥💥',
      color: '#e67e22',
      condition: true,
      details: {
        impactVelocity: `${(analysis.impactVelocity * 1.5)?.toFixed(1)} km/s`,
        impactTime: `${(analysis.impactTime * 0.8)?.toFixed(1)}s`,
        energy: '~10^13 J',
        recommendation: 'Regional evacuation critical'
      }
    },
    {
      id: 'high-impact',
      title: '🔴 High Intensity Impact',
      description: 'Severe impact with global consequences',
      icon: '💥💥💥',
      color: '#e74c3c',
      condition: true,
      details: {
        impactVelocity: `${(analysis.impactVelocity * 2)?.toFixed(1)} km/s`,
        impactTime: `${(analysis.impactTime * 0.6)?.toFixed(1)}s`,
        energy: '~10^14 J',
        recommendation: 'GLOBAL EMERGENCY - Mass evacuation'
      }
    },
    {
      id: 'catastrophic-impact',
      title: '💀 Catastrophic Impact',
      description: 'Impact threatening civilization',
      icon: '☄️💀',
      color: '#8e44ad',
      condition: true,
      details: {
        impactVelocity: `${(analysis.impactVelocity * 3)?.toFixed(1)} km/s`,
        impactTime: `${(analysis.impactTime * 0.4)?.toFixed(1)}s`,
        energy: '~10^15 J',
        recommendation: 'PREPARATION FOR EXTINCTION EVENT'
      }
    }
  ];

  // Filter only applicable scenarios
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
          <h3>🎯 Impact Scenarios Tour</h3>
          <button className="close-cards-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="impact-cards-content">
          {/* Tour explanation text */}
          <div className="tour-explanation">
            <p>🎬 Explore different asteroid impact scenarios. Cards rotate automatically showing various risk levels and their consequences.</p>
          </div>

          {/* Main card */}
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
              
              {/* Technical details */}
              <div className="card-details">
                {Object.entries(currentScenario.details).map(([key, value]) => (
                  <div key={key} className="detail-row">
                    <span className="detail-label">
                      {key === 'distanciaMinima' && 'Minimum Distance:'}
                      {key === 'impactVelocity' && 'Impact Velocity:'}
                      {key === 'impactTime' && 'Impact Time:'}
                      {key === 'energy' && 'Estimated Energy:'}
                      {key === 'recommendation' && 'Recommendation:'}
                    </span>
                    <span className="detail-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress indicators */}
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

          {/* Action buttons */}
          <div className="cards-actions">
            <button
              className="action-btn primary"
              style={{ backgroundColor: currentScenario.color }}
              onClick={() => onScenarioSelect(currentScenario)}
            >
              🚀 Simulate This Scenario
            </button>
            
            <button
              className="action-btn secondary"
              onClick={onClose}
            >
              📊 View Complete Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImpactCards;
