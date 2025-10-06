import React, { useState, useEffect } from 'react';
import './ParameterSlider.css';

function ParameterSlider({ label, value, onChange, min, max, step, unit, info }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [localValue, setLocalValue] = useState(value || min || 0);
  
  // Sincronizar valor local con el prop value
  useEffect(() => {
    if (value !== undefined && !isNaN(value)) {
      setLocalValue(value);
    }
  }, [value]);
  
  // Validar y ajustar el valor dentro de los límites
  const safeValue = Math.max(min || 0, Math.min(max || 100, localValue));
  
  const handleChange = (newValue) => {
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      setLocalValue(numValue);
      if (onChange) {
        onChange(numValue);
      }
    }
  };
  
  const formatValue = (val) => {
    if (step < 1) {
      return val.toFixed(2);
    } else if (step < 10) {
      return val.toFixed(1);
    } else {
      return Math.round(val).toString();
    }
  };
  
  return (
    <div className="slider-container">
      <div className="slider-header">
        <div className="slider-label-container">
          <label className="slider-label">{label}</label>
          {info && (
            <div 
              className="info-button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              ℹ️
              {showTooltip && (
                <div className="tooltip">
                  {info}
                </div>
              )}
            </div>
          )}
        </div>
        <span className="slider-value">
          {formatValue(safeValue)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min || 0}
        max={max || 100}
        step={step || 1}
        value={safeValue}
        onChange={(e) => handleChange(e.target.value)}
        className="slider"
        onMouseUp={(e) => handleChange(e.target.value)}
        onTouchEnd={(e) => handleChange(e.target.value)}
      />
      <div className="slider-min-max">
        <span>{min || 0} {unit}</span>
        <span>{max || 100} {unit}</span>
      </div>
    </div>
  );
}

export default ParameterSlider;