import * as THREE from 'three';
import gsap from 'gsap';
import { loadGLTFModel } from './GLTFUtils.js';

export class DinosaurManager {
    constructor(scene, camera, uiManager, existingMeshes = [], fetchedData = []) {
        this.scene = scene;
        this.camera = camera;
        this.uiManager = uiManager;
        this.raycaster = new THREE.Raycaster();
        
        this.dinoMeshes = existingMeshes; 
        this.hitboxes = []; 
        
        // CRITICAL: Use the data fetched from backend, not static
        this.data = fetchedData;

        if (this.scene) {
            this.initHumanRef();
            this.createHitboxes();
        }
    }

    // --- NEW: FETCH FROM BACKEND ---
    static async fetchDinoData() {
        try {
            // Assumes backend is running on port 5000
            const response = await fetch('http://localhost:5000/api/dinosaurs');
            const json = await response.json();
            
            if(json.success) {
                return json.data;
            } else {
                console.error("API Error:", json.error);
                return [];
            }
        } catch (error) {
            console.warn("Backend Offline. Using Emergency Backup Data.");
            // Optional: You could return a small backup array here if the server is down
            return [];
        }
    }

    // UPDATED PRELOADER
    static async preloadAllAssets(onProgress) {
        onProgress(0, 'Connecting to InGen Database...');
        
        // 1. Get Data from Server
        const dinoData = await DinosaurManager.fetchDinoData();
        
        if(dinoData.length === 0) {
            onProgress(100, 'Database Connection Failed');
            return { assets: [], data: [] };
        }

        const total = dinoData.length;
        let loaded = 0;
        const results = [];
        
        // 2. Load Models based on Server Data
        for (let i = 0; i < dinoData.length; i++) {
            const dino = dinoData[i];
            let gltf = null;
            let text = `Importing ${dino.name}...`;
            
            try {
                // Note: backend uses 'model' or 'modelPath', ensure consistency
                gltf = await new Promise((resolve, reject) => loadGLTFModel(dino.model, resolve, reject));
                
                // Use backend data for transforms
                if (dino.rot) gltf.rotation.y = dino.rot;

                if (dino.textureConfig) {
                    const loadedTextures = {};
                    // Handle Map conversion if it comes back as a plain object
                    const config = dino.textureConfig instanceof Map ? Object.fromEntries(dino.textureConfig) : dino.textureConfig;
                    
                    for (const [key, filename] of Object.entries(config)) {
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
            } catch (e) { 
                console.warn(`Failed to load ${dino.name}`, e); 
            }
            
            loaded++;
            if (onProgress) onProgress(Math.round((loaded / total) * 100), text);
            results.push({ gltf, dino });
        }
        
        // Return BOTH the 3D assets AND the raw data
        return { assets: results, data: dinoData };
    }

    // ... (Keep loadDinosaurTexture, createHitboxes, checkIntersection, travelTo, initHumanRef EXACTLY the same) ...
    // Just ensure checkIntersection uses 'this.data' which we set in constructor
    
    // Helper to load texture (Keep this)
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

    // Copy your existing methods here (createHitboxes, etc.)
    createHitboxes() {
        const boxMat = new THREE.MeshBasicMaterial({ visible: false, wireframe: true });
        this.data.forEach((dino, index) => {
            const geometry = new THREE.BoxGeometry(dino.length / 2, dino.height, dino.length);
            const hitbox = new THREE.Mesh(geometry, boxMat);
            hitbox.rotation.y = dino.rot || 0; 
            // Handle both structure types just in case (pos.x or just pos)
            const x = dino.pos ? dino.pos.x : 0;
            const y = dino.pos ? dino.pos.y : 0;
            const z = dino.pos ? dino.pos.z : 0;
            
            hitbox.position.set(x, y + dino.height/2, z);
            hitbox.userData = { info: dino, originalIndex: index };
            this.scene.add(hitbox);
            this.hitboxes.push(hitbox);
        });
    }
    
    // ... Keep checkIntersection, travelTo, initHumanRef ...
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

        const rot = this.data[index].rot || 0;
        const offsetDist = 18;
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

    initHumanRef() {
        // ... (Keep your existing human ref code) ...
        loadGLTFModel('/models/Human/human.gltf', (model) => {
            model.position.set(2, 0, 2); 
            model.scale.set(2, 2, 2); 
            
            const geometry = new THREE.BoxGeometry(1, 2, 1);
            const mat = new THREE.MeshBasicMaterial({ visible: false });
            const hitbox = new THREE.Mesh(geometry, mat);
            hitbox.position.set(2, 1, 2);
            
            const humanData = {
                name: "HUMAN",
                sciName: "Homo sapiens",
                height: 1.8,
                desc: "Standard reference scale. 6ft tall.",
                diet: "Omnivore"
            };
            hitbox.userData = { info: humanData };
            
            this.scene.add(model);
            this.scene.add(hitbox);
            this.hitboxes.push(hitbox); 
            
            model.traverse(c => { if(c.isMesh) { c.castShadow = true; c.receiveShadow = true; }});
        }, (err) => console.warn("Human model missing"));
    }
}