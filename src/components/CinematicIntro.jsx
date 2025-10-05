import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './CinematicIntro.css';

function CinematicIntro({ onComplete }) {
  const [stage, setStage] = useState(0); // 0: stars, 1: logo, 2: subtitle, 3: prompt
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.z = 1;
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Crear estrellas
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starSizes = [];
    
    for (let i = 0; i < 3000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
      starSizes.push(Math.random() * 2);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Animación
    let opacity = 0;
    let rotation = 0;
    
    function animate() {
      requestAnimationFrame(animate);
      
      // Fade in de estrellas
      if (opacity < 1) {
        opacity += 0.01;
        starMaterial.opacity = opacity;
      }
      
      rotation += 0.0002;
      stars.rotation.y = rotation;
      stars.rotation.x = rotation * 0.5;
      
      camera.position.z = 1 + Math.sin(rotation * 2) * 0.1;
      
      renderer.render(scene, camera);
    }
    animate();
    
    // Stages de la intro
    const timers = [
      setTimeout(() => setStage(1), 1000),   // Logo aparece
      setTimeout(() => setStage(2), 2500),   // Subtítulo
      setTimeout(() => setStage(3), 4000),   // Prompt
    ];
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      timers.forEach(t => clearTimeout(t));
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);
  
  return (
    <div className="intro-container" onClick={onComplete}>
      <canvas ref={canvasRef} className="intro-canvas" />
      
      <div className="intro-content">
        <div 
          className={`intro-logo ${stage >= 1 ? 'visible' : ''}`}
        >
          ASTRALIS
        </div>
        
        <div 
          className={`intro-subtitle ${stage >= 2 ? 'visible' : ''}`}
        >
          BEYOND UNIVERSE
        </div>
        
        <div 
          className={`intro-description ${stage >= 2 ? 'visible' : ''}`}
        >
          ASTEROID IMPACT SIMULATOR
        </div>
        
        {stage >= 3 && (
          <div className="intro-prompt">
            <div className="intro-prompt-text">CLICK TO ENTER</div>
            <div className="intro-prompt-arrow">▼</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CinematicIntro;