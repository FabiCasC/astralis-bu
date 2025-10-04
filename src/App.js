import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

// Componente de Slider personalizado con botón de info
function ParameterSlider({ label, value, onChange, min, max, step, unit, info }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div style={styles.sliderContainer}>
      <div style={styles.sliderHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={styles.sliderLabel}>{label}</label>
          <div 
            style={styles.infoButton}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            ℹ️
            {showTooltip && (
              <div style={styles.tooltip}>
                {info}
              </div>
            )}
          </div>
        </div>
        <span style={styles.sliderValue}>{value.toFixed(step < 1 ? 2 : 0)} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={styles.slider}
      />
      <div style={styles.sliderMinMax}>
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

// Componente principal
export default function AsteroidSimulator() {
  const canvasRef = useRef(null);
  
  // Estados para parámetros físicos
  const [diameter, setDiameter] = useState(0.5);
  const [velocity, setVelocity] = useState(20);
  const [density, setDensity] = useState(2.5);
  
  // Estados para parámetros orbitales
  const [semiMajorAxis, setSemiMajorAxis] = useState(1.5);
  const [eccentricity, setEccentricity] = useState(0.2);
  const [inclination, setInclination] = useState(10);
  const [ascendingNode, setAscendingNode] = useState(45);
  const [perihelionArg, setPerihelionArg] = useState(90);
  const [meanAnomaly, setMeanAnomaly] = useState(0);
  
  const [isMinimized, setIsMinimized] = useState(false);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Configuración de la escena
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.z = 50;
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Crear estrellas
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x6b9fff, 0.5);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    // Animación
    function animate() {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.00005;
      renderer.render(scene, camera);
    }
    animate();
    
    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, []);
  
  const handleSimulate = () => {
    console.log('Simulando con parámetros:', {
      physical: { diameter, velocity, density },
      orbital: { semiMajorAxis, eccentricity, inclination, ascendingNode, perihelionArg, meanAnomaly }
    });
    alert('¡Simulación iniciada! (Aquí irá la lógica de simulación)');
  };
  
  return (
    <div style={styles.container}>
      {/* Canvas de Three.js */}
      <canvas ref={canvasRef} style={styles.canvas} />
      
      {/* Logo ASTRALIS - BU */}
      <div style={styles.logoContainer}>
        <div style={styles.logoText}>ASTRALIS</div>
        <div style={styles.logoSubtext}>BU</div>
      </div>
      
      {/* Tarjeta de parámetros flotante */}
      <div style={{
        ...styles.parameterCard,
        height: isMinimized ? '60px' : 'auto',
        overflow: isMinimized ? 'hidden' : 'auto'
      }}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Parámetros del Asteroide</h2>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            style={styles.minimizeButton}
          >
            {isMinimized ? '▼' : '▲'}
          </button>
        </div>
        
        {!isMinimized && (
          <>
            {/* Sección: Parámetros Físicos */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Parámetros Físicos</h3>
              
              <ParameterSlider
                label="Diámetro"
                value={diameter}
                onChange={setDiameter}
                min={0.01}
                max={10}
                step={0.01}
                unit="km"
                info="Tamaño del asteroide. Afecta directamente la energía de impacto y el tamaño del cráter."
              />
              
              <ParameterSlider
                label="Velocidad Relativa"
                value={velocity}
                onChange={setVelocity}
                min={11}
                max={72}
                step={0.1}
                unit="km/s"
                info="Velocidad del asteroide respecto a la Tierra. Mayor velocidad genera mayor energía de impacto."
              />
              
              <ParameterSlider
                label="Densidad"
                value={density}
                onChange={setDensity}
                min={1}
                max={8}
                step={0.1}
                unit="g/cm³"
                info="Densidad del material. Rocoso ~2.5 g/cm³, Metálico ~7.8 g/cm³. Afecta la masa total."
              />
            </div>
            
            {/* Sección: Parámetros Orbitales */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Parámetros Orbitales</h3>
              
              <ParameterSlider
                label="Semieje Mayor (a)"
                value={semiMajorAxis}
                onChange={setSemiMajorAxis}
                min={0.5}
                max={5}
                step={0.01}
                unit="AU"
                info="Tamaño promedio de la órbita alrededor del Sol. 1 AU = distancia Tierra-Sol."
              />
              
              <ParameterSlider
                label="Excentricidad (e)"
                value={eccentricity}
                onChange={setEccentricity}
                min={0}
                max={0.99}
                step={0.01}
                unit=""
                info="Forma de la órbita: 0 = circular perfecta, cercano a 1 = muy elíptica."
              />
              
              <ParameterSlider
                label="Inclinación (i)"
                value={inclination}
                onChange={setInclination}
                min={0}
                max={180}
                step={1}
                unit="°"
                info="Ángulo de inclinación respecto al plano eclíptico (plano orbital de la Tierra)."
              />
              
              <ParameterSlider
                label="Long. Nodo Ascendente (Ω)"
                value={ascendingNode}
                onChange={setAscendingNode}
                min={0}
                max={360}
                step={1}
                unit="°"
                info="Ángulo donde la órbita cruza el plano eclíptico de sur a norte."
              />
              
              <ParameterSlider
                label="Arg. Perihelio (ω)"
                value={perihelionArg}
                onChange={setPerihelionArg}
                min={0}
                max={360}
                step={1}
                unit="°"
                info="Ángulo desde el nodo ascendente hasta el punto más cercano al Sol (perihelio)."
              />
              
              <ParameterSlider
                label="Anomalía Media (M)"
                value={meanAnomaly}
                onChange={setMeanAnomaly}
                min={0}
                max={360}
                step={1}
                unit="°"
                info="Posición angular del asteroide en su órbita en el momento actual."
              />
            </div>
            
            {/* Botón de simular */}
            <button onClick={handleSimulate} style={styles.simulateButton}>
              Iniciar Simulación
            </button>
          </>
        )}
      </div>
      
      {/* Título principal */}
      <div style={styles.titleContainer}>
        <h1 style={styles.mainTitle}>ASTEROID IMPACT SIMULATOR</h1>
        <p style={styles.subtitle}>Configure orbital parameters and physical properties</p>
      </div>
    </div>
  );
}

// Estilos
const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
    background: 'linear-gradient(to bottom, #000000, #0a0a1a)',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'block',
  },
  parameterCard: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '380px',
    maxHeight: 'calc(100vh - 40px)',
    background: 'rgba(15, 15, 35, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(100, 150, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(100, 150, 255, 0.1)',
    padding: '20px',
    zIndex: 10,
    overflowY: 'auto',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    textShadow: '0 0 10px rgba(100, 150, 255, 0.5)',
  },
  minimizeButton: {
    background: 'rgba(100, 150, 255, 0.2)',
    border: '1px solid rgba(100, 150, 255, 0.4)',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#6b9fff',
    marginBottom: '15px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  sliderContainer: {
    marginBottom: '20px',
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: '14px',
    color: '#a0b0d0',
    fontWeight: '500',
  },
  sliderValue: {
    fontSize: '14px',
    color: '#ffffff',
    fontWeight: '600',
    background: 'rgba(100, 150, 255, 0.2)',
    padding: '2px 10px',
    borderRadius: '6px',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(100, 150, 255, 0.2)',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  sliderMinMax: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '5px',
    fontSize: '11px',
    color: '#6b7a99',
  },
  simulateButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  titleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    zIndex: 5,
    pointerEvents: 'none',
  },
  mainTitle: {
    fontSize: '64px',
    fontWeight: '900',
    color: '#ffffff',
    margin: 0,
    textShadow: '0 0 20px rgba(100, 150, 255, 0.8), 0 0 40px rgba(100, 150, 255, 0.4)',
    letterSpacing: '4px',
    opacity: 0.15,
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b9fff',
    marginTop: '10px',
    opacity: 0.3,
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  logoContainer: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '15px 20px',
    background: 'rgba(15, 15, 35, 0.7)',
    backdropFilter: 'blur(15px)',
    borderRadius: '12px',
    border: '1px solid rgba(100, 150, 255, 0.3)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '3px',
    textShadow: '0 0 15px rgba(100, 150, 255, 0.8)',
  },
  logoSubtext: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b9fff',
    letterSpacing: '4px',
    marginTop: '2px',
  },
  infoButton: {
    position: 'relative',
    fontSize: '14px',
    cursor: 'help',
    padding: '2px',
    lineHeight: '1',
    transition: 'transform 0.2s',
  },
  tooltip: {
    position: 'absolute',
    left: '25px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(10, 10, 30, 0.95)',
    border: '1px solid rgba(100, 150, 255, 0.4)',
    borderRadius: '8px',
    padding: '12px 15px',
    fontSize: '12px',
    color: '#e0e8ff',
    width: '280px',
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    pointerEvents: 'none',
    lineHeight: '1.5',
  },
};

// CSS para el slider (inyectado dinámicamente)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      cursor: pointer;
      box-shadow: 0 0 10px rgba(102, 126, 234, 0.6);
      transition: all 0.2s;
    }
    
    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 0 15px rgba(102, 126, 234, 0.8);
    }
    
    input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      cursor: pointer;
      border: none;
      box-shadow: 0 0 10px rgba(102, 126, 234, 0.6);
      transition: all 0.2s;
    }
    
    input[type="range"]::-moz-range-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 0 15px rgba(102, 126, 234, 0.8);
    }
  `;
  if (!document.querySelector('style[data-slider-styles]')) {
    styleSheet.setAttribute('data-slider-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}