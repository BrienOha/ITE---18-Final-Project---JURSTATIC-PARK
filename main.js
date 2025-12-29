import * as THREE from 'three';
import { World } from './src/World.js';
import { DinosaurManager } from './src/DinosaurManager.js';
import { InputController } from './src/InputController.js';
import { UIManager } from './src/UIManager.js';
import { setLoadingProgress, hideLoadingBar } from './loading-bar.js';

// Globals
let renderer, scene, camera, world, dinoManager, input;
let isGameActive = false;

// 1. Initialize UI
const uiManager = new UIManager();

// 2. Initialize the 3D Scene immediately (for Title Background)
initEnvironment();

// 3. Listen for "Start" to load the rest
window.addEventListener('startSimulation', () => {
    initGameAssets();
});

// --- PHASE 1: ENVIRONMENT & CINEMATIC CAM ---
function initEnvironment() {
    const canvas = document.querySelector('#webgl');
    canvas.classList.remove('hidden');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x112233);

    const sizes = { width: window.innerWidth, height: window.innerHeight };
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
    
    // Intro Camera Position
    camera.position.set(0, 30, 80);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
    });

    // NOTE: For the environment generation (trees, etc.), we still use a temporary static set
    // or we could fetch here too, but for performance, we let the World build 
    // while the user is on the title screen using default data.
    // Ideally, World.js would also accept dynamic data, but for now we keep it simple.
    // Use an empty array or basic placeholder if needed, or keep the static import in World if it exists.
    // For this implementation, we pass an empty array initially because the actual Dinos 
    // are loaded later in initGameAssets.
    world = new World(scene, []); 

    // Start Cinematic Loop
    const clock = new THREE.Clock();
    const introTick = () => {
        if (isGameActive) return; // Stop this loop when game starts

        const time = clock.getElapsedTime();
        
        // Cinematic Pan
        camera.position.x = Math.sin(time * 0.1) * 60;
        camera.position.z = Math.cos(time * 0.1) * 60;
        camera.position.y = 30 + Math.sin(time * 0.2) * 5;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        requestAnimationFrame(introTick);
    };
    introTick();
}

// --- PHASE 2: LOAD DINOSAURS & GAMEPLAY ---
async function initGameAssets() {
    try {
        document.getElementById('loading-overlay').classList.remove('hidden');
        setLoadingProgress(0, 'Initializing Biological Assets...');

        // UPDATED: Destructure the result because preloadAllAssets now returns { assets, data }
        const { assets, data } = await DinosaurManager.preloadAllAssets((percent, text) => {
            setLoadingProgress(percent, text);
        });

        setLoadingProgress(100, 'Simulation Active');

        // Place Dinosaurs
        const loadedMeshes = new Array(assets.length).fill(null);
        assets.forEach((asset, i) => {
            if (asset.gltf) {
                const gltfScene = asset.gltf;
                const data = asset.dino; // The raw data from DB

                // 1. APPLY SCALE
                const scale = data.scale || 1;
                gltfScene.scale.set(scale, scale, scale);
                
                // 2. APPLY POSITION (DEBUGGING ADDED)
                // We check for 'pos', 'position', or default to 0
                const x = data.pos?.x ?? data.position?.x ?? 0;
                const y = data.pos?.y ?? data.position?.y ?? 0;
                const z = data.pos?.z ?? data.position?.z ?? 0;
                
                // Console log to verify (Check this in your browser console!)
                console.log(`Placing ${data.name} at:`, x, y, z);
                
                gltfScene.position.set(x, y, z);
                
                // 3. APPLY SHADOWS
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
        // UPDATED: Pass the fetched 'data' to the manager so it knows about the dinos
        dinoManager = new DinosaurManager(scene, camera, uiManager, loadedMeshes, data);

        // Populate UI List
        uiManager.populateList(dinoManager.data, (index) => {
            dinoManager.travelTo(index);
        });

        // Setup Controls
        input = new InputController(camera, document.body);
        
        // Reset Camera for Gameplay
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 5, 0);

        // Switch Loops
        isGameActive = true;
        hideLoadingBar();
        
        // Start Game Loop
        const gameClock = new THREE.Clock();
        const gameTick = () => {
            const delta = gameClock.getDelta();
            
            input.update(delta);
            dinoManager.checkIntersection();
            
            renderer.render(scene, camera);
            requestAnimationFrame(gameTick);
        };
        gameTick();

    } catch (error) {
        console.error("CRITICAL ERROR IN LOADING:", error);
        setLoadingProgress(100, "SYSTEM FAILURE");
        // Don't hide loading bar immediately so user sees error
    }
}

// Settings Listener
window.addEventListener('settingsChanged', (e) => {
    if (!renderer || !world) return;
    const { quality, shadows } = e.detail;
    
    if (quality === 'low') renderer.setPixelRatio(1);
    else if (quality === 'medium') renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    else renderer.setPixelRatio(window.devicePixelRatio);

    world.updateGraphics(quality, shadows);
});

