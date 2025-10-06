import React, { useState } from 'react';
import ParameterSlider from './ParameterSlider';
import './TrajectoryParameters.css';

function TrajectoryParameters({ onParametersChange, parameters = {} }) {
  // Estados para parámetros de trayectoria
  const [position, setPosition] = useState({
    x: parameters.position_km?.[0] || parameters.position?.x || 1000,
    y: parameters.position_km?.[1] || parameters.position?.y || 2000,
    z: parameters.position_km?.[2] || parameters.position?.z || 3000
  });

  const [velocity, setVelocity] = useState({
    vx: parameters.velocity_kms?.[0] || parameters.velocity?.vx || 10,
    vy: parameters.velocity_kms?.[1] || parameters.velocity?.vy || 20,
    vz: parameters.velocity_kms?.[2] || parameters.velocity?.vz || 30
  });

  const [density, setDensity] = useState(parameters.density_kg_m3 || parameters.density || 2500);
  const [dt, setDt] = useState(parameters.dt || 0.5);

  // Actualizar estados cuando cambien los parámetros
  React.useEffect(() => {
    if (parameters.position_km) {
      setPosition({
        x: parameters.position_km[0] || 1000,
        y: parameters.position_km[1] || 2000,
        z: parameters.position_km[2] || 3000
      });
    }
    if (parameters.velocity_kms) {
      setVelocity({
        vx: parameters.velocity_kms[0] || 10,
        vy: parameters.velocity_kms[1] || 20,
        vz: parameters.velocity_kms[2] || 30
      });
    }
    if (parameters.density_kg_m3 !== undefined) {
      setDensity(parameters.density_kg_m3);
    }
    if (parameters.dt !== undefined) {
      setDt(parameters.dt);
    }
  }, [parameters]);

  // Función para actualizar parámetros y notificar al componente padre
  const updateParameters = React.useCallback((newParams = {}) => {
    const fullParams = {
      position_km: [position.x, position.y, position.z],
      velocity_kms: [velocity.vx, velocity.vy, velocity.vz],
      density_kg_m3: density,
      dt: dt,
      ...newParams
    };
    
    if (onParametersChange) {
      onParametersChange(fullParams);
    }
  }, [position, velocity, density, dt, onParametersChange]);

  // Actualizar parámetros cuando cambien los valores (con debounce)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateParameters();
    }, 100); // Debounce de 100ms

    return () => clearTimeout(timeoutId);
  }, [position.x, position.y, position.z, velocity.vx, velocity.vy, velocity.vz, density, dt]);

  const handlePositionChange = React.useCallback((axis, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setPosition(prev => {
        if (prev[axis] !== numValue) {
          return {
            ...prev,
            [axis]: numValue
          };
        }
        return prev;
      });
    }
  }, []);

  const handleVelocityChange = React.useCallback((axis, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setVelocity(prev => {
        if (prev[axis] !== numValue) {
          return {
            ...prev,
            [axis]: numValue
          };
        }
        return prev;
      });
    }
  }, []);

  const handleDensityChange = React.useCallback((value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue !== density) {
      setDensity(numValue);
    }
  }, [density]);

  const handleDtChange = React.useCallback((value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue !== dt) {
      setDt(numValue);
    }
  }, [dt]);

  return (
    <div className="trajectory-parameters">
      <h3 className="trajectory-parameters-title">Parámetros de Trayectoria</h3>
      
      {/* Posición Inicial */}
      <div className="parameter-section">
        <h4 className="section-title">Posición Inicial (km)</h4>
        <div className="vector-controls">
          <ParameterSlider
            label="X"
            value={position.x}
            onChange={(value) => handlePositionChange('x', value)}
            min={-10000}
            max={10000}
            step={100}
            unit="km"
            info="Posición inicial en el eje X (kilómetros)"
          />
          
          <ParameterSlider
            label="Y"
            value={position.y}
            onChange={(value) => handlePositionChange('y', value)}
            min={-10000}
            max={10000}
            step={100}
            unit="km"
            info="Posición inicial en el eje Y (kilómetros)"
          />
          
          <ParameterSlider
            label="Z"
            value={position.z}
            onChange={(value) => handlePositionChange('z', value)}
            min={-10000}
            max={10000}
            step={100}
            unit="km"
            info="Posición inicial en el eje Z (kilómetros)"
          />
        </div>
      </div>

      {/* Velocidad Inicial */}
      <div className="parameter-section">
        <h4 className="section-title">Velocidad Inicial (km/s)</h4>
        <div className="vector-controls">
          <ParameterSlider
            label="Vx"
            value={velocity.vx}
            onChange={(value) => handleVelocityChange('vx', value)}
            min={-50}
            max={50}
            step={0.1}
            unit="km/s"
            info="Velocidad inicial en el eje X (kilómetros por segundo)"
          />
          
          <ParameterSlider
            label="Vy"
            value={velocity.vy}
            onChange={(value) => handleVelocityChange('vy', value)}
            min={-50}
            max={50}
            step={0.1}
            unit="km/s"
            info="Velocidad inicial en el eje Y (kilómetros por segundo)"
          />
          
          <ParameterSlider
            label="Vz"
            value={velocity.vz}
            onChange={(value) => handleVelocityChange('vz', value)}
            min={-50}
            max={50}
            step={0.1}
            unit="km/s"
            info="Velocidad inicial en el eje Z (kilómetros por segundo)"
          />
        </div>
      </div>

      {/* Parámetros Físicos */}
      <div className="parameter-section">
        <h4 className="section-title">Propiedades Físicas</h4>
        
        <ParameterSlider
          label="Densidad"
          value={density}
          onChange={handleDensityChange}
          min={100}
          max={8000}
          step={100}
          unit="kg/m³"
          info="Densidad del objeto en kilogramos por metro cúbico. Rocoso ~2500, Metálico ~7800"
        />
        
        <ParameterSlider
          label="Paso de Tiempo"
          value={dt}
          onChange={handleDtChange}
          min={0.1}
          max={2.0}
          step={0.1}
          unit="s"
          info="Paso de tiempo para la simulación en segundos. Valores más pequeños = mayor precisión pero más lento"
        />
      </div>

      {/* Resumen de Parámetros */}
      <div className="parameters-summary">
        <h4 className="section-title">Resumen de Parámetros</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Posición:</span>
            <span className="summary-value">
              [{position.x.toFixed(0)}, {position.y.toFixed(0)}, {position.z.toFixed(0)}] km
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Velocidad:</span>
            <span className="summary-value">
              [{velocity.vx.toFixed(1)}, {velocity.vy.toFixed(1)}, {velocity.vz.toFixed(1)}] km/s
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Densidad:</span>
            <span className="summary-value">{density} kg/m³</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">dt:</span>
            <span className="summary-value">{dt} s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrajectoryParameters;
