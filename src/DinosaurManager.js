import * as THREE from 'three';
import gsap from 'gsap';
import { loadGLTFModel } from './GLTFUtils.js';
import { normalWorld } from 'three/tsl';

export class DinosaurManager {
    constructor(scene, camera, uiManager, existingMeshes = []) {
        this.scene = scene;
        this.camera = camera;
        this.uiManager = uiManager;
        this.raycaster = new THREE.Raycaster();
        
        this.dinoMeshes = existingMeshes; 
        this.hitboxes = []; 
        this.data = this.getDinoData();

        if (this.scene) {
            this.initHumanRef();
            this.createHitboxes();
        }
    }

    getDinoData() {
        return [
            // rot: Y-axis rotation in Radians (Math.PI = 180 deg)
            { name: "T-Rex", height: 5, length: 12, desc: "The King of Dinosaurs.", pos: {x: 0, y: 0, z: -30}, rot: Math.PI / 6, scale: 0.02, model: "/models/T-Rex/trex.gltf"},
            { name: "Velociraptor", height: 1.8, length: 3, desc: "Highly intelligent pack hunters.", pos: {x: 8, y: 1.5, z: -15}, rot: -Math.PI / 4, scale: 0.05, model: "/models/Velociraptor/velociraptor.gltf", textureConfig: {map: "Material_36_baseColor.jpeg"}},
            { name: "Triceratops", height: 3, length: 9, desc: "Herbivore with three horns.", pos: {x:-25, y : 1, z : -20}, rot: Math.PI / 2, scale : 2, model : "/models/Triceratops/triceratops.gltf" },
            { name: "Spinosaurus", height :7 , length :15, desc :"Largest carnivorous dinosaur.", pos :{ x :30 , y :0 , z :-40 }, rot: -Math.PI / 6, scale :0.12, model:"/models/Spinosaurus/spinosaurus.gltf" },
            { name: "Carnotaurus", height :3.5 , length :8, desc :"Fast predator with bull-like horns.", pos:{ x :-30 , y :2 , z :-10 }, rot: Math.PI, scale :0.8, model:"/models/Carnotaurus/carnotaurus.gltf" },
            { name: "Brachiosaurus", height: 15, length: 26, desc: "Gentle giant.", pos: {x: 0, z: -60}, rot: 0, scale: 2.5, model: "/models/Brachiosaurus/brachiosaurus.gltf" },
            { name: "Pterodactyl", height: 1, length: 2, desc: "Flying reptile.", pos: {x: 15, z: -5, y: 15}, rot: Math.PI / 3, scale: 0.0005, model: "/models/Pterodactyl/pterodactyl.gltf" },
            { name: "Mosasaurus", height: 4, length: 18, desc: "Apex predator of the deep seas.", pos: {x: -40, z: 20}, rot: -Math.PI / 2, scale: 1.5, model: "/models/Mosasaurus/mosasaurus.gltf" },
            { name: "Giganotosaurus", height: 6.5, length: 13, desc: "Larger than T-Rex.", pos: {x: 25, y:0, z: 0}, rot: Math.PI / 1.5, scale: 1.5,model: "/models/Giganotosaurus/giganotosaurus.gltf" },
            { name: "Allosaurus", height: 4, length: 10, desc: "The lion of the Jurassic period.", pos: {x: -15, y: 1,z: 15}, rot: Math.PI / 4, scale: 1.2, model: "/models/Allosaurus/allosaurus.gltf" }
        
        ];
    }

    createHitboxes() {
        const boxMat = new THREE.MeshBasicMaterial({ visible: false, wireframe: true });
        this.data.forEach((dino, index) => {
            const geometry = new THREE.BoxGeometry(dino.length / 2, dino.height, dino.length);
            const hitbox = new THREE.Mesh(geometry, boxMat);
            // Apply rotation to hitbox too so it matches the dino
            hitbox.rotation.y = dino.rot || 0; 
            hitbox.position.set(dino.pos.x, (dino.pos.y || 0) + dino.height/2, dino.pos.z);
            hitbox.userData = { info: dino, originalIndex: index };
            this.scene.add(hitbox);
            this.hitboxes.push(hitbox);
        });
    }

    checkIntersection() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const intersects = this.raycaster.intersectObjects(this.hitboxes);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if(object.userData.info) {
                this.uiManager.showInfo(object.userData.info);
            }
        } else {
            this.uiManager.hideInfo();
        }
    }

    travelTo(index) {
        const targetDino = this.dinoMeshes[index];
        if(!targetDino) return;

        // Calculate offset based on dino rotation to face its "front" or side
        const rot = this.data[index].rot || 0;
        const offsetDist = 18;
        // Position camera in front/side of dino
        const offsetX = Math.sin(rot) * offsetDist;
        const offsetZ = Math.cos(rot) * offsetDist;

        const targetPos = targetDino.position.clone();
        const endPos = new THREE.Vector3(targetPos.x + offsetX, targetPos.y + 5, targetPos.z + offsetZ);

        gsap.to(this.camera.position, {
            duration: 2,
            x: endPos.x, y: endPos.y, z: endPos.z,
            onUpdate: () => this.camera.lookAt(targetPos)
        });
    }

    static async preloadAllAssets(onProgress) {
        const dummy = new DinosaurManager(null, null, null);
        const dinoData = dummy.getDinoData();
        const total = dinoData.length;
        let loaded = 0;
        const results = [];
        
        for (let i = 0; i < dinoData.length; i++) {
            const dino = dinoData[i];
            let gltf = null;
            let text = `Loading ${dino.name}...`;
            
            try {
                gltf = await new Promise((resolve, reject) => loadGLTFModel(dino.model, resolve, reject));
                
                // Apply rotation immediately so the visual mesh is correct
                if (dino.rot) gltf.rotation.y = dino.rot;

                if (dino.textureConfig) {
                    const loadedTextures = {};
                    for (const [key, filename] of Object.entries(dino.textureConfig)) {
                        const tex = await DinosaurManager.loadDinosaurTexture(dino.name, filename);
                        loadedTextures[key] = tex;
                    }
                    gltf.traverse((c) => {
                        if (c.isMesh && c.material) {
                            for (const [k, t] of Object.entries(loadedTextures)) c.material[k] = t;
                            c.material.needsUpdate = true;
                        }
                    });
                }
            } catch (e) { console.warn(`Failed ${dino.name}`, e); }
            
            loaded++;
            if (onProgress) onProgress(Math.round((loaded / total) * 100), text);
            results.push({ gltf, dino });
        }
        return results;
    }

    static loadDinosaurTexture(dinoName, fileName) {
        const loader = new THREE.TextureLoader();
        return new Promise((resolve, reject) => {
            loader.load(`/models/${dinoName}/${fileName}`, (tex) => {
                tex.flipY = false; 
                tex.colorSpace = THREE.SRGBColorSpace;
                resolve(tex);
            }, undefined, reject);
        });
    }

    initHumanRef() {
        // REPLACED CAPSULE WITH HUMAN GLTF
        loadGLTFModel('/models/Human/human.gltf', (model) => {
            model.position.set(2, 0, 2); // On ground
            model.scale.set(2, 2, 2); // Ensure it's 1.8m tall roughly
            
            // Create a hitbox for the human so the UI shows info
            const geometry = new THREE.BoxGeometry(1, 2, 1);
            const mat = new THREE.MeshBasicMaterial({ visible: false });
            const hitbox = new THREE.Mesh(geometry, mat);
            hitbox.position.set(2, 1, 2);
            
            // Data for UI
            const humanData = {
                name: "HUMAN",
                height: 1.8,
                desc: "Standard reference scale. 6ft tall.",
                diet: "Omnivore"
            };
            hitbox.userData = { info: humanData };
            
            this.scene.add(model);
            this.scene.add(hitbox);
            this.hitboxes.push(hitbox); // Enable Raycasting
            
            // Shadows
            model.traverse(c => { if(c.isMesh) { c.castShadow = true; c.receiveShadow = true; }});
        }, (err) => console.warn("Human model missing", err));
    }
}