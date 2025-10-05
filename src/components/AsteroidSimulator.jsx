import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import NEOSelector from './NEOSelector';
import './AsteroidSimulator.css';

function AsteroidSimulator() {
  const canvasRef = useRef(null);
  
  // Estados para el selector de NEOs
  const [showNEOSelector, setShowNEOSelector] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [trajectoryParams, setTrajectoryParams] = useState(null);
  const [selectedNEOId, setSelectedNEOId] = useState(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  // Estados para SpaceKit
  const [spacekitLoaded, setSpacekitLoaded] = useState(false);
  const sceneRef = useRef(null);
  const meteoroidRef = useRef(null);
  const animationIdRef = useRef(null);
  
  // Cargar SpaceKit dinámicamente
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://typpo.github.io/spacekit/build/spacekit.js';
    script.onload = () => {
      console.log('SpaceKit loaded successfully');
      setSpacekitLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load SpaceKit');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Crear la escena 3D directamente con Three.js para asegurar visibilidad
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // Crear escena Three.js directamente
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000011);

      // Crear cámara
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(120, 120, 120);
      camera.lookAt(0, 0, 0);

      // Crear renderer con configuración mejorada
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        antialias: true,
        alpha: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;

      // Crear la Tierra con textura más realista
      const earthGeometry = new THREE.SphereGeometry(20, 128, 64);
      
      // Crear textura procedural más detallada para simular la Tierra
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      // Crear gradiente base más realista (océanos)
      const oceanGradient = ctx.createRadialGradient(512, 256, 0, 512, 256, 512);
      oceanGradient.addColorStop(0, '#4A90E2'); // Azul claro central
      oceanGradient.addColorStop(0.3, '#2E86C1'); // Azul medio
      oceanGradient.addColorStop(0.7, '#1B4F72'); // Azul oscuro
      oceanGradient.addColorStop(1, '#0B2638'); // Azul muy oscuro en los bordes
      
      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, 1024, 512);
      
      // Agregar ruido para simular olas y variaciones oceánicas
      const imageData = ctx.getImageData(0, 0, 1024, 512);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 20;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
      }
      ctx.putImageData(imageData, 0, 0);
      
      // Agregar continentes con formas más detalladas y realistas
      ctx.fillStyle = '#27AE60'; // Verde más realista
      
      // América del Norte (más detallada)
      ctx.beginPath();
      ctx.ellipse(150, 120, 40, 60, 0, 0, 2 * Math.PI);
      ctx.fill();
      // Alaska
      ctx.beginPath();
      ctx.ellipse(80, 60, 15, 25, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // América del Sur (más realista)
      ctx.beginPath();
      ctx.ellipse(180, 280, 20, 45, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Europa/África (más detallada)
      ctx.beginPath();
      ctx.ellipse(480, 200, 30, 70, 0, 0, 2 * Math.PI);
      ctx.fill();
      // Península Ibérica
      ctx.beginPath();
      ctx.ellipse(420, 180, 8, 12, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Asia (más grande y detallada)
      ctx.beginPath();
      ctx.ellipse(700, 140, 60, 50, 0, 0, 2 * Math.PI);
      ctx.fill();
      // India
      ctx.beginPath();
      ctx.ellipse(650, 220, 12, 20, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Australia (más realista)
      ctx.beginPath();
      ctx.ellipse(850, 350, 20, 12, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Agregar variaciones de color en los continentes
      ctx.fillStyle = '#229954'; // Verde más oscuro para bosques
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 15 + 5, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Agregar desiertos (color marrón)
      ctx.fillStyle = '#D4AC0D';
      // Desierto del Sahara
      ctx.beginPath();
      ctx.ellipse(480, 220, 25, 15, 0, 0, 2 * Math.PI);
      ctx.fill();
      // Desierto de Gobi
      ctx.beginPath();
      ctx.ellipse(720, 140, 20, 10, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Crear textura desde el canvas
      const earthTexture = new THREE.CanvasTexture(canvas);
      earthTexture.wrapS = THREE.RepeatWrapping;
      earthTexture.wrapT = THREE.RepeatWrapping;
      earthTexture.generateMipmaps = true;
      earthTexture.minFilter = THREE.LinearMipmapLinearFilter;
      
      // Crear mapa de normales para dar relieve
      const normalCanvas = document.createElement('canvas');
      normalCanvas.width = 1024;
      normalCanvas.height = 512;
      const normalCtx = normalCanvas.getContext('2d');
      const normalGradient = normalCtx.createRadialGradient(512, 256, 0, 512, 256, 512);
      normalGradient.addColorStop(0, '#8080ff');
      normalGradient.addColorStop(1, '#8080ff');
      normalCtx.fillStyle = normalGradient;
      normalCtx.fillRect(0, 0, 1024, 512);
      
      const normalTexture = new THREE.CanvasTexture(normalCanvas);
      
      const earthMaterial = new THREE.MeshPhongMaterial({ 
        map: earthTexture,
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(0.5, 0.5),
        shininess: 100,
        specular: 0x444444,
        reflectivity: 0.3
      });
      
      const earth = new THREE.Mesh(earthGeometry, earthMaterial);
      earth.position.set(0, 0, 0);
      earth.castShadow = true;
      earth.receiveShadow = true;
      scene.add(earth);

      // Agregar atmósfera alrededor de la Tierra
      const atmosphereGeometry = new THREE.SphereGeometry(21, 64, 32);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
      });
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      earth.add(atmosphere);

      // Crear el meteorito más bonito y alejado
      const meteoroidGroup = new THREE.Group();
      
      // Cuerpo principal del meteorito (forma irregular)
      const meteoroidGeometry = new THREE.SphereGeometry(3, 16, 12);
      // Modificar la geometría para hacerla más irregular
      const positions = meteoroidGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        // Añadir variaciones aleatorias para hacer la forma más irregular
        const noise = 0.3;
        positions.setX(i, x + (Math.random() - 0.5) * noise);
        positions.setY(i, y + (Math.random() - 0.5) * noise);
        positions.setZ(i, z + (Math.random() - 0.5) * noise);
      }
      positions.needsUpdate = true;
      
      const meteoroidMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B4513, // Marrón rocoso
        emissive: 0x2F1B14, // Brillo interno tenue
        shininess: 30,
        specular: 0x111111,
        roughness: 0.8
      });
      
      const meteoroid = new THREE.Mesh(meteoroidGeometry, meteoroidMaterial);
      meteoroid.castShadow = true;
      meteoroid.receiveShadow = true;
      meteoroidGroup.add(meteoroid);

      // Agregar cráteres y detalles al meteorito
      for (let i = 0; i < 8; i++) {
        const craterGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 8, 6);
        const craterMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x654321,
          transparent: true,
          opacity: 0.6
        });
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        
        // Posición aleatoria en la superficie
        const phi = Math.random() * Math.PI;
        const theta = Math.random() * Math.PI * 2;
        const radius = 3.2;
        crater.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
        crater.scale.set(0.5, 0.5, 0.3); // Aplanar para simular cráter
        meteoroidGroup.add(crater);
      }

      // Estela brillante del meteorito
      const trailGeometry = new THREE.ConeGeometry(0.8, 12, 8);
      const trailMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4500, // Naranja rojizo
        transparent: true,
        opacity: 0.8
      });
      const trail = new THREE.Mesh(trailGeometry, trailMaterial);
      trail.rotation.z = Math.PI;
      trail.position.z = -6;
      meteoroidGroup.add(trail);

      // Partículas brillantes alrededor del meteorito
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 50;
      const particlesPositions = new Float32Array(particlesCount * 3);
      const particlesColors = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // Posiciones alrededor del meteorito
        particlesPositions[i3] = (Math.random() - 0.5) * 8;
        particlesPositions[i3 + 1] = (Math.random() - 0.5) * 8;
        particlesPositions[i3 + 2] = (Math.random() - 0.5) * 8;
        
        // Colores naranjas y amarillos
        particlesColors[i3] = 1; // R
        particlesColors[i3 + 1] = 0.5 + Math.random() * 0.5; // G
        particlesColors[i3 + 2] = 0; // B
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particlesColors, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
      });
      
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      meteoroidGroup.add(particles);

      meteoroidGroup.position.set(40, 40, 40);
      scene.add(meteoroidGroup);

      // Crear órbita terrestre más visible
      const orbitGeometry = new THREE.RingGeometry(25, 27, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x4a90e2, 
        transparent: true, 
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);

      // Agregar luces más realistas
      const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
      scene.add(ambientLight);

      // Luz solar principal
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
      sunLight.position.set(100, 100, 100);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 500;
      sunLight.shadow.camera.left = -50;
      sunLight.shadow.camera.right = 50;
      sunLight.shadow.camera.top = 50;
      sunLight.shadow.camera.bottom = -50;
      scene.add(sunLight);

      // Luz de relleno suave
      const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
      fillLight.position.set(-50, -50, -50);
      scene.add(fillLight);

      // Crear campo de estrellas redonditas y pequeñas
      const starsGroup = new THREE.Group();
      
      for (let i = 0; i < 5000; i++) {
        // Posiciones aleatorias en una esfera
        const radius = 200 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        // Crear estrella individual como esfera pequeña
        const starGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 8, 6);
        
        // Colores de estrellas reales
        const starType = Math.random();
        let starColor;
        if (starType < 0.7) {
          starColor = 0xffffff; // Blanco
        } else if (starType < 0.9) {
          starColor = 0x87ceeb; // Azul claro
        } else {
          starColor = 0xffd700; // Amarillo dorado
        }
        
        const starMaterial = new THREE.MeshBasicMaterial({ 
          color: starColor,
          emissive: starColor,
          emissiveIntensity: 0.3
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(x, y, z);
        starsGroup.add(star);
      }
      
      scene.add(starsGroup);

      // Agregar ejes de referencia
      const axesHelper = new THREE.AxesHelper(20);
      scene.add(axesHelper);

      // Agregar controles de órbita
      const controls = new OrbitControls(camera, canvasRef.current);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.enableRotate = true;
      controls.minDistance = 50;
      controls.maxDistance = 500;

      // Guardar referencias
      sceneRef.current = { scene, camera, renderer, controls };
      meteoroidRef.current = meteoroidGroup;

      // Función de animación
      const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotar la Tierra
        earth.rotation.y += 0.005;
        
        // Rotar las estrellas lentamente
        starsGroup.rotation.y += 0.0001;
        
        // Actualizar controles
        controls.update();
        
        renderer.render(scene, camera);
      };
      animate();

      // Resize handler
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      console.log('Escena Three.js creada correctamente');

      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        earthGeometry.dispose();
        earthMaterial.dispose();
        meteoroidGeometry.dispose();
        meteoroidMaterial.dispose();
        // Las estrellas se limpian automáticamente al remover el grupo
        // Los materiales y geometrías de partículas también se limpian automáticamente
      };

    } catch (error) {
      console.error('Error creating Three.js scene:', error);
    }
  }, []);

  // Animar el meteorito usando datos reales de trayectoria del backend
  useEffect(() => {
    if (!meteoroidRef.current || !simulationResults || !sceneRef.current || !shouldAnimate) return;

    try {
      console.log('Simulation results for animation:', simulationResults);
      
      // Verificar que tenemos datos de trayectoria del backend
      if (simulationResults.trajectory && Array.isArray(simulationResults.trajectory)) {
        const trajectory = simulationResults.trajectory;
        
        // Detener animación anterior si existe
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
        
        // Crear trail/rastro del meteorito usando datos reales
        const trailGeometry = new THREE.BufferGeometry();
        const trailVertices = [];
        const trailColors = [];
        
        // Usar los puntos reales de la trayectoria del backend
        trajectory.forEach((point, index) => {
          if (point.position && Array.isArray(point.position) && point.position.length >= 3) {
            // Escalar las posiciones para visualización (el backend devuelve km, nosotros usamos unidades más pequeñas)
            const x = point.position[0] * 0.01 + 40;
            const y = point.position[1] * 0.01 + 40;
            const z = point.position[2] * 0.01 + 40;
            
            trailVertices.push(x, y, z);
            
            // Color gradient basado en el progreso de la trayectoria
            const alpha = 1 - (index / trajectory.length);
            trailColors.push(1, 0.3, 0.2, alpha); // RGBA - rojo que se desvanece
          }
        });
        
        if (trailVertices.length > 0) {
          trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailVertices, 3));
          trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 4));
          
          const trailMaterial = new THREE.LineBasicMaterial({ 
            vertexColors: true,
            transparent: true,
            opacity: 0.8
          });
          const trail = new THREE.Line(trailGeometry, trailMaterial);
          
          // Remover trail anterior si existe
          const existingTrail = sceneRef.current.scene.getObjectByName('meteoroidTrail');
          if (existingTrail) {
            sceneRef.current.scene.remove(existingTrail);
          }
          
          trail.name = 'meteoroidTrail';
          sceneRef.current.scene.add(trail);

          // Animar el meteorito siguiendo la trayectoria real del backend
          let animationTime = 0;
          const animationDuration = 5000; // 5 segundos para completar la trayectoria
          let currentTrajectoryIndex = 0;
          
          const animateMeteoroid = () => {
            if (!meteoroidRef.current || !trajectory.length) return;
            
            const progress = (animationTime % animationDuration) / animationDuration;
            const targetIndex = Math.floor(progress * (trajectory.length - 1));
            
            // Interpolación suave entre puntos de la trayectoria
            if (targetIndex < trajectory.length - 1) {
              const currentPoint = trajectory[targetIndex];
              const nextPoint = trajectory[targetIndex + 1];
              const localProgress = (progress * (trajectory.length - 1)) - targetIndex;
              
              if (currentPoint.position && nextPoint.position) {
                // Interpolar entre el punto actual y el siguiente
                const x = (currentPoint.position[0] * (1 - localProgress) + nextPoint.position[0] * localProgress) * 0.01 + 40;
                const y = (currentPoint.position[1] * (1 - localProgress) + nextPoint.position[1] * localProgress) * 0.01 + 40;
                const z = (currentPoint.position[2] * (1 - localProgress) + nextPoint.position[2] * localProgress) * 0.01 + 40;
                
                meteoroidRef.current.position.set(x, y, z);
              }
            } else if (trajectory.length > 0) {
              // Último punto de la trayectoria
              const lastPoint = trajectory[trajectory.length - 1];
              if (lastPoint.position) {
                meteoroidRef.current.position.set(
                  lastPoint.position[0] * 0.01 + 40,
                  lastPoint.position[1] * 0.01 + 40,
                  lastPoint.position[2] * 0.01 + 40
                );
              }
            }
            
            // Rotar el meteorito mientras se mueve
            meteoroidRef.current.rotation.x += 0.02;
            meteoroidRef.current.rotation.y += 0.01;
            meteoroidRef.current.rotation.z += 0.005;
            
            animationTime += 16; // ~60fps
            animationIdRef.current = requestAnimationFrame(animateMeteoroid);
          };
          
          // Iniciar animación
          animateMeteoroid();

          console.log('Meteoroid animation started with real trajectory data:', trajectory.length, 'points');
        }
      } else {
        console.warn('No valid trajectory data found in simulation results:', simulationResults);
      }
    } catch (error) {
      console.error('Error animating meteoroid with real trajectory:', error);
    }
  }, [simulationResults, shouldAnimate]);

  const handleNEOSelected = (neoId) => {
    console.log('NEO seleccionado:', neoId);
    setSelectedNEOId(neoId);
  };

  const handleTrajectoryCalculated = (trajectoryData) => {
    console.log('Trayectoria calculada:', trajectoryData);
    setSimulationResults(trajectoryData);
    setShouldAnimate(true); // Activar animación cuando se calcula la trayectoria
  };

  const handleParametersChange = (params) => {
    setTrajectoryParams(params);
  };

  const toggleNEOSelector = () => {
    setShowNEOSelector(!showNEOSelector);
    if (showNEOSelector) {
      // Si se está cerrando el selector, resetear la animación
      setShouldAnimate(false);
      setSimulationResults(null);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    }
  };
  
  return (
    <div className="simulator-container">
      {/* Canvas de Three.js */}
      <canvas ref={canvasRef} className="simulator-canvas" />
      
      {/* Logo ASTRALIS - BU */}
      <div className="logo-container">
        <div className="logo-text">ASTRALIS</div>
        <div className="logo-subtext">BU</div>
      </div>
      
      {/* Botón para abrir selector de NEOs */}
      <div className="neo-selector-button-container">
        <button onClick={toggleNEOSelector} className="neo-selector-button">
          {showNEOSelector ? 'Cerrar Selector' : 'Seleccionar NEO'}
        </button>
      </div>
      

      {/* Selector de NEOs */}
      <div className={`neo-selector-overlay ${showNEOSelector ? 'open' : ''}`}>
        <NEOSelector
          onNEOSelected={handleNEOSelected}
          onTrajectoryCalculated={handleTrajectoryCalculated}
          onParametersChange={handleParametersChange}
        />
      </div>

      {/* Información del Meteorito */}
      {trajectoryParams && (
        <div className="meteoroid-info">
          <div className="info-panel">
            <h4>☄️ Meteorito Activo</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Posición:</span>
                <span className="info-value">
                  [{trajectoryParams.position_km?.map(v => v.toFixed(0)).join(', ')}] km
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Velocidad:</span>
                <span className="info-value">
                  [{trajectoryParams.velocity_kms?.map(v => v.toFixed(1)).join(', ')}] km/s
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Densidad:</span>
                <span className="info-value">{trajectoryParams.density_kg_m3} kg/m³</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leyenda de la Escena */}
      <div className="scene-legend">
        <div className="legend-panel">
          <h4>🌌 Elementos de la Escena</h4>
          <div className="legend-grid">
            <div className="legend-item">
              <span className="legend-color" style={{color: '#4a90e2'}}>🌍</span>
              <span className="legend-text">Tierra (rotando)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{color: '#4a90e2'}}>●</span>
              <span className="legend-text">Órbita terrestre</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{color: '#ff6b47'}}>☄️</span>
              <span className="legend-text">Meteorito (animado)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{color: '#ff4444'}}>●</span>
              <span className="legend-text">Trayectoria del meteorito</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{color: '#ffffff'}}>✨</span>
              <span className="legend-text">Campo de estrellas</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{color: '#666'}}>●</span>
              <span className="legend-text">Ejes de referencia</span>
            </div>
          </div>
          <div className="legend-instructions">
            <p><strong>Visualización:</strong> Three.js con texturas reales de la Tierra</p>
            <p><strong>Animación:</strong> Tierra rotando, meteorito en movimiento</p>
            <p><strong>Controles:</strong> Arrastra para rotar, rueda para zoom</p>
          </div>
        </div>
      </div>

      {/* Resultados de simulación */}
      {simulationResults && (
        <div className="simulation-results">
          <h3>Resultados de Simulación</h3>
          <pre>{JSON.stringify(simulationResults, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default AsteroidSimulator;
