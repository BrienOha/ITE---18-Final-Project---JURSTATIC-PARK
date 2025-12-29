import * as THREE from 'three';
import { World } from './src/World.js';
import { DinosaurManager } from './src/DinosaurManager.js';
import { InputController } from './src/InputController.js';
import { UIManager } from './src/UIManager.js';
import { setLoadingProgress, hideLoadingBar } from './loading-bar.js';

let renderer, world;

// 1. Initialize UI
const uiManager = new UIManager();

// 2. Listen for Start
window.addEventListener('startSimulation', () => {
    init3DWorld();
});

async function init3DWorld() {
    try {
        const canvas = document.querySelector('#webgl');
        
        // Show loading visuals
        canvas.classList.remove('hidden');
        document.getElementById('loading-overlay').classList.remove('hidden');
        setLoadingProgress(0, 'Connecting to Satellite...');

        // Preload Assets
        const assets = await DinosaurManager.preloadAllAssets((percent, text) => {
            setLoadingProgress(percent, text);
        });

        setLoadingProgress(100, 'System Ready');

        // Setup Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x112233);

        const sizes = { width: window.innerWidth, height: window.innerHeight };
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
        camera.position.set(0, 5, 10);
        
        // FIX: Add camera to scene directly
        scene.add(camera);

        // Setup Renderer
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;

        // Resize Handler
        window.addEventListener('resize', () => {
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;
            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();
            renderer.setSize(sizes.width, sizes.height);
        });

        // Process Assets
        const dinoDataList = [];
        const loadedMeshes = new Array(assets.length).fill(null);

        assets.forEach((asset, i) => {
            dinoDataList.push(asset.dino);
            if (asset.gltf) {
                const gltfScene = asset.gltf;
                const scale = asset.dino.scale || 1;
                gltfScene.scale.set(scale, scale, scale);
                gltfScene.position.set(asset.dino.pos.x, asset.dino.pos.y || 0, asset.dino.pos.z);
                
                gltfScene.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                scene.add(gltfScene);
                loadedMeshes[i] = gltfScene;
            }
        });

        // Initialize Managers
        world = new World(scene, dinoDataList);
        const dinoManager = new DinosaurManager(scene, camera, uiManager, loadedMeshes);
        
        // Setup Inputs - Attached to Body
        const input = new InputController(camera, document.body);
        
        // FIX: Removed the failing scene.add(input.controls.getObject()) line.
        // We do not need to add controls to scene, we manipulate camera directly.

        // Populate UI
        uiManager.populateList(dinoManager.data, (index) => {
            dinoManager.travelTo(index);
        });

        // Start Loop
        const clock = new THREE.Clock();
        const tick = () => {
            const delta = clock.getDelta();
            input.update(delta);
            dinoManager.checkIntersection();
            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        };
        
        // Hide Loader
        hideLoadingBar();
        tick();

    } catch (error) {
        console.error("CRITICAL ERROR IN INIT:", error);
        setLoadingProgress(100, "SYSTEM FAILURE (Check Console)");
    }
}

// Global Settings Listener
window.addEventListener('settingsChanged', (e) => {
    if (!renderer || !world) return;
    const { quality, shadows } = e.detail;
    
    if (quality === 'low') renderer.setPixelRatio(1);
    else if (quality === 'medium') renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    else renderer.setPixelRatio(window.devicePixelRatio);

    world.updateGraphics(quality, shadows);
});