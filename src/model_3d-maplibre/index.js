// ══════════════════════════════════════════════════════════════════════
//  model_3d-maplibre — package public API
//  Chồng model GLTF (Three.js) lên bản đồ MapLibre. Điểm nhập duy nhất
//  cho các app 3D trong dự án — import từ "@/model_3d-maplibre".
//
//  Ví dụ:
//    import { createModel3dLayer } from "@/model_3d-maplibre";
//    import modelsConfig from "@/model_3d-maplibre/@data/models-config.json";
//    map.on("style.load", () => {
//      map.addLayer(createModel3dLayer({
//        origin: [105.6734, 20.8783],
//        altitude: 0,
//        modelsConfig,       // hoặc URL string tới file JSON
//      }));
//    });
// ══════════════════════════════════════════════════════════════════════

export { createWaterMaterial } from "./common/waterMaterial.js";
export { SymmetryModelLoader } from "./common/SymmetryModelLoader.js";
export { createModel3dLayer } from "./common/createModel3dLayer.js";
