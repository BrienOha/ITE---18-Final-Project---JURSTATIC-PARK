import * as THREE from 'three';
import gsap from 'gsap';

export class DinosaurManager {
    constructor(scene, camera, uiManager) {
        this.scene = scene;
        this.camera = camera;
        this.uiManager = uiManager;
        this.raycaster = new THREE.Raycaster();
        this.dinoMeshes = [];
        this.data = this.getDinoData();
        
        this.initDinosaurs();
        this.initHumanRef();
    }

    getDinoData() {
        return [
            { name: "T-Rex", height: 6, length: 12, color: 0x5c4033, desc: "The King of Dinosaurs. Extremely powerful bite force.", pos: {x: 0, z: -30} },
            { name: "Velociraptor", height: 1.8, length: 3, color: 0x6e7f80, desc: "Highly intelligent pack hunters. Watch the tall grass.", pos: {x: 10, z: -15} },
            { name: "Triceratops", height: 3, length: 9, color: 0x5c5c5c, desc: "Herbivore with three horns and a large frill.", pos: {x: -20, z: -20} },
            { name: "Spinosaurus", height: 7, length: 15, color: 0x2f4f4f, desc: "Largest carnivorous dinosaur, semi-aquatic with a sail.", pos: {x: 30, z: -40} },
            { name: "Carnotaurus", height: 3.5, length: 8, color: 0x8b4513, desc: "Fast predator with bull-like horns above eyes.", pos: {x: -30, z: -10} },
            { name: "Brachiosaurus", height: 15, length: 26, color: 0x8fbc8f, desc: "Gentle giant. One of the tallest dinosaurs.", pos: {x: 0, z: -60} },
            { name: "Pterodactyl", height: 1, length: 2, color: 0xd2b48c, desc: "Flying reptile. Not technically a dinosaur, but a pterosaur.", pos: {x: 15, z: -5, y: 10} },
            { name: "Mosasaurus", height: 4, length: 18, color: 0x00ced1, desc: "Apex predator of the deep seas.", pos: {x: -40, z: 20} },
            { name: "Giganotosaurus", height: 6.5, length: 13, color: 0x556b2f, desc: "Larger than T-Rex, but lighter build.", pos: {x: 25, z: 20} },
            { name: "Allosaurus", height: 4, length: 10, color: 0xa0522d, desc: "The lion of the Jurassic period.", pos: {x: -15, z: 15} }
        ];
    }

    initDinosaurs() {
        this.data.forEach((dino) => {
            // Placeholder: Box for Body, Cylinder for Neck/Head
            const group = new THREE.Group();
            
            // Dimensions derived from data
            const width = dino.length / 3; 
            const geometry = new THREE.BoxGeometry(width, dino.height, dino.length);
            const material = new THREE.MeshStandardMaterial({ color: dino.color });
            const mesh = new THREE.Mesh(geometry, material);
            
            // Adjust pivot so it stands on ground
            mesh.position.y = dino.height / 2;
            
            group.add(mesh);
            
            // Position in world
            group.position.set(dino.pos.x, dino.pos.y || 0, dino.pos.z);
            
            // Add metadata to the object for Raycasting
            group.userData = { info: dino };
            
            this.scene.add(group);
            this.dinoMeshes.push(group);
        });
    }

    initHumanRef() {
        // 1.8m Human Scale Reference
        const geo = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8); // 0.3 radius, 1.2 cylinder + 2*0.3 caps = 1.8m
        const mat = new THREE.MeshStandardMaterial({ color: 0xff00cc });
        const human = new THREE.Mesh(geo, mat);
        human.position.set(2, 0.9, 2);
        this.scene.add(human);
        
        // Label
        // (For simplicity in Three.js pure, we assume user knows pink capsule = human)
    }

    checkIntersection() {
        // Raycast from center of screen
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        const intersects = this.raycaster.intersectObjects(this.dinoMeshes, true);

        if (intersects.length > 0) {
            // Find the parent group which has the user data
            let object = intersects[0].object;
            while(object.parent && !object.userData.info) {
                object = object.parent;
            }

            if(object.userData.info) {
                this.uiManager.showInfo(object.userData.info);
            }
        } else {
            this.uiManager.hideInfo();
        }
    }

    // Function to move camera to specific dino
    travelTo(index) {
        const targetDino = this.dinoMeshes[index];
        const targetPos = targetDino.position.clone();
        
        // Offset so we don't teleport INSIDE the dino
        const offset = new THREE.Vector3(0, 2, 10); 
        // Simple logic: look at dino, move 10 units "back"
        const endPos = targetPos.clone().add(offset);

        // Animate Camera
        gsap.to(this.camera.position, {
            duration: 2,
            x: endPos.x,
            y: endPos.y,
            z: endPos.z,
            onUpdate: () => {
                this.camera.lookAt(targetPos);
            }
        });
    }
}