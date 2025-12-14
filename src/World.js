import * as THREE from 'three';
import GUI from 'lil-gui';
import { loadGLTFModel } from './GLTFUtils.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.gui = new GUI({ title: "Lighting Studio" });
        
        // Store references
        this.sunLight = null;
        this.ambientLight = null;
        this.hemiLight = null;
        this.spotLight = null;
        this.pointLight = null;
        
        // Store material references for GUI
        this.floorMat = null; 
        
        this.helpers = {};

        // NEW: Store ground meshes for Raycasting
        this.groundMeshes = [];

        this.setupLights();
        this.setupEnvironment();
        this.setupGUI();
    }

    setupLights() {
        // --- 1. Ambient Light ---
        this.ambientLight = new THREE.AmbientLight(0x663344, 0.2);
        this.scene.add(this.ambientLight);

        // --- 2. Hemisphere Light ---
        this.hemiLight = new THREE.HemisphereLight(0x1815d1, 0x005500, 0.5); 
        this.hemiLight.position.set(0, 50, 0);
        this.scene.add(this.hemiLight);

        // --- 3. Sun (Directional Light) ---
        this.sunLight = new THREE.DirectionalLight(0xffaa33, 1.5);
        this.sunLight.position.set(-50, 10, -50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.bias = -0.001;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        // --- 4. SpotLight ---
        this.spotLight = new THREE.SpotLight(0xffffff, 0); 
        this.spotLight.position.set(20, 40, 20);
        this.spotLight.angle = Math.PI / 6;
        this.spotLight.penumbra = 0.5;
        this.spotLight.castShadow = true;
        this.scene.add(this.spotLight);
        this.spotLight.target.position.set(0, 0, 0);
        this.scene.add(this.spotLight.target);

        // --- 5. PointLight ---
        this.pointLight = new THREE.PointLight(0xff0000, 0, 50); 
        this.pointLight.position.set(0, 5, 0);
        this.scene.add(this.pointLight);

        // --- Fog ---
        const fogColor = 0xff9966;
        this.scene.fog = new THREE.FogExp2(fogColor, 0.012);
        this.scene.background = new THREE.Color(fogColor);
    }

    setupGUI() {
        // --- Floor Controls ---
        if (this.floorMat) {
            const floorFolder = this.gui.addFolder('Floor / Ground Surface');
            floorFolder.add(this.floorMat, 'roughness', 0, 1).name('Roughness (Wet/Dry)');
            floorFolder.add(this.floorMat, 'metalness', 0, 1).name('Metalness');
            floorFolder.addColor({ c: this.floorMat.color.getHex() }, 'c')
                .name('Floor Color').onChange(v => this.floorMat.color.set(v));
        }

        // --- Light Controls ---
        const sunFolder = this.gui.addFolder('Sun (Directional)');
        sunFolder.add(this.sunLight, 'intensity', 0, 5).name('Intensity');
        sunFolder.add(this.sunLight.position, 'y', 0, 100).name('Height (Time)');
        sunFolder.add(this.sunLight.position, 'x', -100, 100).name('X Pos');
        sunFolder.addColor({ c: this.sunLight.color.getHex() }, 'c')
            .name('Color').onChange(v => this.sunLight.color.set(v));

        const hemiFolder = this.gui.addFolder('Hemisphere');
        hemiFolder.add(this.hemiLight, 'intensity', 0, 2).name('Intensity');
        hemiFolder.addColor({ c: this.hemiLight.color.getHex() }, 'c')
            .name('Sky Color').onChange(v => this.hemiLight.color.set(v));
        hemiFolder.addColor({ c: this.hemiLight.groundColor.getHex() }, 'c')
            .name('Ground Color').onChange(v => this.hemiLight.groundColor.set(v));

        const ambFolder = this.gui.addFolder('Ambient');
        ambFolder.add(this.ambientLight, 'intensity', 0, 2).name('Intensity');
        
        const spotFolder = this.gui.addFolder('SpotLight');
        spotFolder.add(this.spotLight, 'intensity', 0, 20).name('Intensity');
        spotFolder.add(this.spotLight.position, 'y', 1, 100).name('Height');
        const updateSpot = () => this.spotLight.target.updateMatrixWorld();
        spotFolder.add(this.spotLight.target.position, 'x', -50, 50).name('Target X').onChange(updateSpot);
        spotFolder.add(this.spotLight.target.position, 'z', -50, 50).name('Target Z').onChange(updateSpot);

        const pointFolder = this.gui.addFolder('PointLight');
        pointFolder.add(this.pointLight, 'intensity', 0, 20).name('Intensity');
        pointFolder.add(this.pointLight.position, 'y', 0, 50).name('Y Pos');
        
        // --- Debug Helpers ---
        const helperFolder = this.gui.addFolder('Debug Helpers');
        const helperSettings = { showSun: false, showSpot: false, showPoint: false };

        helperFolder.add(helperSettings, 'showSun').name('Show Sun Helper').onChange(v => {
            if (v) { this.helpers.sun = new THREE.DirectionalLightHelper(this.sunLight, 5); this.scene.add(this.helpers.sun); } 
            else { this.scene.remove(this.helpers.sun); }
        });
        helperFolder.add(helperSettings, 'showSpot').name('Show Spot Helper').onChange(v => {
            if (v) { this.helpers.spot = new THREE.SpotLightHelper(this.spotLight); this.scene.add(this.helpers.spot); } 
            else { this.scene.remove(this.helpers.spot); }
        });
        helperFolder.add(helperSettings, 'showPoint').name('Show Point Helper').onChange(v => {
            if (v) { this.helpers.point = new THREE.PointLightHelper(this.pointLight, 2); this.scene.add(this.helpers.point); } 
            else { this.scene.remove(this.helpers.point); }
        });
    }

    setupEnvironment() {
        // --- 1. Ground GLTF Model with Mirrored Tiling ---
        loadGLTFModel('/models/Ground/ground.gltf', (gltfScene) => {
            
            const box = new THREE.Box3().setFromObject(gltfScene);
            const size = new THREE.Vector3();
            box.getSize(size);

            const tileX = 6; 
            const tileZ = 6; 
            const overlap = 0.1; 
            const stepX = size.x - overlap;
            const stepZ = size.z - overlap;

            for (let ix = -Math.floor(tileX/2); ix <= Math.floor(tileX/2); ix++) {
                for (let iz = -Math.floor(tileZ/2); iz <= Math.floor(tileZ/2); iz++) {
                    
                    const clone = gltfScene.clone(true);
                    
                    const scaleX = (Math.abs(ix) % 2 === 1) ? -1 : 1;
                    const scaleZ = (Math.abs(iz) % 2 === 1) ? -1 : 1;
                    clone.scale.set(scaleX, 1, scaleZ);

                    clone.traverse((child) => {
                        if (child.isMesh) {
                            child.material = child.material.clone();
                            child.geometry = child.geometry.clone();
                            child.material.side = THREE.DoubleSide; 
                            child.castShadow = false;
                            child.receiveShadow = true;
                            if(child.material.normalMap) child.material.normalScale.set(scaleX, scaleZ); 
                        }
                    });

                    clone.position.set(ix * stepX, 0, iz * stepZ);
                    this.scene.add(clone);
                    
                    // Add to array for raycasting
                    this.groundMeshes.push(clone);
                }
            }

            // Calculate total world size to spread trees out
            const worldWidth = tileX * stepX;
            const worldDepth = tileZ * stepZ;
            
            // Spawn trees AFTER ground is placed. 
            // 40 trees, spread over the calculated world size
            this.spawnTrees(500, worldWidth, worldDepth);

        }, (error) => {
            console.warn('Failed to load ground GLTF, falling back.', error);
            const floorGeo = new THREE.PlaneGeometry(500, 500);
            this.floorMat = new THREE.MeshStandardMaterial({ color: 0xFFA500, roughness: 0.2, metalness: 0.1 });
            const floor = new THREE.Mesh(floorGeo, this.floorMat);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            this.scene.add(floor);
            this.groundMeshes.push(floor);
            
            this.spawnTrees(40, 200, 200);
        });

        // --- 2. Fences ---
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
        for(let i = 0; i < 40; i++) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 10), fenceMat);
            const angle = (i / 40) * Math.PI * 2;
            const radius = 80;
            post.position.set(Math.cos(angle) * radius, 5, Math.sin(angle) * radius);
            this.scene.add(post);
        }

        // --- 3. Gyrosphere ---
        const sphereGeo = new THREE.SphereGeometry(1.5, 32, 32);
        const sphereMat = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff, transmission: 0.9, opacity: 0.5, transparent: true, roughness: 0 
        });
        const gyrosphere = new THREE.Mesh(sphereGeo, sphereMat);
        gyrosphere.position.set(5, 1.5, 5);
        this.scene.add(gyrosphere);

        // --- 4. Jeep ---
        const jeep = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 4),
            new THREE.MeshStandardMaterial({ color: 0xaa0000 })
        );
        jeep.position.set(-10, 1, 10);
        this.scene.add(jeep);
    }

    // --- NEW: Tree Spawner with Spacing Logic ---
    spawnTrees(count, rangeX, rangeZ) {
        loadGLTFModel('models/Trees/tree.gltf', (treeModel) => { // Make sure path matches your setup
            
            const raycaster = new THREE.Raycaster();
            const down = new THREE.Vector3(0, -1, 0);
            const origin = new THREE.Vector3();
            
            const existingPositions = [];
            const minDistance = 5; 

            let attempts = 0;
            let treesPlaced = 0;

            // FIX: Attempts limit must be higher than the count!
            // We allow 10 attempts per tree requested to find a spot.
            const maxAttempts = count * 10; 

            while (treesPlaced < count && attempts < maxAttempts) {
                attempts++;

                // 1. Random Candidate Position
                const rX = (Math.random() - 0.5) * rangeX; 
                const rZ = (Math.random() - 0.5) * rangeZ;
                const candidate = new THREE.Vector3(rX, 0, rZ);

                // 2. Check Distance
                let tooClose = false;
                for (const pos of existingPositions) {
                    if (candidate.distanceTo(pos) < minDistance) {
                        tooClose = true;
                        break;
                    }
                }
                if (tooClose) continue;

                // 3. Raycast
                origin.set(rX, 100, rZ); 
                raycaster.set(origin, down);
                const intersects = raycaster.intersectObjects(this.groundMeshes, true);

                if (intersects.length > 0) {
                    const hit = intersects[0].point;
                    const tree = treeModel.clone(true);
                    tree.position.set(hit.x, hit.y, hit.z);

                    // --- NEW: VARIETY SIZE LOGIC ---
                    const dice = Math.random(); // 0.0 to 1.0
                    let scale;

                    if (dice > 0.95) {
                        // 5% chance of a TITAN tree (Really huge)
                        scale = 3.5 + Math.random() * 1.5; // Scale 3.5x to 5.0x
                    } 
                    else if (dice > 0.8) {
                        // 15% chance of a LARGE tree
                        scale = 2.0 + Math.random() * 1.0; // Scale 2.0x to 3.0x
                    } 
                    else if (dice > 0.5) {
                         // 30% chance of SLIGHTLY LARGE tree
                        scale = 1.2 + Math.random() * 0.6; // Scale 1.2x to 1.8x
                    }
                    else {
                        // 50% chance of AVERAGE / SMALL tree
                        scale = 0.5 + Math.random() * 0.5; // Scale 0.5x to 1.0x
                    }

                    tree.scale.set(scale, scale, scale);
                    tree.rotation.y = Math.random() * Math.PI * 2;

                    // Shadows
                    tree.traverse(c => {
                        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
                    });

                    this.scene.add(tree);
                    existingPositions.push(new THREE.Vector3(rX, 0, rZ));
                    treesPlaced++;
                }
            }
            console.log(`Placed ${treesPlaced} trees after ${attempts} attempts.`);
        });
    }}