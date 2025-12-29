import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class InputController {
    constructor(camera, domElement) {
        this.camera = camera; // Store reference to camera
        this.controls = new PointerLockControls(camera, domElement);

        this.crosshair = document.getElementById('crosshair');

        // Movement Flags
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;   // Ctrl
        this.moveDown = false; // Shift

        // Physics Vectors
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Settings
        this.speed = 80.0;          
        this.verticalSpeed = 60.0;  
        this.damping = 10.0;        

        this.initListeners();
    }

    initListeners() {
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'ArrowUp': case 'KeyW': this.moveForward = true; break;
                case 'ArrowLeft': case 'KeyA': this.moveLeft = true; break;
                case 'ArrowDown': case 'KeyS': this.moveBackward = true; break;
                case 'ArrowRight': case 'KeyD': this.moveRight = true; break;
                
                // Vertical Controls
                case 'KeyC': this.moveUp = true; break;
                case 'KeyV': this.moveDown = true; break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'ArrowUp': case 'KeyW': this.moveForward = false; break;
                case 'ArrowLeft': case 'KeyA': this.moveLeft = false; break;
                case 'ArrowDown': case 'KeyS': this.moveBackward = false; break;
                case 'ArrowRight': case 'KeyD': this.moveRight = false; break;

                case 'KeyC': this.moveUp = false; break;
                case 'KeyV': this.moveDown = false; break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        this.controls.addEventListener('lock', () => {
            // Show Crosshair when playing
            if(this.crosshair) this.crosshair.classList.remove('hidden');
        });

        this.controls.addEventListener('unlock', () => {
            // Hide Crosshair when in menu
            if(this.crosshair) this.crosshair.classList.add('hidden');
        });


        const btn = document.getElementById('toggle-roam');
        if (btn) {
            btn.addEventListener('click', () => {
                this.controls.lock();
            });
        }
    }

    update(delta) {
        if (this.controls.isLocked === true) {
            
            // 1. Damping
            this.velocity.x -= this.velocity.x * this.damping * delta;
            this.velocity.z -= this.velocity.z * this.damping * delta;
            this.velocity.y -= this.velocity.y * this.damping * delta;

            // 2. Input Direction
            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize(); 

            // 3. Apply Speed
            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.speed * delta;
            if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.speed * delta;
            
            // Vertical Logic
            if (this.moveUp) this.velocity.y += this.verticalSpeed * delta;
            if (this.moveDown) this.velocity.y -= this.verticalSpeed * delta;

            // 4. Move Camera
            // PointerLockControls handles horizontal movement relative to look direction
            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            
            // Apply Vertical directly to the camera (Fixes the error)
            this.camera.position.y += this.velocity.y * delta;
        }
    }
}