import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './SpaceVisualization.css';

function SpaceVisualization({ trajectoryParams, selectedNEO, simulationResults }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const meteoroidRef = useRef(null);
  const [spacekitLoaded, setSpacekitLoaded] = useState(false);

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
      // Cleanup script
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Crear la escena 3D cuando SpaceKit esté cargado
  useEffect(() => {
    if (!spacekitLoaded || !canvasRef.current) return;

    try {
      // Crear la escena con SpaceKit
      const scene = new window.Spacekit.Simulation(canvasRef.current, {
        basePath: 'https://typpo.github.io/spacekit/build/',
        jd: 2459031.5, // Fecha de referencia
        startPaused: false,
        startDate: new Date(),
      });

      // Agregar la Tierra
      scene.createSphere('earth', {
        textureUrl: 'https://typpo.github.io/spacekit/build/lroc_color_poles_1k.jpg',
        radius: 6371, // Radio de la Tierra en km
        segments: 64,
      });

      // Posicionar la Tierra en el centro
      scene.getObject('earth').position.set(0, 0, 0);

      // Crear la órbita terrestre (representada como un círculo)
      const orbitGeometry = new THREE.RingGeometry(149597870, 149597870 + 1000, 64);
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x4a90e2, 
        transparent: true, 
        opacity: 0.3 
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2; // Rotar para que esté en el plano XY
      scene.getScene().add(orbit);

      // Crear el meteorito
      const meteoroidGeometry = new THREE.SphereGeometry(50, 16, 16); // Pequeño meteorito
      const meteoroidMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xff6b47,
        emissive: 0x331100
      });
      const meteoroid = new THREE.Mesh(meteoroidGeometry, meteoroidMaterial);
      
      // Posición inicial del meteorito
      meteoroid.position.set(0, 0, 0);
      scene.getScene().add(meteoroid);
      
      // Guardar referencias
      sceneRef.current = scene;
      meteoroidRef.current = meteoroid;

      // Configurar cámara
      const camera = scene.getCamera();
      camera.position.set(200000, 200000, 200000);
      camera.lookAt(0, 0, 0);

      // Agregar luces
      const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
      scene.getScene().add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(150000, 150000, 150000);
      scene.getScene().add(directionalLight);

      // Agregar estrellas de fondo
      const starGeometry = new THREE.BufferGeometry();
      const starVertices = [];
      for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 4000000;
        const y = (Math.random() - 0.5) * 4000000;
        const z = (Math.random() - 0.5) * 4000000;
        starVertices.push(x, y, z);
      }
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        sizeAttenuation: true
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.getScene().add(stars);

      console.log('SpaceKit scene created successfully');

    } catch (error) {
      console.error('Error creating SpaceKit scene:', error);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, [spacekitLoaded]);

  // Actualizar posición del meteorito cuando cambien los parámetros
  useEffect(() => {
    if (!meteoroidRef.current || !trajectoryParams) return;

    try {
      const { position_km, velocity_kms } = trajectoryParams;
      
      if (position_km && position_km.length === 3) {
        // Posicionar el meteorito según los parámetros
        meteoroidRef.current.position.set(
          position_km[0] * 1000, // Convertir km a metros para mejor visualización
          position_km[1] * 1000,
          position_km[2] * 1000
        );

        // Crear un trail/rastro del meteorito
        const trailGeometry = new THREE.BufferGeometry();
        const trailVertices = [];
        
        // Crear puntos a lo largo de la trayectoria esperada
        const steps = 50;
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const x = position_km[0] * 1000 + (velocity_kms[0] * 1000) * t * 100;
          const y = position_km[1] * 1000 + (velocity_kms[1] * 1000) * t * 100;
          const z = position_km[2] * 1000 + (velocity_kms[2] * 1000) * t * 100;
          trailVertices.push(x, y, z);
        }
        
        trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailVertices, 3));
        const trailMaterial = new THREE.LineBasicMaterial({ 
          color: 0xff4444, 
          transparent: true, 
          opacity: 0.6 
        });
        const trail = new THREE.Line(trailGeometry, trailMaterial);
        
        // Remover trail anterior si existe
        const existingTrail = sceneRef.current?.getScene().getObjectByName('meteoroidTrail');
        if (existingTrail) {
          sceneRef.current.getScene().remove(existingTrail);
        }
        
        trail.name = 'meteoroidTrail';
        sceneRef.current?.getScene().add(trail);

        console.log('Meteoroid positioned:', position_km);
      }
    } catch (error) {
      console.error('Error updating meteoroid position:', error);
    }
  }, [trajectoryParams]);

  // Mostrar resultados de simulación si están disponibles
  useEffect(() => {
    if (!simulationResults || !sceneRef.current) return;

    try {
      // Aquí podrías agregar visualizaciones adicionales basadas en los resultados
      // Por ejemplo, mostrar el punto de impacto si se detecta uno
      if (simulationResults.impact_data) {
        console.log('Impact detected, showing visualization...');
        // Agregar marcador de impacto
        const impactGeometry = new THREE.SphereGeometry(5000, 16, 16);
        const impactMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xff0000,
          transparent: true,
          opacity: 0.8
        });
        const impactMarker = new THREE.Mesh(impactGeometry, impactMaterial);
        impactMarker.position.set(0, 0, 0); // Posición del impacto
        impactMarker.name = 'impactMarker';
        sceneRef.current.getScene().add(impactMarker);
      }
    } catch (error) {
      console.error('Error showing simulation results:', error);
    }
  }, [simulationResults]);

  return (
    <div className="space-visualization">
      <div className="visualization-header">
        <h3>Visualización Espacial 3D</h3>
        <div className="visualization-info">
          {selectedNEO && <span>NEO: {selectedNEO}</span>}
          {trajectoryParams && (
            <span>
              Posición: [{trajectoryParams.position_km?.map(v => v.toFixed(0)).join(', ')}] km
            </span>
          )}
        </div>
      </div>
      <canvas 
        ref={canvasRef} 
        className="space-canvas"
        style={{ 
          width: '100%', 
          height: '600px',
          background: '#000011'
        }}
      />
      <div className="visualization-controls">
        <div className="control-info">
          <p>🌍 Tierra (centro)</p>
          <p>🔵 Órbita terrestre (línea azul)</p>
          <p>☄️ Meteorito (esfera naranja)</p>
          <p>📈 Trayectoria prevista (línea roja)</p>
        </div>
      </div>
    </div>
  );
}

export default SpaceVisualization;
