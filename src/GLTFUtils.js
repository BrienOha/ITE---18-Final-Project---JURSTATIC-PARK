// Utility to load GLTF models using Three.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function loadGLTFModel(url, onLoad, onError) {
    const loader = new GLTFLoader();
    loader.load(
        url,
        (gltf) => {
            onLoad(gltf.scene);
        },
        undefined,
        (error) => {
            if (onError) onError(error);
            else console.error('GLTF load error:', error);
        }
    );
}
