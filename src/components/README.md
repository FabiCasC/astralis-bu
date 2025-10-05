# Componentes del Simulador de Asteroides

Esta carpeta contiene todos los componentes React organizados de manera modular para el proyecto ASTRALIS - Beyond Universe.

## Estructura de Componentes

### `App.jsx` y `App.css`
- **Propósito**: Componente principal que maneja la transición entre la intro cinematográfica y el simulador
- **Funcionalidad**: Controla el estado de la intro y la transición suave entre componentes

### `CinematicIntro.jsx` y `CinematicIntro.css`
- **Propósito**: Intro cinematográfica con animación de estrellas usando Three.js
- **Funcionalidad**: 
  - Renderiza un campo de estrellas animado
  - Muestra el logo ASTRALIS con efectos de texto
  - Transición por etapas (estrellas → logo → subtítulo → prompt)
  - Maneja el evento de click para continuar al simulador

### `AsteroidSimulator.jsx` y `AsteroidSimulator.css`
- **Propósito**: Componente principal del simulador de asteroides
- **Funcionalidad**:
  - Renderiza el canvas de Three.js con fondo de estrellas
  - Contiene todos los controles de parámetros físicos y orbitales
  - Maneja el estado de los sliders y la simulación
  - Incluye el logo ASTRALIS-BU y el título principal

### `ParameterSlider.jsx` y `ParameterSlider.css`
- **Propósito**: Componente reutilizable para los controles deslizantes
- **Funcionalidad**:
  - Slider personalizado con estilos espaciales
  - Tooltip informativo con detalles del parámetro
  - Muestra valor actual, mínimo y máximo
  - Completamente personalizable con props

## Beneficios de esta Organización

1. **Modularidad**: Cada componente tiene una responsabilidad específica
2. **Reutilización**: Los componentes pueden ser reutilizados fácilmente
3. **Mantenimiento**: Es más fácil encontrar y modificar código específico
4. **Escalabilidad**: Fácil agregar nuevos componentes o funcionalidades
5. **Separación de Estilos**: Cada componente tiene sus propios estilos CSS
6. **Legibilidad**: Código más limpio y fácil de entender

## Uso

```jsx
import App from './components/App';

// El componente App maneja automáticamente la transición
// desde la intro hasta el simulador
```

## Dependencias

- React 18.2.0
- Three.js 0.180.0
- @react-three/fiber (para futuras integraciones)
- @react-three/drei (para futuras integraciones)
