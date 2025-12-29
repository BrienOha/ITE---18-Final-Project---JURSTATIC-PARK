import * as THREE from 'three';
import GUI from 'lil-gui';
import { loadGLTFModel } from './GLTFUtils.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class World {
    constructor(scene, dinoData = []) {
        this.scene = scene;
        this.dinoData = dinoData; 
        
        // Store references
        this.sunLight = null;
        this.ambientLight = null;
        this.groundMeshes = [];
        this.treeMeshes = []; 

        this.setupLights();
        this.setupEnvironment();    
    }

    // Settings update handler
    updateGraphics(quality, shadowsEnabled) {
        this.sunLight.castShadow = shadowsEnabled;
        
        if (shadowsEnabled) {
            const size = quality === 'low' ? 1024 : (quality === 'medium' ? 2048 : 4096);
            this.sunLight.shadow.mapSize.width = size;
            this.sunLight.shadow.mapSize.height = size;
            this.sunLight.shadow.map?.dispose();
            this.sunLight.shadow.map = null;
        }

        this.treeMeshes.forEach(tree => {
            tree.castShadow = (quality === 'high' && shadowsEnabled);
            tree.receiveShadow = shadowsEnabled;
        });
    }

    setupLights() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(this.ambientLight);

        const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2); 
        hemi.position.set(0, 50, 0);
        this.scene.add(hemi);

        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5); 
        this.sunLight.position.set(50, 80, 50); 
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048; 
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.bias = -0.0001;
        this.sunLight.shadow.normalBias = 0.02;
        
        const d = 150; 
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.sunLight.shadow.camera.near = 0.1;
        this.sunLight.shadow.camera.far = 500;

        this.scene.add(this.sunLight);

        const fogColor = 0xcce0ff; 
        this.scene.fog = new THREE.FogExp2(fogColor, 0.002); 
    }

    setupGUI() {
        if (this.floorMat) {
            const floorFolder = this.gui.addFolder('Floor / Ground Surface');
            floorFolder.add(this.floorMat, 'roughness', 0, 1).name('Roughness');
            floorFolder.add(this.floorMat, 'metalness', 0, 1).name('Metalness');
            floorFolder.addColor({ c: this.floorMat.color.getHex() }, 'c').onChange(v => this.floorMat.color.set(v));
        }
        const sunFolder = this.gui.addFolder('Sun (Directional)');
        sunFolder.add(this.sunLight, 'intensity', 0, 5);
        sunFolder.add(this.sunLight.position, 'y', 0, 100);
    }

    setupEnvironment() {
        // HDR Sky
        const rgbeLoader = new RGBELoader();
        rgbeLoader.load('/textures/sky.hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.background = texture;
            this.scene.environment = texture;
            this.scene.backgroundBlurriness = 0.1; 
        }, undefined, () => {
            this.scene.background = new THREE.Color(0xcce0ff);
        });

        // --- GROUND WITH GAP FIX ---
        loadGLTFModel('/models/Ground/ground.gltf', (gltfScene) => {
            const box = new THREE.Box3().setFromObject(gltfScene);
            const size = new THREE.Vector3(); box.getSize(size);

            const tileX = 6, tileZ = 6; 
            
            // FIX: Use slight overlap (0.5% smaller step than size) to mash edges together
            const stepX = size.x * 0.995; 
            const stepZ = size.z * 0.995;

            for (let ix = -Math.floor(tileX/2); ix <= Math.floor(tileX/2); ix++) {
                for (let iz = -Math.floor(tileZ/2); iz <= Math.floor(tileZ/2); iz++) {
                    const clone = gltfScene.clone(true);
                    
                    const scaleX = (Math.abs(ix) % 2 === 1) ? -1 : 1;
                    const scaleZ = (Math.abs(iz) % 2 === 1) ? -1 : 1;
                    
                    clone.scale.set(scaleX, 0.15, scaleZ); 

                    clone.traverse((child) => {
                        if (child.isMesh) {
                            child.material = child.material.clone();
                            child.material.side = THREE.DoubleSide; 
                            child.castShadow = false;
                            child.receiveShadow = true;
                            if(child.material.normalMap) child.material.normalScale.set(scaleX, scaleZ); 
                        }
                    });
                    
                    // Adjust Y slightly to prevent z-fighting if perfectly flat, but with 3D ground it's fine
                    clone.position.set(ix * stepX, 0, iz * stepZ);
                    this.scene.add(clone);
                    this.groundMeshes.push(clone);
                }
            }
            const worldWidth = tileX * stepX;
            const worldDepth = tileZ * stepZ;
            
            // Reverted to 700 standard trees (Good FPS, visible leaves)
            this.spawnTrees(700, worldWidth, worldDepth);

        }, (error) => {
            const floorGeo = new THREE.PlaneGeometry(500, 500);
            this.floorMat = new THREE.MeshStandardMaterial({ color: 0xFFA500, roughness: 0.2, metalness: 0.1 });
            const floor = new THREE.Mesh(floorGeo, this.floorMat);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            this.scene.add(floor);
            this.groundMeshes.push(floor);
            this.spawnTrees(200, 200, 200);
        });

        this.spawnFences();
        this.loadProps();
    }

    loadProps() {
        // Only Gyrosphere remains (You removed Jeep)
        loadGLTFModel('/models/Gyrosphere/gyrosphere.gltf', (model) => {
            model.position.set(5, 0.5, 5); 
            model.scale.set(1.5, 1.5, 1.5); 
            model.traverse(c => { if(c.isMesh) { c.castShadow = true; c.receiveShadow = true; }});
            this.scene.add(model);
        });
    }

    spawnFences() {
        const radius = 80;
        const scaleFactor = 4;
        
        Promise.all([
            new Promise((res, rej) => loadGLTFModel('/models/Fences/dirty_fence/dirty_fence.gltf', res, rej)),
            new Promise((res, rej) => loadGLTFModel('/models/Fences/dirty_fence_broken/dirty_fence_broken.gltf', res, rej))
        ]).then(([fenceModel, brokenFenceModel]) => {
            
            fenceModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
            brokenFenceModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
            
            const box = new THREE.Box3().setFromObject(fenceModel);
            const size = new THREE.Vector3(); box.getSize(size);
            const fenceWidth = Math.max(size.x, size.z); 
            const circumference = 2 * Math.PI * radius;
            const count = fenceWidth > 0 ? Math.ceil(circumference / fenceWidth) : 100;

            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const isBroken = Math.random() < 0.15;
                const modelToClone = isBroken ? brokenFenceModel : fenceModel;
                const fence = modelToClone.clone(true);
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                
                fence.position.set(x, 0, z);
                fence.lookAt(0, 0, 0); 
                fence.rotateY(Math.PI / 2); 
                fence.scale.set(scaleFactor, scaleFactor, scaleFactor);

                fence.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                this.scene.add(fence);
            }
        }).catch(err => console.warn("Fence error", err));
    }

    spawnTrees(count, rangeX, rangeZ) {
        loadGLTFModel('models/Trees/tree.gltf', (gltfScene) => {
            const raycaster = new THREE.Raycaster();
            const down = new THREE.Vector3(0, -1, 0);
            const origin = new THREE.Vector3();
            const dummy = new THREE.Object3D(); 
            
            const meshes = [];
            
            // 1. Find all meshes in the tree model
            gltfScene.traverse((child) => {
                if (child.isMesh) {
                    const geometry = child.geometry.clone();
                    

                    geometry.rotateX(-Math.PI / 2); 
                    
                    meshes.push({ geometry: geometry, material: child.material });
                }
            });

            // 2. Create the optimized InstancedMeshes
            const instancedMeshes = meshes.map(data => {
                const instanced = new THREE.InstancedMesh(data.geometry, data.material, count);
                instanced.castShadow = true;
                instanced.receiveShadow = true;
                this.scene.add(instanced);
                return instanced;
            });

            this.treeMeshes = instancedMeshes; 

            let treesPlaced = 0;
            let attempts = 0;
            const maxAttempts = count * 50; 
            const existingPositions = [];
            const minDistance = 5;

            while (treesPlaced < count && attempts < maxAttempts) {
                attempts++;
                const rX = (Math.random() - 0.5) * rangeX; 
                const rZ = (Math.random() - 0.5) * rangeZ;

                
                // 1. Fence Check (Sparse inside)
                if (Math.sqrt(rX*rX + rZ*rZ) < 80) {
                     if (Math.random() > 0.05) continue;
                }

                // 2. Dino Collision
                let hitDino = false;
                for (const dino of this.dinoData) {
                    const dx = rX - dino.pos.x;
                    const dz = rZ - dino.pos.z;
                    if (Math.sqrt(dx*dx + dz*dz) < (dino.length/2) + 10) { hitDino = true; break; }
                }
                if (hitDino) continue; 

                // 3. Tree Spacing
                const candidate = new THREE.Vector3(rX, 0, rZ);
                let tooClose = false;
                for (const pos of existingPositions) {
                    if (candidate.distanceTo(pos) < minDistance) { tooClose = true; break; }
                }
                if (tooClose) continue;

                // --- PLACEMENT ---
                origin.set(rX, 100, rZ); 
                raycaster.set(origin, down);
                const intersects = raycaster.intersectObjects(this.groundMeshes, true);

                if (intersects.length > 0) {
                    const hit = intersects[0].point;
                    
                    // Position
                    dummy.position.set(hit.x, hit.y, hit.z);

                    // Rotation 
                    dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);

                    const dice = Math.random(); 
                    let scale;
                    if (dice > 0.95) scale = 3.5 + Math.random() * 1.5; 
                    else if (dice > 0.8) scale = 2.0 + Math.random() * 1.0; 
                    else if (dice > 0.5) scale = 1.2 + Math.random() * 0.6; 
                    else scale = 0.5 + Math.random() * 0.5; 
                    dummy.scale.set(scale, scale, scale);

                    dummy.updateMatrix();

                    for (const imesh of instancedMeshes) {
                        imesh.setMatrixAt(treesPlaced, dummy.matrix);
                    }

                    existingPositions.push(candidate);
                    treesPlaced++;
                }
            }

            for (const imesh of instancedMeshes) {
                imesh.instanceMatrix.needsUpdate = true;
            }
        });
    }
}