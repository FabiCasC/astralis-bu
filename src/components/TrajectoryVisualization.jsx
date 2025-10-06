import React from 'react';
import './TrajectoryVisualization.css';

function TrajectoryVisualization({ trajectoryData, trajectoryParams }) {
  if (!trajectoryData || !trajectoryData.trajectory) {
    return null;
  }

  const trajectory = trajectoryData.trajectory;
  
  // Calcular métricas de la trayectoria
  const calculateMetrics = () => {
    if (!trajectory || trajectory.length === 0) return null;

    let minDistance = Infinity;
    let maxDistance = -Infinity;
    let totalDistance = 0;
    let maxSpeed = 0;
    let avgSpeed = 0;
    let speeds = [];

    trajectory.forEach((point, index) => {
      if (point.position && Array.isArray(point.position)) {
        // Calcular distancia desde el centro (Tierra)
        const distance = Math.sqrt(
          point.position[0] ** 2 + 
          point.position[1] ** 2 + 
          point.position[2] ** 2
        );
        
        minDistance = Math.min(minDistance, distance);
        maxDistance = Math.max(maxDistance, distance);

        // Calcular velocidad si hay punto anterior
        if (index > 0) {
          const prevPoint = trajectory[index - 1];
          if (prevPoint.position) {
            const dx = point.position[0] - prevPoint.position[0];
            const dy = point.position[1] - prevPoint.position[1];
            const dz = point.position[2] - prevPoint.position[2];
            const speed = Math.sqrt(dx**2 + dy**2 + dz**2);
            speeds.push(speed);
            maxSpeed = Math.max(maxSpeed, speed);
            totalDistance += speed;
          }
        }
      }
    });

    if (speeds.length > 0) {
      avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    }

    return {
      minDistance: minDistance / 1000, // Convertir a km
      maxDistance: maxDistance / 1000,
      totalDistance: totalDistance / 1000,
      maxSpeed: maxSpeed,
      avgSpeed: avgSpeed,
      duration: trajectory.length * (trajectoryParams?.dt || 0.5),
      points: trajectory.length
    };
  };

  const metrics = calculateMetrics();

  if (!metrics) {
    return (
      <div className="trajectory-visualization">
        <div className="visualization-panel">
          <h4>📊 Sin datos de trayectoria</h4>
          <p>Selecciona un NEO y calcula la trayectoria para ver las métricas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trajectory-visualization">
      <div className="visualization-panel">
        <h4>📊 Métricas de Trayectoria</h4>
        
        <div className="metrics-grid">
          {/* Distancia mínima */}
          <div className="metric-card distance">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <div className="metric-label">Distancia Mínima</div>
              <div className="metric-value">
                {metrics.minDistance.toLocaleString()} km
              </div>
              <div className="metric-description">
                Acercamiento máximo a la Tierra
              </div>
            </div>
          </div>

          {/* Distancia máxima */}
          <div className="metric-card distance">
            <div className="metric-icon">🚀</div>
            <div className="metric-content">
              <div className="metric-label">Distancia Máxima</div>
              <div className="metric-value">
                {metrics.maxDistance.toLocaleString()} km
              </div>
              <div className="metric-description">
                Punto más alejado de la Tierra
              </div>
            </div>
          </div>

          {/* Velocidad máxima */}
          <div className="metric-card speed">
            <div className="metric-icon">⚡</div>
            <div className="metric-content">
              <div className="metric-label">Velocidad Máxima</div>
              <div className="metric-value">
                {metrics.maxSpeed.toFixed(1)} km/s
              </div>
              <div className="metric-description">
                Velocidad pico durante la trayectoria
              </div>
            </div>
          </div>

          {/* Velocidad promedio */}
          <div className="metric-card speed">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <div className="metric-label">Velocidad Promedio</div>
              <div className="metric-value">
                {metrics.avgSpeed.toFixed(1)} km/s
              </div>
              <div className="metric-description">
                Velocidad promedio de la trayectoria
              </div>
            </div>
          </div>

          {/* Duración */}
          <div className="metric-card time">
            <div className="metric-icon">⏱️</div>
            <div className="metric-content">
              <div className="metric-label">Duración</div>
              <div className="metric-value">
                {metrics.duration.toFixed(1)}s
              </div>
              <div className="metric-description">
                Tiempo total de simulación
              </div>
            </div>
          </div>

          {/* Puntos de trayectoria */}
          <div className="metric-card points">
            <div className="metric-icon">📍</div>
            <div className="metric-content">
              <div className="metric-label">Puntos de Trayectoria</div>
              <div className="metric-value">
                {metrics.points.toLocaleString()}
              </div>
              <div className="metric-description">
                Número de puntos calculados
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de velocidad */}
        <div className="speed-chart">
          <h5>📊 Perfil de Velocidad</h5>
          <div className="chart-container">
            <div className="chart-bars">
              {trajectory.slice(0, 20).map((point, index) => {
                if (index === 0) return null;
                const prevPoint = trajectory[index - 1];
                if (!point.position || !prevPoint.position) return null;
                
                const dx = point.position[0] - prevPoint.position[0];
                const dy = point.position[1] - prevPoint.position[1];
                const dz = point.position[2] - prevPoint.position[2];
                const speed = Math.sqrt(dx**2 + dy**2 + dz**2);
                const height = Math.min((speed / metrics.maxSpeed) * 100, 100);
                
                return (
                  <div 
                    key={index}
                    className="chart-bar"
                    style={{ height: `${height}%` }}
                    title={`Velocidad: ${speed.toFixed(2)} km/s`}
                  />
                );
              })}
            </div>
            <div className="chart-labels">
              <span>Inicio</span>
              <span>Final</span>
            </div>
          </div>
        </div>

        {/* Indicador de riesgo */}
        <div className="risk-indicator">
          <h5>⚠️ Análisis de Riesgo</h5>
          <div className="risk-level">
            {metrics.minDistance < 1000 ? (
              <>
                <div className="risk-high">🔴 ALTO RIESGO</div>
                <p>El asteroide se acerca peligrosamente a la Tierra</p>
              </>
            ) : metrics.minDistance < 10000 ? (
              <>
                <div className="risk-medium">🟡 RIESGO MEDIO</div>
                <p>El asteroide se acerca pero mantiene distancia segura</p>
              </>
            ) : (
              <>
                <div className="risk-low">🟢 BAJO RIESGO</div>
                <p>El asteroide mantiene una distancia segura de la Tierra</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrajectoryVisualization;
