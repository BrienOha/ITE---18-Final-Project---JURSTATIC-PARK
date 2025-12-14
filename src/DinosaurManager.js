import * as THREE from 'three';
import gsap from 'gsap';
import { loadGLTFModel } from './GLTFUtils.js';

export class DinosaurManager {
    constructor(scene, camera, uiManager) {
        this.scene = scene;
        this.camera = camera;
        this.uiManager = uiManager;
        this.raycaster = new THREE.Raycaster();
        this.dinoMeshes = [];
        this.data = this.getDinoData();
        if (this.scene) {
            this.initDinosaurs();
            this.initHumanRef();
        }
    }

    /**
     * Preload all dinosaur models and textures, reporting progress.
     * Rewritten to be generic based on getDinoData() config.
     */
    static async preloadAllAssets(onProgress) {
        const dinoData = (new DinosaurManager(null, null, null)).getDinoData();
        const total = dinoData.length;
        let loaded = 0;
        const results = [];
        
        for (let i = 0; i < dinoData.length; i++) {
            const dino = dinoData[i];
            let gltf = null;
            let textures = {};
            let text = `Loading ${dino.name}...`;
            
            try {
                // 1. Load Model
                gltf = await new Promise((resolve, reject) => {
                    loadGLTFModel(dino.model, resolve, reject);
                });

                // 2. Load Textures Dynamically (if textureConfig exists in data)
                if (dino.textureConfig) {
                    const texturePromises = [];
                    // Iterate over keys (e.g., 'map', 'normalMap') and values (filenames)
                    for (const [materialKey, filename] of Object.entries(dino.textureConfig)) {
                        const p = DinosaurManager.loadDinosaurTexture(dino.name, filename)
                            .then(tex => {
                                textures[materialKey] = tex;
                            });
                        texturePromises.push(p);
                    }
                    await Promise.all(texturePromises);
                }
            } catch (e) {
                text = `Failed to load ${dino.name}`;
            }
            
            loaded++;
            if (onProgress) onProgress(Math.round((loaded / total) * 100), text);
            results.push({ gltf, textures, dino });
        }
        return results;
    }

    getDinoData() {
        return [
            { name: "T-Rex", height: 5, length: 12, color: 0x5c4033, desc: "The King of Dinosaurs. Extremely powerful bite force.", pos: {x: 0, y: 0, z: -30}, model: "/models/T-Rex/trex.gltf", scale: 6, textureConfig: { map: "Body_diffuse.jpeg", normalMap: "Body_normal.png", aoMap: "Body_occlusion.png", specularGlossinessMap: "Body_specularGlossiness.png", materialMap: "material_diffuse.jpeg",  materialNormalMap: "material_normal.png"
} },
            { name: "Velociraptor", height: 1.8, length: 3, color: 0x6e7f80, desc: "Highly intelligent pack hunters. Watch the tall grass.", pos: {x: 0, y: 1.5, z: -15}, scale: 0.05, model: "/models/Velociraptor/velociraptor.gltf", textureConfig: {map: "Material_36_baseColor.jpeg"}},
            { name: "Triceratops", height: 3, length: 9, color: 0x5c5c5c, desc: "Herbivore with three horns and a large frill.", pos: {x:-25, y : 5, z : -20}, scale : 2, model : "/models/Triceratops/triceratops.gltf" },
            { name:"Spinosaurus", height :7 , length :15 , color :0x2f4f4f , desc :"Largest carnivorous dinosaur , semi-aquatic with a sail . ", pos :{ x :30 , y :0 , z :-40 }, scale :0.05,model:"/models/Spinosaurus/spinosaurus.gltf" },
            { name:"Carnotaurus" , height :3.5 , length :8 , color :0x8b4513 , desc :"Fast predator with bull-like horns above eyes . ", pos:{ x :-30 , y :0 , z :-10 }, scale :0.05, model:"/models/Carnotaurus/carnotaurus.gltf" },
            { name: "Brachiosaurus", height: 15, length: 26, color: 0x8fbc8f, desc: "Gentle giant. One of the tallest dinosaurs.", pos: {x: 0, z: -60}, scale: 2.5, model: "/models/Brachiosaurus/brachiosaurus.gltf" },
            { name: "Pterodactyl", height: 1, length: 2, color: 0xd2b48c, desc: "Flying reptile. Not technically a dinosaur, but a pterosaur.", pos: {x: 15, z: -5, y: 10}, model: "/models/Pterodactyl/pterodactyl.gltf" },
            { name: "Mosasaurus", height: 4, length: 18, color: 0x00ced1, desc: "Apex predator of the deep seas.", pos: {x: -40, z: 20}, scale: 0.05,model: "/models/Mosasaurus/mosasaurus.gltf" },
            { name: "Giganotosaurus", height: 6.5, length: 13, color: 0x556b2f, desc: "Larger than T-Rex, but lighter build.", pos: {x: 25, z: 20}, scale: 0.05,model: "/models/Giganotosaurus/giganotosaurus.gltf" },
            { name: "Allosaurus", height: 4, length: 10, color: 0xa0522d, desc: "The lion of the Jurassic period.", pos: {x: -15, z: 15}, scale: 0.05, model: "/models/Allosaurus/allosaurus.gltf" }
        ];
    }

    initDinosaurs() {
        if (!this.scene) return;
        this.data.forEach((dino, index) => {
            const group = new THREE.Group();
            const addGroupToScene = () => {
                group.position.set(dino.pos.x, dino.pos.y || 0, dino.pos.z);
                group.userData = { info: dino };
                if (this.scene) this.scene.add(group);
                this.dinoMeshes[index] = group;
                console.log(`Added group for ${dino.name} to scene at index ${index}`);
            };

            if (dino.model) {
                loadGLTFModel(dino.model, async (gltfScene) => {
                    console.log(`Loaded model for ${dino.name}`);
                    gltfScene.position.y = 0;

                    // 1. Generic Scaling (Based on data, defaults to 1)
                    if (dino.scale) {
                        gltfScene.scale.set(dino.scale, dino.scale, dino.scale);
                    }

                    // 2. Generic Texture Loading (No more IF statements)
                    if (dino.textureConfig) {
                        try {
                            const textureLoadPromises = [];
                            const loadedTextures = {};

                            // Load all textures defined in config
                            for (const [materialKey, filename] of Object.entries(dino.textureConfig)) {
                                const p = DinosaurManager.loadDinosaurTexture(dino.name, filename)
                                    .then(tex => {
                                        loadedTextures[materialKey] = tex;
                                    });
                                textureLoadPromises.push(p);
                            }

                            await Promise.all(textureLoadPromises);

                            // Apply to mesh
                            gltfScene.traverse((child) => {
                                if (child.isMesh && child.material) {
                                    for (const [key, texture] of Object.entries(loadedTextures)) {
                                        child.material[key] = texture;
                                    }
                                    child.material.needsUpdate = true;
                                }
                            });
                        } catch (err) {
                            console.warn(`Failed to load textures for ${dino.name}:`, err);
                        }
                    }

                    group.add(gltfScene);
                    addGroupToScene();
                }, (error) => {
                    console.warn(`Failed to load model for ${dino.name}, using placeholder.`, error);
                    this.addPlaceholderDino(group, dino);
                    addGroupToScene();
                });
            } else {
                this.addPlaceholderDino(group, dino);
                addGroupToScene();
            }
        });
    }

    addPlaceholderDino(group, dino) {
        const width = dino.length / 3;
        const geometry = new THREE.BoxGeometry(width, dino.height, dino.length);
        const material = new THREE.MeshStandardMaterial({ color: dino.color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = dino.height / 2;
        group.add(mesh);
    }

    initHumanRef() {
        const geo = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff00cc });
        const human = new THREE.Mesh(geo, mat);
        human.position.set(2, 0.9, 2);
        this.scene.add(human);
    }

    checkIntersection() {
        // Filter out any undefined/null meshes to avoid errors
        const validMeshes = this.dinoMeshes.filter(Boolean);
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const intersects = this.raycaster.intersectObjects(validMeshes, true);

        if (intersects.length > 0) {
            let object = intersects[0].object;
            while(object.parent && !object.userData.info) {
                object = object.parent;
            }

            if(object.userData.info) {
                this.uiManager.showInfo(object.userData.info);
            }
        } else {
            this.uiManager.hideInfo();
        }
    }

    travelTo(index) {
        const targetDino = this.dinoMeshes[index];
        const targetPos = targetDino.position.clone();
        const offset = new THREE.Vector3(0, 2, 10); 
        const endPos = targetPos.clone().add(offset);

        gsap.to(this.camera.position, {
            duration: 2,
            x: endPos.x,
            y: endPos.y,
            z: endPos.z,
            onUpdate: () => {
                this.camera.lookAt(targetPos);
            }
        });
    }

    // Assumed static helper (as referenced in your original code)
    static loadDinosaurTexture(dinoName, fileName) {
        const loader = new THREE.TextureLoader();
        return new Promise((resolve, reject) => {
            loader.load(
                `/models/${dinoName}/${fileName}`, // Adjust path pattern as needed
                (tex) => {
                    tex.flipY = false; // standard for GLTF models
                    tex.colorSpace = THREE.SRGBColorSpace; // Standard for color maps
                    resolve(tex);
                },
                undefined,
                (err) => reject(err)
            );
        });
    }
}