import React, { useState, useEffect } from 'react';
import './ImpactTour.css';

function ImpactTour({ scenarios, onClose, onScenarioSelect }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const tourSteps = [
    {
      title: "🎯 Bienvenido al Tour de Impacto",
      description: "Te guiaremos a través de los diferentes escenarios de impacto de asteroides",
      icon: "🚀",
      action: "intro"
    },
    {
      title: "📊 Escenarios Disponibles",
      description: "Exploraremos 4 tipos de escenarios de impacto basados en el tamaño y velocidad del asteroide",
      icon: "📈",
      action: "show-scenarios"
    },
    {
      title: "🟢 Impacto Bajo",
      description: "Asteroides pequeños con baja velocidad - Riesgo mínimo para la Tierra",
      icon: "🟢",
      action: "highlight",
      scenario: "low-impact"
    },
    {
      title: "🟡 Impacto Medio",
      description: "Asteroides medianos con velocidad moderada - Riesgo moderado",
      icon: "🟡",
      action: "highlight",
      scenario: "medium-impact"
    },
    {
      title: "🔴 Impacto Alto",
      description: "Asteroides grandes con alta velocidad - Riesgo significativo",
      icon: "🔴",
      action: "highlight",
      scenario: "high-impact"
    },
    {
      title: "💥 Impacto Catastrófico",
      description: "Asteroides masivos con velocidad extrema - Riesgo extremo",
      icon: "💥",
      action: "highlight",
      scenario: "catastrophic"
    },
    {
      title: "✅ Selecciona tu Escenario",
      description: "Haz clic en el escenario que deseas simular",
      icon: "🎮",
      action: "select"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < tourSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleScenarioClick = (scenario) => {
    setSelectedScenario(scenario.id);
    setIsAnimating(true);
    
    setTimeout(() => {
      if (onScenarioSelect) {
        onScenarioSelect(scenario);
      }
      if (onClose) {
        onClose();
      }
    }, 1500);
  };

  const handleSkipTour = () => {
    if (onClose) {
      onClose();
    }
  };

  const currentStepData = tourSteps[currentStep];

  return (
    <div className="impact-tour">
      <div className="tour-overlay">
        <div className="tour-container">
          {/* Header del tour */}
          <div className="tour-header">
            <h3 className="tour-title">🎯 Tour de Escenarios de Impacto</h3>
            <button className="skip-tour-btn" onClick={handleSkipTour}>
              ⏭️ Saltar Tour
            </button>
          </div>

          {/* Contenido del paso actual */}
          <div className="tour-content">
            <div className={`step-indicator ${isAnimating ? 'animating' : ''}`}>
              <div className="step-icon">{currentStepData.icon}</div>
              <div className="step-title">{currentStepData.title}</div>
              <div className="step-description">{currentStepData.description}</div>
            </div>

            {/* Progreso del tour */}
            <div className="tour-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                />
              </div>
              <div className="progress-text">
                Paso {currentStep + 1} de {tourSteps.length}
              </div>
            </div>

            {/* Escenarios (se muestran en pasos específicos) */}
            {(currentStepData.action === 'show-scenarios' || 
              currentStepData.action === 'highlight' || 
              currentStepData.action === 'select') && (
              <div className="tour-scenarios">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`tour-scenario-card ${
                      currentStepData.scenario === scenario.id ? 'highlighted' : ''
                    } ${selectedScenario === scenario.id ? 'selected' : ''}`}
                    onClick={() => {
                      if (currentStepData.action === 'select') {
                        handleScenarioClick(scenario);
                      }
                    }}
                    style={{
                      borderColor: currentStepData.scenario === scenario.id ? scenario.color : undefined,
                      cursor: currentStepData.action === 'select' ? 'pointer' : 'default'
                    }}
                  >
                    <div className="scenario-icon" style={{ color: scenario.color }}>
                      {scenario.icon}
                    </div>
                    <div className="scenario-info">
                      <div className="scenario-name">{scenario.name}</div>
                      <div className="scenario-risk" style={{ color: scenario.color }}>
                        Riesgo: {scenario.risk}
                      </div>
                    </div>
                    {currentStepData.scenario === scenario.id && (
                      <div className="highlight-effect">
                        ✨
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Indicador de acción */}
            <div className="tour-action">
              {currentStepData.action === 'intro' && (
                <div className="action-text">🎬 Iniciando tour...</div>
              )}
              {currentStepData.action === 'show-scenarios' && (
                <div className="action-text">📋 Mostrando escenarios disponibles</div>
              )}
              {currentStepData.action === 'highlight' && (
                <div className="action-text">🔍 Resaltando escenario específico</div>
              )}
              {currentStepData.action === 'select' && (
                <div className="action-text">👆 Haz clic en un escenario para continuar</div>
              )}
            </div>
          </div>

          {/* Controles del tour */}
          <div className="tour-controls">
            <button 
              className="prev-btn"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              ⬅️ Anterior
            </button>
            
            <button 
              className="next-btn"
              onClick={() => setCurrentStep(Math.min(tourSteps.length - 1, currentStep + 1))}
              disabled={currentStep === tourSteps.length - 1}
            >
              Siguiente ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImpactTour;
