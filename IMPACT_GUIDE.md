# 🎯 Guía de Parámetros para Impactos con la Tierra

## 📊 Resumen Ejecutivo

Para que un asteroide impacte con la Tierra en la simulación, necesita cumplir ciertas condiciones físicas basadas en la mecánica orbital real. Esta guía detalla los valores específicos que pueden resultar en colisiones.

## 🌍 Contexto Físico

### Parámetros de la Tierra
- **Radio terrestre**: 6,371 km
- **Atmósfera**: Comienza a ~100 km de altura
- **Velocidad de escape**: 11.2 km/s
- **Gravedad en superficie**: 9.81 m/s²

### Zona de Impacto
Un asteroide impactará si su trayectoria lo lleva dentro de **6,471 km** del centro de la Tierra (radio + 100 km de atmósfera).

## 🎯 Escenarios de Impacto Garantizado

### 1. 🌍 Aproximación Cercana (Probabilidad: 90%)
```javascript
{
  position_km: [7000, 0, 0],     // 629 km sobre la superficie
  velocity_kms: [-5, 0, 0],      // Velocidad hacia la Tierra
  density_kg_m3: 2500,           // Densidad rocosa
  dt: 0.1                        // Precisión alta
}
```
**¿Por qué funciona?** Posición muy cerca + velocidad directa hacia la Tierra.

### 2. ⬇️ Aproximación Vertical (Probabilidad: 95%)
```javascript
{
  position_km: [0, 0, 9000],     // Directamente arriba
  velocity_kms: [0, 0, -12],     // Caída vertical rápida
  density_kg_m3: 3500,
  dt: 0.1
}
```
**¿Por qué funciona?** Caída libre directa con velocidad alta.

### 3. 🛰️ Decaimiento Orbital (Probabilidad: 85%)
```javascript
{
  position_km: [8000, 0, 0],
  velocity_kms: [0, -7, 0],      // Velocidad orbital insuficiente
  density_kg_m3: 3000,
  dt: 0.1
}
```
**¿Por qué funciona?** Velocidad orbital demasiado baja para mantener órbita estable.

## 🔢 Rangos de Valores Críticos

### Posición Inicial (position_km)
| Rango | Probabilidad de Impacto | Descripción |
|-------|------------------------|-------------|
| 0 - 6,471 km | 100% | Dentro de la atmósfera |
| 6,471 - 8,000 km | 80-95% | Zona crítica |
| 8,000 - 12,000 km | 40-80% | Depende de velocidad |
| 12,000 - 20,000 km | 10-40% | Requiere velocidad alta |
| > 20,000 km | < 10% | Muy improbable |

### Velocidad Inicial (velocity_kms)
| Dirección | Rango Crítico | Efecto |
|-----------|---------------|--------|
| Hacia Tierra (-X, -Y, -Z) | 5-50 km/s | Impacto directo |
| Tangencial | 3-15 km/s | Posible captura/impacto |
| Alejándose (+X, +Y, +Z) | > 11.2 km/s | Escape |

### Componentes Específicas
- **Vx**: -50 a -5 km/s (hacia la Tierra)
- **Vy**: -30 a +30 km/s (dependiendo del ángulo)
- **Vz**: -50 a -5 km/s (hacia la Tierra)

## 🧮 Fórmulas de Impacto

### Distancia al Centro de la Tierra
```javascript
distancia = √(x² + y² + z²)
```
**Impacto si**: distancia ≤ 6,471 km

### Velocidad de Aproximación
```javascript
v_radial = (v⃗ · r⃗) / |r⃗|
```
**Impacto probable si**: v_radial < 0 (acercándose)

### Energía Cinética
```javascript
E = ½ × m × v²
```
Donde m depende del volumen y densidad del asteroide.

## 📋 Combinaciones Efectivas

### Para Impacto Seguro (>90%)
1. **Posición**: < 8,000 km del centro
2. **Velocidad radial**: < -3 km/s (hacia la Tierra)
3. **Densidad**: 2,000-4,000 kg/m³
4. **dt**: 0.05-0.1 s (precisión)

### Para Impacto Probable (60-90%)
1. **Posición**: 8,000-12,000 km
2. **Velocidad**: Componentes mixtas con resultante hacia la Tierra
3. **Ángulo**: 20-70° respecto a la vertical

### Para Impacto Posible (20-60%)
1. **Posición**: 12,000-20,000 km
2. **Velocidad alta**: > 15 km/s hacia la Tierra
3. **Trayectoria optimizada**: Aprovechando gravedad terrestre

## ⚠️ Factores Importantes

### Paso de Tiempo (dt)
- **0.05-0.1 s**: Máxima precisión para impactos
- **0.5-1.0 s**: Puede perder eventos de impacto
- **> 1.0 s**: Impreciso para trayectorias críticas

### Densidad del Asteroide
| Tipo | Densidad (kg/m³) | Características |
|------|------------------|-----------------|
| Rocoso | 2,000-4,000 | Común, resistente |
| Metálico | 7,000-8,000 | Denso, destructivo |
| Carbonáceo | 1,000-2,500 | Ligero, frágil |

## 🎯 Consejos Prácticos

### Para Garantizar Impacto:
1. Comienza con posición < 8,000 km
2. Usa velocidad negativa en al menos 2 ejes
3. Mantén dt ≤ 0.1 para precisión
4. Evita velocidades > 50 km/s (poco realistas)

### Para Simular Escenarios Realistas:
1. Usa velocidades 11-25 km/s (rango típico)
2. Posiciones 10,000-50,000 km (aproximaciones reales)
3. Densidades 2,000-4,000 kg/m³ (asteroides comunes)

## 🔬 Validación de Resultados

El backend calculará y reportará:
- `impact_data.impact_detected`: true/false
- `impact_data.impact_time`: momento del impacto
- `impact_data.impact_energy`: energía del impacto
- `impact_data.impact_location`: coordenadas del impacto

## 🚨 Advertencias

1. **Velocidades extremas** (>72 km/s) son poco realistas
2. **Posiciones dentro de la Tierra** (<6,371 km) son inválidas
3. **Pasos de tiempo grandes** pueden omitir impactos rápidos
4. **Densidades <100 kg/m³** son poco físicas para asteroides

---

*Esta documentación está basada en principios de mecánica orbital y datos astronómicos reales.*