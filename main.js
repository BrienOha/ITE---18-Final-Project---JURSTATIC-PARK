import * as THREE from 'three';
import { World } from './src/World.js';
import { DinosaurManager } from './src/DinosaurManager.js';
import { InputController } from './src/InputController.js';
import { UIManager } from './src/UIManager.js';

// 1. Setup Scene
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x112233); // Night/Dusk vibe

// 2. Setup Camera
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200);
camera.position.set(0, 2, 10); // Start position

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
const dinoManager = new DinosaurManager(scene, camera, uiManager);
const input = new InputController(camera, canvas);

// Populate UI List
uiManager.populateList(dinoManager.data, (index) => {
    dinoManager.travelTo(index);
});

// 6. Animation Loop
const clock = new THREE.Clock();

const tick = () => {
    const delta = clock.getDelta();

    // Update Movement
    input.update(delta);

    // Update Interactions (Raycasting)
    // Only check intersection if we are NOT moving fast (optimization)
    dinoManager.checkIntersection();

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();