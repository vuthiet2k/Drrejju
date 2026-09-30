import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D panoramaTexture;
  uniform vec3 panoramaColor;
  uniform float projectionBlend;
  uniform float fisheyeStrength;
  uniform vec2 resolution;
  uniform float projectionRotation;
  varying vec2 vUv;

  const float PI = 3.141592653589793;

  vec2 tinyPlanetUv(vec2 fragmentUv) {
    float aspect = max(resolution.x / max(resolution.y, 1.0), 0.001);
    vec2 centered = fragmentUv - vec2(0.5);
    centered.x *= aspect;
    float radius = 1.1;
    float distanceFromCenter = length(centered) / radius;
    float polar = min(distanceFromCenter, 1.0) * PI;
    float azimuth = atan(centered.y, centered.x) + projectionRotation;
    vec3 direction = vec3(
      sin(polar) * cos(azimuth),
      -cos(polar),
      sin(polar) * sin(azimuth)
    );
    return vec2(
      atan(direction.z, direction.x) / (2.0 * PI) + 0.5,
      asin(clamp(direction.y, -1.0, 1.0)) / PI + 0.5
    );
  }

  void main() {
    vec2 planetUv = tinyPlanetUv(gl_FragCoord.xy / resolution);
    vec4 planetColor = texture2D(panoramaTexture, planetUv);
    vec4 panoramaSample = texture2D(panoramaTexture, vUv);
    // Blend rendered projections, never their UV coordinate systems. Directly
    // interpolating stereographic and equirectangular UVs folds the image and
    // exposes a seam during the Intro transition.
    float projectionMix = smoothstep(0.0, 1.0, projectionBlend);
    vec4 color = mix(planetColor, panoramaSample, projectionMix);
    color.rgb *= panoramaColor;
    color.a = 1.0;
    gl_FragColor = color;
    #include <colorspace_fragment>
  }
`;

export function createProjectionPanoramaMaterial() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      panoramaTexture: { value: null },
      panoramaColor: { value: new THREE.Color(0x111827) },
      projectionBlend: { value: 1 },
      fisheyeStrength: { value: 0 },
      resolution: { value: new THREE.Vector2(1, 1) },
      projectionRotation: { value: -Math.PI / 2 },
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
  });

  Object.defineProperty(material, 'map', {
    configurable: true,
    get() {
      return material.uniforms.panoramaTexture.value;
    },
    set(texture) {
      material.uniforms.panoramaTexture.value = texture || null;
    },
  });
  material.color = material.uniforms.panoramaColor.value;

  material.setProjectionState = ({ projectionBlend = 1, fisheyeStrength = 0, projectionRotation } = {}) => {
    material.uniforms.projectionBlend.value = projectionBlend;
    material.uniforms.fisheyeStrength.value = fisheyeStrength;
    if (Number.isFinite(Number(projectionRotation))) {
      material.uniforms.projectionRotation.value = Number(projectionRotation);
    }
  };

  material.setProjectionResolution = (width, height) => {
    material.uniforms.resolution.value.set(width || 1, height || 1);
  };

  return material;
}
