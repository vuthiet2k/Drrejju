import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createWaterMaterial } from "./waterMaterial.js";

const toRad = (deg) => (deg * Math.PI) / 180;

// ══════════════════════════════════════════════════════════════════════
//  SYMMETRY MODEL LOADER
//  Load GLTF, giữ nguyên PBR gốc (chỉ tắt reflectivity/transmission),
//  hỗ trợ đối xứng x2 (một trục x/y/z) hoặc x4 (xz — 4 clone). Mesh tên
//  bắt đầu "Water" tự gán water shader (share qua waterMaterial dùng chung).
//
//  Config từng model:
//    { id, path, position:{x,y,z}, rotation:{x,y,z} (deg),
//      scale:{x,y,z}, symmetry:"x2"|"x4", mirrorAxis, mirrorCenter,
//      mirrorOffset, cloneRotations:[deg,deg,deg], disabled }
// ══════════════════════════════════════════════════════════════════════
export class SymmetryModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.loadedModels = new Map();
    this.waterMaterial = createWaterMaterial();
  }

  applyMaterial(child) {
    if (!child.isMesh) return;
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const mat of materials) {
      if (!mat) continue;
      if (mat.reflectivity !== undefined) mat.reflectivity = 0;
      if (mat.refractionRatio !== undefined) mat.refractionRatio = 0;
      if (mat.transmission !== undefined) mat.transmission = 0;
      mat.side = THREE.DoubleSide;
      mat.needsUpdate = true;
    }

    if (typeof child.name === "string" && child.name.startsWith("Water")) {
      child.material = this.waterMaterial;
    }
  }

  deepClone(object) {
    const clone = object.clone(true);
    clone.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.geometry = obj.geometry.clone();
      if (Array.isArray(obj.material)) {
        obj.material = obj.material.map((m) => m.clone());
      } else if (obj.material) {
        obj.material = obj.material.clone();
      }
    });
    return clone;
  }

  createMirror(original, scaleX, scaleY, scaleZ, rotationY = 0) {
    const clone = this.deepClone(original);
    clone.scale.x *= scaleX;
    clone.scale.y *= scaleY;
    clone.scale.z *= scaleZ;
    if (rotationY !== 0) clone.rotation.y += rotationY;
    return clone;
  }

  loadModel(config) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        config.path,
        (gltf) => {
          const model = gltf.scene;

          model.position.set(
            config.position?.x || 0,
            config.position?.y || 0,
            config.position?.z || 0,
          );
          model.rotation.set(
            toRad(config.rotation?.x || 0),
            toRad(config.rotation?.y || 0),
            toRad(config.rotation?.z || 0),
          );
          model.scale.set(
            config.scale?.x || 1,
            config.scale?.y || 1,
            config.scale?.z || 1,
          );

          model.traverse((child) => this.applyMaterial(child));

          const group = new THREE.Group();
          group.name = config.id;
          group.add(model);

          const center = config.mirrorCenter || { x: 0, y: 0, z: 0 };
          const offset = config.mirrorOffset || { x: 0, y: 0, z: 0 };

          if (config.symmetry === "x2") {
            const axis = config.mirrorAxis || "x";
            let clone;
            if (axis === "x") {
              clone = this.createMirror(model, -1, 1, 1);
              clone.position.x = 2 * center.x - model.position.x;
            } else if (axis === "y") {
              clone = this.createMirror(model, 1, -1, 1);
              clone.position.y = 2 * center.y - model.position.y;
            } else if (axis === "z") {
              clone = this.createMirror(model, 1, 1, -1);
              clone.position.z = 2 * center.z - model.position.z;
            }
            if (clone) {
              clone.traverse((c) => this.applyMaterial(c));
              group.add(clone);
            }
          } else if (config.symmetry === "x4") {
            const rotations = config.cloneRotations || [0, 0, 0];

            const clone1 = model.clone();
            clone1.scale.x *= -1;
            clone1.position.x += offset.x;
            clone1.rotation.y += toRad(rotations[0]);

            const clone2 = model.clone();
            clone2.scale.z *= -1;
            clone2.position.z += offset.z;
            clone2.rotation.y += toRad(rotations[1]);

            const clone3 = model.clone();
            clone3.scale.x *= -1;
            clone3.scale.z *= -1;
            clone3.position.x += offset.x;
            clone3.position.z += offset.z;
            clone3.rotation.y += toRad(rotations[2]);

            [clone1, clone2, clone3].forEach((c) => {
              c.traverse((child) => this.applyMaterial(child));
              group.add(c);
            });
          }

          this.scene.add(group);
          this.loadedModels.set(config.id, group);
          resolve(group);
        },
        undefined,
        (error) => reject(error),
      );
    });
  }

  // Nhận URL (fetch JSON) hoặc object { models:[...] } trực tiếp.
  async loadFromConfig(configOrUrl) {
    const cfg =
      typeof configOrUrl === "string"
        ? await (await fetch(configOrUrl)).json()
        : configOrUrl;

    const items = (cfg?.models || []).filter((m) => !m.disabled);
    await Promise.all(items.map((m) => this.loadModel(m)));
    return this.loadedModels;
  }
}
