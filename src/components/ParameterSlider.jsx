import React, { useState } from 'react';
import './ParameterSlider.css';

function ParameterSlider({ label, value, onChange, min, max, step, unit, info }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="slider-container">
      <div className="slider-header">
        <div className="slider-label-container">
          <label className="slider-label">{label}</label>
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
        </div>
        <span className="slider-value">
          {value.toFixed(step < 1 ? 2 : 0)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider"
      />
      <div className="slider-min-max">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

export default ParameterSlider;