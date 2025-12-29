import * as THREE from 'three';
import gsap from 'gsap';
import { loadGLTFModel } from './GLTFUtils.js';

export class DinosaurManager {
    constructor(scene, camera, uiManager, existingMeshes = []) {
        this.scene = scene;
        this.camera = camera;
        this.uiManager = uiManager;
        this.raycaster = new THREE.Raycaster();
        
        this.dinoMeshes = existingMeshes; 
        this.hitboxes = []; 
        
        // Use static data for initialization
        this.data = DinosaurManager.getStaticDinoData();

        if (this.scene) {
            this.initHumanRef();
            this.createHitboxes();
        }
    }

    // UPDATED: Changed to Static so Main.js can access it early
    static getStaticDinoData() {
        return [
            { 
                name: "T-Rex", sciName: "Tyrannosaurus rex",
                height: 5, length: 12, diet: "Carnivore",
                desc: "The King of Dinosaurs. Extremely powerful bite force.", 
                pos: {x: 0, y: 0, z: -30}, rot: Math.PI / 6, scale: 0.02, 
                model: "/models/T-Rex/trex.gltf"
            },
            { 
                name: "Velociraptor", sciName: "Velociraptor mongoliensis",
                height: 1.8, length: 3, diet: "Carnivore",
                desc: "Highly intelligent pack hunters. Watch the tall grass.", 
                pos: {x: 8, y: 1.5, z: -15}, rot: -Math.PI / 4, scale: 0.05, 
                model: "/models/Velociraptor/velociraptor.gltf", 
                textureConfig: {map: "Material_36_baseColor.jpeg"}
            },
            { 
                name: "Triceratops", sciName: "Triceratops horridus",
                height: 3, length: 9, diet: "Herbivore",
                desc: "Herbivore with three horns and a large frill.", 
                pos: {x:-25, y : 1, z : -20}, rot: Math.PI / 2, scale : 2, 
                model : "/models/Triceratops/triceratops.gltf" 
            },
            { 
                name: "Spinosaurus", sciName: "Spinosaurus aegyptiacus",
                height :7 , length :15, diet: "Piscivore",
                desc :"Largest carnivorous dinosaur, semi-aquatic with a sail.", 
                pos :{ x :30 , y :0 , z :-40 }, rot: -Math.PI / 6, scale :0.12, 
                model:"/models/Spinosaurus/spinosaurus.gltf" 
            },
            { 
                name: "Carnotaurus", sciName: "Carnotaurus sastrei",
                height :3.5 , length :8, diet: "Carnivore",
                desc :"Fast predator with bull-like horns above eyes.", 
                pos:{ x :-30 , y :1 , z :-10 }, rot: Math.PI, scale :0.8, 
                model:"/models/Carnotaurus/carnotaurus.gltf" 
            },
            { 
                name: "Brachiosaurus", sciName: "Brachiosaurus altithorax",
                height: 15, length: 26, diet: "Herbivore",
                desc: "Gentle giant. One of the tallest dinosaurs.", 
                pos: {x: 0, z: -60}, rot: 0, scale: 1.8, 
                model: "/models/Brachiosaurus/brachiosaurus.gltf" 
            },
            { 
                name: "Pterodactyl", sciName: "Pterodactylus antiquus",
                height: 1, length: 2, diet: "Carnivore",
                desc: "Flying reptile. Not technically a dinosaur.", 
                pos: {x: 15, z: -5, y: 30}, rot: Math.PI / 3, scale: 0.0005, 
                model: "/models/Pterodactyl/pterodactyl.gltf" 
            },
            { 
                name: "Giganotosaurus", sciName: "Giganotosaurus carolinii",
                height: 6.5, length: 13, diet: "Carnivore",
                desc: "Larger than T-Rex.", 
                pos: {x: 25, y:0, z: 0}, rot: Math.PI / 1.5, scale: 1.5,
                model: "/models/Giganotosaurus/giganotosaurus.gltf" 
            },
            { 
                name: "Allosaurus", sciName: "Allosaurus fragilis",
                height: 4, length: 10, diet: "Carnivore",
                desc: "The lion of the Jurassic period.", 
                pos: {x: -15, y: 1,z: 15}, rot: Math.PI / 4, scale: 1.2, 
                model: "/models/Allosaurus/allosaurus.gltf" 
            },
            { 
                name: "Argentinosaurus", sciName: "Argentinosaurus huinculensis",
                height: 21, length: 35, diet: "Herbivore",
                desc: "One of the largest land animals to ever exist.", 
                pos: {x: -40, y: 0, z: 30}, rot: Math.PI / 4, scale: 800, 
                model: "/models/Argentinosaurus/argentinosaurus.gltf" 
            },
            { 
                name: "Ankylosaurus", sciName: "Ankylosaurus magniventris",
                height: 2.5, length: 8, diet: "Herbivore",
                desc: "Living tank with a heavy tail club for defense.", 
                pos: {x: -10, y: 0, z: 45}, rot: Math.PI, scale: 0.1, 
                model: "/models/Ankylosaurus/ankylosaurus.gltf" 
            },
            { 
                name: "Parasaurolophus", sciName: "Parasaurolophus walkeri",
                height: 4, length: 10, diet: "Herbivore",
                desc: "Known for its large cranial crest used for communication.", 
                pos: {x: 45, y: 0, z: 20}, rot: Math.PI / 1.2, scale: 0.1, 
                model: "/models/Parasaurolophus/parasaurolophus.gltf" 
            },
            { 
                name: "Albertosaurus", sciName: "Albertosaurus sarcophagus",
                height: 3.2, length: 9, diet: "Carnivore",
                desc: "A smaller, faster relative of the T-Rex.", 
                pos: {x: -50, y: 0, z: 0}, rot: Math.PI / 3, scale: 0.1, 
                model: "/models/Albertosaurus/albertosaurus.gltf" 
            },
            { 
                name: "Carcharodontosaurus", sciName: "Carcharodontosaurus saharicus",
                height: 6, length: 13, diet: "Carnivore",
                desc: "The 'Shark-Toothed Lizard'. Massive land predator.", 
                pos: {x: 10, y: 0, z: 60}, rot: -Math.PI / 1.5, scale: 0.1, 
                model: "/models/Carcharodontosaurus/carcharodontosaurus.gltf" 
            },
            { 
                name: "Stegosaurus", sciName: "Stegosaurus stenops",
                height: 4, length: 9, diet: "Herbivore",
                desc: "A large armored dinosaur known for the kite-shaped plates on its back and spikes on its tail.", 
                pos: {x: 60, y: 0, z: 10}, rot: Math.PI / 1.5, scale: 0.12, 
                model: "/models/Stegosaurus/stegosaurus.gltf" 
            }
        ];
    }

    // Keep instance method for backwards compatibility, but it calls static
    getDinoData() {
        return DinosaurManager.getStaticDinoData();
    }

    createHitboxes() {
        const boxMat = new THREE.MeshBasicMaterial({ visible: false, wireframe: true });
        this.data.forEach((dino, index) => {
            const geometry = new THREE.BoxGeometry(dino.length / 2, dino.height, dino.length);
            const hitbox = new THREE.Mesh(geometry, boxMat);
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
        if(!targetDino) {
            console.warn(`Cannot travel to dino index ${index}: Mesh not loaded.`);
            return;
        }

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

    static async preloadAllAssets(onProgress) {
        // Use static data
        const dinoData = DinosaurManager.getStaticDinoData();
        const total = dinoData.length;
        let loaded = 0;
        const results = [];
        
        for (let i = 0; i < dinoData.length; i++) {
            const dino = dinoData[i];
            let gltf = null;
            let text = `Loading ${dino.name}...`;
            
            try {
                gltf = await new Promise((resolve, reject) => loadGLTFModel(dino.model, resolve, reject));
                
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
            } catch (e) { 
                console.warn(`Failed to load ${dino.name}`, e); 
            }
            
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
        }, (err) => console.warn("Human model missing", err));
    }
}