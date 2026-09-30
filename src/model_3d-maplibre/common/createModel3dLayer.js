import * as THREE from "three";
import { MercatorCoordinate } from "maplibre-gl";
import { SymmetryModelLoader } from "./SymmetryModelLoader.js";

// ══════════════════════════════════════════════════════════════════════
//  MAPLIBRE 3D MODEL LAYER
//  Tạo custom layer (renderingMode:"3d") chồng model GLTF (một hoặc nhiều
//  model, có/không đối xứng) lên bản đồ MapLibre tại (origin, altitude).
//
//  Trả về object tuân theo CustomLayerInterface — dùng: map.addLayer(layer).
//  Hỗ trợ cả MapLibre v4 (render(gl, matrix)) và v5 (render(gl, args)).
//
//  Options:
//    id                  — layer id ("3d-model" mặc định)
//    origin              — [lng, lat] BẮT BUỘC
//    altitude            — cao độ meter (0 mặc định)
//    rotate              — [rx, ry, rz] radian; mặc định [π/2, 0, 0] để
//                          model Z-up của Blender/GLTF đứng đúng trên map
//    modelsConfig        — URL string HOẶC object { models:[...] }
//    lighting            — { hemi, dir1, dir2 } tuỳ chỉnh; xem defaults dưới
//    toneMappingExposure — số, mặc định 1.0
// ══════════════════════════════════════════════════════════════════════
const DEFAULT_LIGHTING = {
  hemi: { sky: 0xffffff, ground: 0xd9d2c7, intensity: 1.0 },
  dir1: { color: 0xffffff, intensity: 1.1, pos: [10, 12, 6] },
  dir2: { color: 0xffffff, intensity: 0.6, pos: [-8, 6, -4] },
};

// Lấy raw projection matrix, hỗ trợ nhiều bản MapLibre.
function extractProjectionMatrix(matrixOrArgs) {
  if (!matrixOrArgs) return null;
  // v4: đối số 2 là mảng số / Float64Array
  if (Array.isArray(matrixOrArgs) || ArrayBuffer.isView(matrixOrArgs)) {
    return matrixOrArgs;
  }
  // v5: object có defaultProjectionData.mainMatrix
  return (
    matrixOrArgs?.defaultProjectionData?.mainMatrix ||
    matrixOrArgs?.mainMatrix ||
    matrixOrArgs?.matrix ||
    matrixOrArgs?.projectionMatrix ||
    null
  );
}

export function createModel3dLayer({
  id = "3d-model",
  origin,
  altitude = 0,
  rotate = [Math.PI / 2, 0, 0],
  modelsConfig,
  lighting,
  toneMappingExposure = 1.0,
} = {}) {
  if (!origin || origin.length !== 2) {
    throw new Error("createModel3dLayer: origin=[lng,lat] required");
  }

  const modelMerc = MercatorCoordinate.fromLngLat(origin, altitude);
  const modelTransform = {
    translateX: modelMerc.x,
    translateY: modelMerc.y,
    translateZ: modelMerc.z,
    rotateX: rotate[0],
    rotateY: rotate[1],
    rotateZ: rotate[2],
    scale: modelMerc.meterInMercatorCoordinateUnits(),
  };

  const light = {
    hemi: { ...DEFAULT_LIGHTING.hemi, ...(lighting?.hemi || {}) },
    dir1: { ...DEFAULT_LIGHTING.dir1, ...(lighting?.dir1 || {}) },
    dir2: { ...DEFAULT_LIGHTING.dir2, ...(lighting?.dir2 || {}) },
  };

  return {
    id,
    type: "custom",
    renderingMode: "3d",
    modelLoader: null,
    onAdd(map, gl) {
      this.camera = new THREE.Camera();
      this.scene = new THREE.Scene();

      const hemiLight = new THREE.HemisphereLight(
        light.hemi.sky,
        light.hemi.ground,
        light.hemi.intensity,
      );
      this.scene.add(hemiLight);

      const dir1 = new THREE.DirectionalLight(
        light.dir1.color,
        light.dir1.intensity,
      );
      dir1.position.set(...light.dir1.pos);
      this.scene.add(dir1);

      const dir2 = new THREE.DirectionalLight(
        light.dir2.color,
        light.dir2.intensity,
      );
      dir2.position.set(...light.dir2.pos);
      this.scene.add(dir2);

      this.modelLoader = new SymmetryModelLoader(this.scene);
      if (modelsConfig) {
        this.modelLoader.loadFromConfig(modelsConfig).catch((err) => {
          // Không phá map nếu 1 GLB thiếu / sai path — chỉ báo trên console
          console.warn("[model_3d-maplibre] load models failed:", err);
        });
      }

      this.map = map;
      this.clock = new THREE.Clock();

      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });
      this.renderer.autoClear = false;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = toneMappingExposure;
    },
    render(gl, matrixOrArgs) {
      const waterMat = this.modelLoader?.waterMaterial;
      if (waterMat?.uniforms?.time) {
        waterMat.uniforms.time.value = this.clock.getElapsedTime();
      }

      const rx = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(1, 0, 0),
        modelTransform.rotateX,
      );
      const ry = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 1, 0),
        modelTransform.rotateY,
      );
      const rz = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 0, 1),
        modelTransform.rotateZ,
      );

      const rawMatrix = extractProjectionMatrix(matrixOrArgs);
      if (!rawMatrix) return;

      const m = new THREE.Matrix4().fromArray(rawMatrix);
      const l = new THREE.Matrix4()
        .makeTranslation(
          modelTransform.translateX,
          modelTransform.translateY,
          modelTransform.translateZ,
        )
        .scale(
          new THREE.Vector3(
            modelTransform.scale,
            -modelTransform.scale,
            modelTransform.scale,
          ),
        )
        .multiply(rx)
        .multiply(ry)
        .multiply(rz);

      this.camera.projectionMatrix = m.multiply(l);
      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);
      this.map.triggerRepaint();
    },
    onRemove() {
      // Giải phóng GPU khi layer bị gỡ (rời trang 3D, hoặc đổi cảnh).
      //
      // THỨ TỰ QUAN TRỌNG: phải dispose geometry/material/texture TRƯỚC rồi
      // mới tới renderer. geometry.dispose() chỉ đánh dấu và phát sự kiện
      // "dispose"; renderer mới là bên đang giữ WebGLBuffer/WebGLTexture
      // thật và lắng nghe sự kiện đó để xoá. Dispose renderer trước sẽ dọn
      // sạch bảng properties của nó, nên các lệnh dispose sau đó không còn
      // ai xử lý — buffer và texture ở lại trong VRAM tới khi context chết.
      //
      // Texture là phần nặng nhất: mỗi GLB đình/đền mang theo vài map PBR,
      // và 12 file GLB cây cối được load lại ở từng vị trí (không cache
      // chung), nên bỏ sót texture là rò rỉ vài trăm MB VRAM mỗi lần vào ra
      // trang 3D.
      const disposeMaterial = (mat) => {
        if (!mat) return;
        for (const key of Object.keys(mat)) {
          const val = mat[key];
          if (val && val.isTexture) val.dispose();
        }
        // ShaderMaterial (water) giữ texture trong uniforms, không phải ở
        // thuộc tính trực tiếp như MeshStandardMaterial.
        for (const u of Object.values(mat.uniforms || {})) {
          if (u?.value?.isTexture) u.value.dispose();
        }
        mat.dispose();
      };

      this.scene?.traverse?.((obj) => {
        if (!obj.isMesh) return;
        obj.geometry?.dispose?.();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(disposeMaterial);
      });
      this.scene?.clear?.();

      // CHỈ dispose(), KHÔNG forceContextLoss(): renderer này dùng chung
      // canvas + WebGL context với MapLibre (xem onAdd). forceContextLoss()
      // sẽ giết luôn context của bản đồ — bản đồ trắng xoá dù chỉ gỡ layer
      // 3D mà vẫn ở lại trang. Context do MapLibre sở hữu và tự huỷ trong
      // map.remove().
      this.renderer?.dispose?.();

      this.modelLoader = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.clock = null;
      this.map = null;
    },
  };
}
