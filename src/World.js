import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.setupLights();
        this.setupEnvironment();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffccaa, 1); // Sunlight
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        this.scene.add(dirLight);
        
        this.scene.fog = new THREE.FogExp2(0x112233, 0.008); // Jungle Fog
    }

    setupEnvironment() {
        // 1. Floor (Grass)
        const floorGeo = new THREE.PlaneGeometry(500, 500);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a4010, roughness: 0.8 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // 2. Fences (Cylinders) - Perimeter
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
        for(let i = 0; i < 40; i++) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 10), fenceMat);
            const angle = (i / 40) * Math.PI * 2;
            const radius = 80;
            post.position.set(Math.cos(angle) * radius, 5, Math.sin(angle) * radius);
            this.scene.add(post);
        }

        // 3. Gyrosphere (Placeholder Sphere)
        const sphereGeo = new THREE.SphereGeometry(1.5, 32, 32);
        const sphereMat = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff, transmission: 0.9, opacity: 0.5, transparent: true, roughness: 0 
        });
        const gyrosphere = new THREE.Mesh(sphereGeo, sphereMat);
        gyrosphere.position.set(5, 1.5, 5);
        this.scene.add(gyrosphere);

        // 4. Jeep (Placeholder Box)
        const jeep = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 4),
            new THREE.MeshStandardMaterial({ color: 0xaa0000 }) // JP Red
        );
        jeep.position.set(-10, 1, 10);
        this.scene.add(jeep);
    }
}