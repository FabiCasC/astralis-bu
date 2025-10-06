import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import NEOSelector from "./NEOSelector";
import TrajectoryVisualization from "./TrajectoryVisualization";
import ImpactCards from "./ImpactCards";
import "./AsteroidSimulator.css";

function AsteroidSimulator() {
  const canvasRef = useRef(null);

  // Estados para el selector de NEOs
  const [showNEOSelector, setShowNEOSelector] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [trajectoryParams, setTrajectoryParams] = useState(null);
  const [selectedNEOId, setSelectedNEOId] = useState(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [showImpactCards, setShowImpactCards] = useState(false);

  // Estados para SpaceKit
  const [spacekitLoaded, setSpacekitLoaded] = useState(false);
  const sceneRef = useRef(null);
  const meteoroidRef = useRef(null);
  const animationIdRef = useRef(null);

  // Cargar SpaceKit dinámicamente
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://typpo.github.io/spacekit/build/spacekit.js";
    script.onload = () => {
      console.log("SpaceKit loaded successfully");
      setSpacekitLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load SpaceKit");
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
        alpha: true,
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
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      // Crear gradiente base más realista (océanos)
      const oceanGradient = ctx.createRadialGradient(
        512,
        256,
        0,
        512,
        256,
        512
      );
      oceanGradient.addColorStop(0, "#4A90E2"); // Azul claro central
      oceanGradient.addColorStop(0.3, "#2E86C1"); // Azul medio
      oceanGradient.addColorStop(0.7, "#1B4F72"); // Azul oscuro
      oceanGradient.addColorStop(1, "#0B2638"); // Azul muy oscuro en los bordes

      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, 1024, 512);

      // Agregar ruido para simular olas y variaciones oceánicas
      const imageData = ctx.getImageData(0, 0, 1024, 512);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 20;
        data[i] = Math.max(0, Math.min(255, data[i] + noise)); // R
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
      }
      ctx.putImageData(imageData, 0, 0);

      // Agregar continentes con formas más detalladas y realistas
      ctx.fillStyle = "#27AE60"; // Verde más realista

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
      ctx.fillStyle = "#229954"; // Verde más oscuro para bosques
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 15 + 5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Agregar desiertos (color marrón)
      ctx.fillStyle = "#D4AC0D";
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
      const normalCanvas = document.createElement("canvas");
      normalCanvas.width = 1024;
      normalCanvas.height = 512;
      const normalCtx = normalCanvas.getContext("2d");
      const normalGradient = normalCtx.createRadialGradient(
        512,
        256,
        0,
        512,
        256,
        512
      );
      normalGradient.addColorStop(0, "#8080ff");
      normalGradient.addColorStop(1, "#8080ff");
      normalCtx.fillStyle = normalGradient;
      normalCtx.fillRect(0, 0, 1024, 512);

      const normalTexture = new THREE.CanvasTexture(normalCanvas);

      const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(0.5, 0.5),
        shininess: 100,
        specular: 0x444444,
        reflectivity: 0.3,
      });

      const earth = new THREE.Mesh(earthGeometry, earthMaterial);
      earth.position.set(0, 0, 0);
      earth.castShadow = true;
      earth.receiveShadow = true;
      scene.add(earth);

      // Agregar atmósfera alrededor de la Tierra
      const atmosphereGeometry = new THREE.SphereGeometry(21, 64, 32);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
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
        color: 0x8b4513, // Marrón rocoso
        emissive: 0x2f1b14, // Brillo interno tenue
        shininess: 30,
        specular: 0x111111,
        roughness: 0.8,
      });

      const meteoroid = new THREE.Mesh(meteoroidGeometry, meteoroidMaterial);
      meteoroid.castShadow = true;
      meteoroid.receiveShadow = true;
      meteoroidGroup.add(meteoroid);

      // Agregar cráteres y detalles al meteorito
      for (let i = 0; i < 8; i++) {
        const craterGeometry = new THREE.SphereGeometry(
          0.3 + Math.random() * 0.5,
          8,
          6
        );
        const craterMaterial = new THREE.MeshBasicMaterial({
          color: 0x654321,
          transparent: true,
          opacity: 0.6,
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

      // Estela brillante del meteorito (mejorada para la animación)
      const trailGeometry = new THREE.ConeGeometry(0.8, 12, 8);
      const trailMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4500, // Naranja rojizo
        transparent: true,
        opacity: 0.8,
      });
      const trail = new THREE.Mesh(trailGeometry, trailMaterial);
      trail.rotation.z = Math.PI;
      trail.position.z = -6;
      trail.name = "meteoroidTrail"; // Nombre para identificarlo durante la animación
      meteoroidGroup.add(trail);

      // Partículas brillantes alrededor del meteorito (mejoradas)
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 100; // Más partículas para mejor efecto
      const particlesPositions = new Float32Array(particlesCount * 3);
      const particlesColors = new Float32Array(particlesCount * 3);
      const particlesSizes = new Float32Array(particlesCount);

      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // Posiciones alrededor del meteorito
        particlesPositions[i3] = (Math.random() - 0.5) * 12;
        particlesPositions[i3 + 1] = (Math.random() - 0.5) * 12;
        particlesPositions[i3 + 2] = (Math.random() - 0.5) * 12;

        // Colores naranjas y amarillos variados
        particlesColors[i3] = 1; // R
        particlesColors[i3 + 1] = 0.3 + Math.random() * 0.7; // G
        particlesColors[i3 + 2] = Math.random() * 0.3; // B

        // Tamaños variables
        particlesSizes[i] = 0.5 + Math.random() * 1.5;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlesPositions, 3)
      );
      particlesGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(particlesColors, 3)
      );
      particlesGeometry.setAttribute(
        "size",
        new THREE.BufferAttribute(particlesSizes, 1)
      );

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending, // Efecto de brillo aditivo
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      particles.name = "meteoroidParticles"; // Nombre para animación
      meteoroidGroup.add(particles);

      meteoroidGroup.position.set(40, 40, 40);
      scene.add(meteoroidGroup);

      // Crear órbita terrestre más visible - COMENTADO (removido por solicitud del usuario)
      // const orbitGeometry = new THREE.RingGeometry(25, 27, 64);
      // const orbitMaterial = new THREE.MeshBasicMaterial({
      //   color: 0x4a90e2,
      //   transparent: true,
      //   opacity: 0.8,
      //   side: THREE.DoubleSide,
      // });
      // const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      // orbit.rotation.x = Math.PI / 2;
      // scene.add(orbit);

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
      const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
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
        const starGeometry = new THREE.SphereGeometry(
          0.1 + Math.random() * 0.2,
          8,
          6
        );

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
          emissiveIntensity: 0.3,
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
      window.addEventListener("resize", handleResize);

      console.log("Escena Three.js creada correctamente");

      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
        earthGeometry.dispose();
        earthMaterial.dispose();
        meteoroidGeometry.dispose();
        meteoroidMaterial.dispose();
        // Las estrellas se limpian automáticamente al remover el grupo
        // Los materiales y geometrías de partículas también se limpian automáticamente
      };
    } catch (error) {
      console.error("Error creating Three.js scene:", error);
    }
  }, []);

  // Animar el meteorito usando datos reales de trayectoria del backend
  useEffect(() => {
    if (
      !meteoroidRef.current ||
      !simulationResults ||
      !sceneRef.current ||
      !shouldAnimate
    )
      return;

    try {
      console.log("Simulation results for animation:", simulationResults);

      // Verificar que tenemos datos de trayectoria del backend
      if (
        simulationResults.trajectory &&
        Array.isArray(simulationResults.trajectory) &&
        simulationResults.trajectory.length > 0
      ) {
        const trajectory = simulationResults.trajectory;

        console.log("📊 Trajectory data analysis:");
        console.log("- Total points:", trajectory.length);
        console.log("- First point structure:", trajectory[0]);
        console.log(
          "- Has position data:",
          trajectory[0]?.position ? "✅" : "❌"
        );

        // Verificar que al menos algunos puntos tienen datos de posición válidos
        const validPoints = trajectory.filter(
          (point) =>
            point.position &&
            Array.isArray(point.position) &&
            point.position.length >= 3 &&
            !isNaN(point.position[0]) &&
            !isNaN(point.position[1]) &&
            !isNaN(point.position[2])
        );

        console.log("- Valid points with position data:", validPoints.length);

        if (validPoints.length === 0) {
          console.log("⚠️ No valid trajectory points found, using fallback animation");
          // No mostrar error, usar animación de respaldo
        }

        // Detener animación anterior si existe
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }

        // Crear trail/rastro del meteorito usando datos reales con mejor visualización
        const trailGeometry = new THREE.BufferGeometry();
        const trailVertices = [];
        const trailColors = [];

        // Normalizar y escalar las posiciones de la trayectoria
        let minDist = Infinity;
        let maxDist = -Infinity;

        // Encontrar el rango de distancias para normalizar
        trajectory.forEach((point) => {
          if (
            point.position &&
            Array.isArray(point.position) &&
            point.position.length >= 3
          ) {
            const dist = Math.sqrt(
              point.position[0] * point.position[0] +
                point.position[1] * point.position[1] +
                point.position[2] * point.position[2]
            );
            minDist = Math.min(minDist, dist);
            maxDist = Math.max(maxDist, dist);
          }
        });

        // Usar los puntos reales de la trayectoria del backend con escalado dinámico mejorado
        console.log("Trajectory data preview:", trajectory.slice(0, 3));

        // Calcular escalado dinámico basado en el rango de distancias
        const distanceRange = maxDist - minDist;
        let scale;

        if (distanceRange > 1000000) {
          // Más de 1M km
          scale = 0.0001; // Escala muy pequeña para distancias enormes
        } else if (distanceRange > 100000) {
          // Más de 100k km
          scale = 0.001; // Escala pequeña
        } else if (distanceRange > 10000) {
          // Más de 10k km
          scale = 0.01; // Escala media
        } else {
          scale = 0.1; // Escala grande para distancias pequeñas
        }

        console.log(
          `Using scale: ${scale} for distance range: ${distanceRange} km`
        );

        trajectory.forEach((point, index) => {
          if (
            point.position &&
            Array.isArray(point.position) &&
            point.position.length >= 3
          ) {
            // Escalado dinámico mejorado
            const centerOffset = { x: 0, y: 0, z: 0 }; // Centrar en la Tierra

            const x = point.position[0] * scale + centerOffset.x;
            const y = point.position[1] * scale + centerOffset.y;
            const z = point.position[2] * scale + centerOffset.z;

            trailVertices.push(x, y, z);

            // Gradiente de color más vibrante
            const progress = index / trajectory.length;
            const red = 1.0;
            const green = 0.5 * (1 - progress) + 0.8 * progress; // De naranja a amarillo
            const blue = 0.1 * progress; // Ligero azul al final
            const alpha = 0.9 - progress * 0.3; // Se desvanece gradualmente

            trailColors.push(red, green, blue, alpha);
          }
        });

        if (trailVertices.length > 0) {
          trailGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(trailVertices, 3)
          );
          trailGeometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(trailColors, 4)
          );

          const trailMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            linewidth: 3, // Línea más gruesa
          });
          const trail = new THREE.Line(trailGeometry, trailMaterial);

          // Remover trail anterior si existe
          const existingTrail =
            sceneRef.current.scene.getObjectByName("meteoroidTrail");
          if (existingTrail) {
            sceneRef.current.scene.remove(existingTrail);
          }

          trail.name = "meteoroidTrail";
          sceneRef.current.scene.add(trail);

          // Mejorar la animación del meteorito para seguir la trayectoria más suavemente
          let animationTime = 0;
          const animationDuration = 8000; // 8 segundos para una animación más lenta y fluida
          let previousPosition = null;
          const startTime = Date.now();

          const animateMeteoroid = () => {
            if (!meteoroidRef.current || !trajectory.length) return;

            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = (elapsed % animationDuration) / animationDuration;

            // Índice actual en la trayectoria
            const trajectoryIndex = progress * (trajectory.length - 1);
            const currentIndex = Math.floor(trajectoryIndex);
            const nextIndex = Math.min(currentIndex + 1, trajectory.length - 1);
            const localProgress = trajectoryIndex - currentIndex;

            if (
              currentIndex < trajectory.length &&
              nextIndex < trajectory.length
            ) {
              const currentPoint = trajectory[currentIndex];
              const nextPoint = trajectory[nextIndex];

              if (currentPoint.position && nextPoint.position) {
                // Interpolación suave con curva de Bézier para movimiento más fluido
                // Usar el mismo escalado dinámico que el trail
                const distanceRange = maxDist - minDist;
                let scale;

                if (distanceRange > 1000000) {
                  scale = 0.0001;
                } else if (distanceRange > 100000) {
                  scale = 0.001;
                } else if (distanceRange > 10000) {
                  scale = 0.01;
                } else {
                  scale = 0.1;
                }

                const centerOffset = { x: 0, y: 0, z: 0 };

                // Interpolación cúbica para suavizar el movimiento
                const t = localProgress;
                const t2 = t * t;
                const t3 = t2 * t;

                // Coeficientes para interpolación suave
                const factor1 = 1 - 3 * t2 + 2 * t3;
                const factor2 = 3 * t2 - 2 * t3;

                const x =
                  (currentPoint.position[0] * factor1 +
                    nextPoint.position[0] * factor2) *
                    scale +
                  centerOffset.x;
                const y =
                  (currentPoint.position[1] * factor1 +
                    nextPoint.position[1] * factor2) *
                    scale +
                  centerOffset.y;
                const z =
                  (currentPoint.position[2] * factor1 +
                    nextPoint.position[2] * factor2) *
                    scale +
                  centerOffset.z;

                meteoroidRef.current.position.set(x, y, z);

                // Log para debugging (solo ocasionalmente para no saturar la consola)
                if (
                  Math.floor(progress * 100) % 10 === 0 &&
                  Math.floor(localProgress * 10) === 0
                ) {
                  console.log(
                    `Meteoroid position: x=${x.toFixed(2)}, y=${y.toFixed(
                      2
                    )}, z=${z.toFixed(2)}, progress=${(progress * 100).toFixed(
                      1
                    )}%`
                  );
                }

                // Orientar el meteorito hacia la dirección del movimiento
                if (previousPosition) {
                  const direction = new THREE.Vector3(
                    x - previousPosition.x,
                    y - previousPosition.y,
                    z - previousPosition.z
                  ).normalize();

                  meteoroidRef.current.lookAt(
                    meteoroidRef.current.position.x + direction.x,
                    meteoroidRef.current.position.y + direction.y,
                    meteoroidRef.current.position.z + direction.z
                  );
                }

                previousPosition = { x, y, z };
              }
            }

            // Rotación del meteorito basada en su velocidad
            const rotationSpeed = 0.01 + progress * 0.03; // Acelera la rotación
            meteoroidRef.current.rotation.x += rotationSpeed;
            meteoroidRef.current.rotation.y += rotationSpeed * 0.7;
            meteoroidRef.current.rotation.z += rotationSpeed * 0.5;

            // Efectos visuales adicionales durante el movimiento
            if (meteoroidRef.current.children.length > 0) {
              // Intensificar la estela según la velocidad
              const velocity = Math.min(progress * 2, 1);

              meteoroidRef.current.children.forEach((child) => {
                if (child.name === "meteoroidTrail") {
                  // Ajustar la estela del meteorito
                  if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = 0.8 + velocity * 0.2;
                  }
                  // Escalar la estela según la velocidad
                  child.scale.setScalar(1 + velocity * 0.5);
                } else if (child.name === "meteoroidParticles") {
                  // Animar las partículas
                  if (child.geometry && child.geometry.attributes.position) {
                    const positions = child.geometry.attributes.position.array;
                    for (let i = 0; i < positions.length; i += 3) {
                      // Crear movimiento turbulento en las partículas
                      positions[i] += (Math.random() - 0.5) * 0.1;
                      positions[i + 1] += (Math.random() - 0.5) * 0.1;
                      positions[i + 2] += (Math.random() - 0.5) * 0.1;
                    }
                    child.geometry.attributes.position.needsUpdate = true;
                  }
                  // Intensificar el brillo de las partículas
                  if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = 0.8 + velocity * 0.2;
                  }
                }
              });
            }

            animationIdRef.current = requestAnimationFrame(animateMeteoroid);
          };

          // Iniciar animación
          animateMeteoroid();

          console.log(
            "🚀 Meteoroid animation started with enhanced trajectory following:",
            trajectory.length,
            "points"
          );
          console.log(
            "📊 Trajectory range - Min distance:",
            minDist.toFixed(2),
            "km, Max distance:",
            maxDist.toFixed(2),
            "km"
          );
          console.log(
            "🎯 Scale factor applied:",
            scale,
            "- Animation duration:",
            animationDuration,
            "ms"
          );
        }
      } else {
        console.warn(
          "❌ No valid trajectory data found in simulation results:"
        );
        console.warn("- simulationResults:", simulationResults);
        console.warn(
          "- has trajectory property:",
          !!simulationResults.trajectory
        );
        console.warn(
          "- is array:",
          Array.isArray(simulationResults.trajectory)
        );
        console.warn("- length:", simulationResults.trajectory?.length);

        // Mostrar mensaje específico según el problema
        let errorMessage = "No se encontraron datos de trayectoria válidos";
        if (!simulationResults.trajectory) {
          errorMessage += " - Falta propiedad 'trajectory'";
        } else if (!Array.isArray(simulationResults.trajectory)) {
          errorMessage += " - 'trajectory' no es un array";
        } else if (simulationResults.trajectory.length === 0) {
          errorMessage += " - Array de trayectoria vacío";
        }

        console.warn(errorMessage);

        // Animación de fallback si no hay datos de trayectoria
        if (meteoroidRef.current) {
          let fallbackTime = 0;
          const fallbackAnimate = () => {
            if (!meteoroidRef.current) return;

            // Movimiento orbital simple alrededor de la Tierra
            const radius = 60;
            const speed = 0.01;
            const x = Math.cos(fallbackTime * speed) * radius;
            const y = Math.sin(fallbackTime * speed * 0.5) * 20;
            const z = Math.sin(fallbackTime * speed) * radius;

            meteoroidRef.current.position.set(x, y, z);
            meteoroidRef.current.rotation.x += 0.02;
            meteoroidRef.current.rotation.y += 0.01;

            fallbackTime++;
            animationIdRef.current = requestAnimationFrame(fallbackAnimate);
          };

          fallbackAnimate();
          console.log("Using fallback orbital animation");
        }
      }
    } catch (error) {
      console.error("Error animating meteoroid with trajectory:", error);

      // Animación de emergencia en caso de error
      if (meteoroidRef.current) {
        let emergencyTime = 0;
        const emergencyAnimate = () => {
          if (!meteoroidRef.current) return;

          const x = 40 + Math.sin(emergencyTime * 0.02) * 30;
          const y = 40 + Math.cos(emergencyTime * 0.015) * 20;
          const z = 40 + Math.sin(emergencyTime * 0.01) * 25;

          meteoroidRef.current.position.set(x, y, z);
          meteoroidRef.current.rotation.x += 0.02;
          meteoroidRef.current.rotation.y += 0.01;

          emergencyTime++;
          animationIdRef.current = requestAnimationFrame(emergencyAnimate);
        };

        emergencyAnimate();
        console.log("Using emergency animation due to error");
      }
    }
  }, [simulationResults, shouldAnimate]);

  const handleNEOSelected = (neoId) => {
    console.log("NEO seleccionado:", neoId);
    setSelectedNEOId(neoId);
  };

  const handleTrajectoryCalculated = (trajectoryData) => {
    console.log("🎯 Trayectoria calculada:", trajectoryData);

    // Verificar que tenemos datos válidos
    if (
      trajectoryData &&
      trajectoryData.trajectory &&
      Array.isArray(trajectoryData.trajectory)
    ) {
      console.log(
        `✅ Datos de trayectoria válidos - ${trajectoryData.trajectory.length} puntos recibidos`
      );
      setSimulationResults(trajectoryData);
      setShouldAnimate(true); // Activar animación cuando se calcula la trayectoria
      setShowImpactCards(true); // Mostrar tarjetas de impacto en la pantalla principal

      // Log adicional para debugging
      if (trajectoryData.trajectory.length > 0) {
        const firstPoint = trajectoryData.trajectory[0];
        const lastPoint =
          trajectoryData.trajectory[trajectoryData.trajectory.length - 1];
        console.log("🔄 Primer punto de trayectoria:", firstPoint);
        console.log("🏁 Último punto de trayectoria:", lastPoint);
      }
    } else {
      console.error("❌ Datos de trayectoria inválidos:", trajectoryData);
      alert("Error: No se pudieron obtener datos válidos de trayectoria");
    }
  };

  const handleParametersChange = (params) => {
    setTrajectoryParams(params);
  };

  const toggleNEOSelector = () => {
    setShowNEOSelector(!showNEOSelector);
    if (showNEOSelector) {
      // Si se está cerrando el selector, resetear la animación y limpiar la escena
      setShouldAnimate(false);
      setSimulationResults(null);
      setShowImpactCards(false);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }

      // Limpiar el trail de la trayectoria
      if (sceneRef.current && sceneRef.current.scene) {
        const existingTrail =
          sceneRef.current.scene.getObjectByName("meteoroidTrail");
        if (existingTrail) {
          sceneRef.current.scene.remove(existingTrail);
          existingTrail.geometry.dispose();
          existingTrail.material.dispose();
        }
      }

      // Resetear posición del meteorito a la posición inicial
      if (meteoroidRef.current) {
        meteoroidRef.current.position.set(40, 40, 40);
        meteoroidRef.current.rotation.set(0, 0, 0);
      }
    }
  };

  const handleCloseImpactCards = () => {
    setShowImpactCards(false);
  };

  const handleScenarioSelect = (scenario) => {
    // Aplicar parámetros del escenario seleccionado
    const scenarioParams = {
      position_km: [1000, 2000, 3000],
      velocity_kms: [10, 20, 30],
      density_kg_m3: 2500,
      dt: 0.5
    };

    // Ajustar parámetros según el tipo de escenario
    switch (scenario.id) {
      case 'low-impact':
        scenarioParams.velocity_kms = [5, 10, 15];
        scenarioParams.density_kg_m3 = 2000;
        break;
      case 'medium-impact':
        scenarioParams.velocity_kms = [10, 20, 30];
        scenarioParams.density_kg_m3 = 2500;
        break;
      case 'high-impact':
        scenarioParams.velocity_kms = [20, 40, 60];
        scenarioParams.density_kg_m3 = 3000;
        break;
      case 'catastrophic-impact':
        scenarioParams.velocity_kms = [50, 100, 150];
        scenarioParams.density_kg_m3 = 3500;
        break;
    }

    setTrajectoryParams(scenarioParams);
    setShowImpactCards(false);
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
          {showNEOSelector ? "Cerrar Selector" : "Seleccionar NEO"}
        </button>

        {/* Botón para reiniciar animación */}
        {simulationResults && (
          <button
            onClick={() => {
              console.log("🔄 Reiniciando animación...");
              setShouldAnimate(false);
              setTimeout(() => setShouldAnimate(true), 100);
            }}
            className="neo-selector-button"
            style={{ marginTop: "10px", backgroundColor: "#ff6b47" }}
          >
            🔄 Reiniciar Animación
          </button>
        )}
      </div>

      {/* Selector de NEOs */}
      <div className={`neo-selector-overlay ${showNEOSelector ? "open" : ""}`}>
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
                  [
                  {trajectoryParams.position_km
                    ?.map((v) => v.toFixed(0))
                    .join(", ")}
                  ] km
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Velocidad:</span>
                <span className="info-value">
                  [
                  {trajectoryParams.velocity_kms
                    ?.map((v) => v.toFixed(1))
                    .join(", ")}
                  ] km/s
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Densidad:</span>
                <span className="info-value">
                  {trajectoryParams.density_kg_m3} kg/m³
                </span>
              </div>
              {shouldAnimate && (
                <div className="info-item">
                  <span className="info-label">Estado:</span>
                  <span className="info-value" style={{ color: "#ff6b47" }}>
                    🔄 Siguiendo trayectoria
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Estado de la simulación */}
      {simulationResults && (
        <div className="simulation-status">
          <div className="status-panel">
            <h4>📊 Estado de la Simulación</h4>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Puntos de trayectoria:</span>
                <span className="status-value">
                  {simulationResults.trajectory
                    ? simulationResults.trajectory.length
                    : 0}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Animación:</span>
                <span
                  className="status-value"
                  style={{ color: shouldAnimate ? "#27ae60" : "#e74c3c" }}
                >
                  {shouldAnimate ? "▶️ Activa" : "⏸️ Pausada"}
                </span>
              </div>
              {simulationResults.impact_data && (
                <>
                  <div className="status-item">
                    <span className="status-label">⚠️ IMPACTO DETECTADO:</span>
                    <span
                      className="status-value"
                      style={{ color: "#e74c3c", fontWeight: "bold" }}
                    >
                      🔥 SÍ
                    </span>
                  </div>
                  {simulationResults.impact_data.impact_energy && (
                    <div className="status-item">
                      <span className="status-label">Energía de impacto:</span>
                      <span
                        className="status-value"
                        style={{ color: "#ff6b47" }}
                      >
                        {simulationResults.impact_data.impact_energy.toExponential(
                          2
                        )}{" "}
                        J
                      </span>
                    </div>
                  )}
                  {simulationResults.impact_data.impact_time && (
                    <div className="status-item">
                      <span className="status-label">Tiempo de impacto:</span>
                      <span
                        className="status-value"
                        style={{ color: "#f39c12" }}
                      >
                        {simulationResults.impact_data.impact_time.toFixed(2)} s
                      </span>
                    </div>
                  )}
                </>
              )}
              {simulationResults.metadata && (
                <div className="status-item">
                  <span className="status-label">Duración simulación:</span>
                  <span className="status-value">
                    {simulationResults.metadata.duration || "N/A"}
                  </span>
                </div>
              )}
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
              <span className="legend-color" style={{ color: "#4a90e2" }}>
                🌍
              </span>
              <span className="legend-text">Tierra (rotando)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ color: "#ff6b47" }}>
                ☄️
              </span>
              <span className="legend-text">Meteorito (animado)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ color: "#ff4444" }}>
                ●
              </span>
              <span className="legend-text">Trayectoria del meteorito</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ color: "#ffffff" }}>
                ✨
              </span>
              <span className="legend-text">Campo de estrellas</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ color: "#666" }}>
                ●
              </span>
              <span className="legend-text">Ejes de referencia</span>
            </div>
          </div>
          <div className="legend-instructions">
            <p>
              <strong>Visualización:</strong> Three.js con texturas reales de la
              Tierra
            </p>
            <p>
              <strong>Animación:</strong> Tierra rotando, meteorito en
              movimiento
            </p>
            <p>
              <strong>Controles:</strong> Arrastra para rotar, rueda para zoom
            </p>
          </div>
        </div>
      </div>

      {/* Visualización de trayectoria */}
      {simulationResults && (
        <TrajectoryVisualization 
          trajectoryData={simulationResults}
          trajectoryParams={trajectoryParams}
        />
      )}

      {/* Tarjetas de impacto en la pantalla principal */}
      {showImpactCards && (
        <ImpactCards
          trajectoryData={simulationResults}
          onClose={handleCloseImpactCards}
          onScenarioSelect={handleScenarioSelect}
        />
      )}
    </div>
  );
}

export default AsteroidSimulator;
