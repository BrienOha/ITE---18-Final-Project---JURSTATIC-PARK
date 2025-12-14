
import * as THREE from 'three';
import { World } from './src/World.js';
import { DinosaurManager } from './src/DinosaurManager.js';
import { InputController } from './src/InputController.js';
import { UIManager } from './src/UIManager.js';
import { setLoadingProgress, hideLoadingBar } from './loading-bar.js';


async function startApp() {
    // Show loading bar and preload assets
    setLoadingProgress(0, 'Loading assets...');
    const assets = await DinosaurManager.preloadAllAssets((percent, text) => {
        setLoadingProgress(percent, text);
    });
    setLoadingProgress(100, 'Finalizing...');

    // 1. Setup Scene
    const canvas = document.querySelector('#webgl');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x112233);

    // 2. Setup Camera
    const sizes = { width: window.innerWidth, height: window.innerHeight };
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200);
    camera.position.set(0, 2, 10);

    // 3. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // 4. Resize Handler
    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
    });

    // 5. Initialize Modules
    const uiManager = new UIManager();
    const world = new World(scene);
    // Use preloaded assets for DinosaurManager
    const dinoManager = new DinosaurManager(scene, camera, uiManager);
    const input = new InputController(camera, canvas);

    // Place preloaded models in the scene
    assets.forEach((asset, i) => {
        if (asset.gltf) {
            let gltfScene = asset.gltf;
            // Apply scale from dino data (default 1)
            const scale = asset.dino.scale || 1;
            gltfScene.scale.set(scale, scale, scale);
            // Apply textures if present
            if (asset.textures) {
                gltfScene.traverse((child) => {
                    if (child.isMesh && child.material) {
                        if (asset.textures.map) child.material.map = asset.textures.map;
                        if (asset.textures.normalMap) child.material.normalMap = asset.textures.normalMap;
                        child.material.needsUpdate = true;
                    }
                });
            }
            gltfScene.position.set(asset.dino.pos.x, asset.dino.pos.y || 0, asset.dino.pos.z);
            gltfScene.userData = { info: asset.dino };
            scene.add(gltfScene);
            dinoManager.dinoMeshes[i] = gltfScene;
        }
    });

    // Populate UI List
    uiManager.populateList(dinoManager.data, (index) => {
        dinoManager.travelTo(index);
    });

    // Hide loading bar
    hideLoadingBar();

    // 6. Animation Loop
    const clock = new THREE.Clock();
    const tick = () => {
        const delta = clock.getDelta();
        input.update(delta);
        dinoManager.checkIntersection();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };
    tick();
    
}

startApp();