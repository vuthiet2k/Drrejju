import * as THREE from "three";

// ══════════════════════════════════════════════════════════════════════
//  WATER SHADER MATERIAL
//  Vertex sóng 3 lớp (sin/cos) + fragment fresnel-foam trong suốt. Mesh
//  có tên bắt đầu "Water" trong GLTF sẽ được SymmetryModelLoader tự gán.
//  Cần gọi từ ngoài mỗi frame: material.uniforms.time.value = t (giây).
// ══════════════════════════════════════════════════════════════════════
export function createWaterMaterial(overrides = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0 },
      colorDeep: { value: new THREE.Color(overrides.colorDeep || "#000") },
      colorShallow: {
        value: new THREE.Color(overrides.colorShallow || "#49b6d6"),
      },
      colorFoam: { value: new THREE.Color(overrides.colorFoam || "#dff6ff") },
      colorBack: { value: new THREE.Color(overrides.colorBack || "#0a3f52") },
      opacity: { value: overrides.opacity ?? 0.9 },
      waveAmp: { value: overrides.waveAmp ?? 0.1 },
      waveFreq: { value: overrides.waveFreq ?? 0.01 },
      waveSpeed: { value: overrides.waveSpeed ?? 1 },
    },
    vertexShader: `
      uniform float time;
      uniform float waveAmp;
      uniform float waveFreq;
      uniform float waveSpeed;

      varying vec3 vWorldPos;
      varying vec3 vNormal;

      void main() {
        vec3 pos = position;
        float t = time * waveSpeed;
        float wave1 = sin((pos.x + t) * waveFreq) * 0.5;
        float wave2 = cos((pos.z - t) * waveFreq * 1.3) * 0.5;
        float wave3 = sin((pos.x + pos.z + t) * waveFreq * 0.7) * 0.5;
        float height = (wave1 + wave2 + wave3) * waveAmp;
        pos.y += height;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 colorDeep;
      uniform vec3 colorShallow;
      uniform vec3 colorFoam;
      uniform vec3 colorBack;
      uniform float opacity;

      varying vec3 vWorldPos;
      varying vec3 vNormal;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 3.0);
        float foam = smoothstep(0.65, 0.95, fresnel);
        vec3 baseColor = mix(colorDeep, colorShallow, fresnel + 0.2);
        vec3 color = mix(baseColor, colorFoam, foam);
        if (!gl_FrontFacing) {
          color = mix(colorBack, baseColor, 0.3);
        }
        gl_FragColor = vec4(color, opacity);
      }
    `,
  });
}
