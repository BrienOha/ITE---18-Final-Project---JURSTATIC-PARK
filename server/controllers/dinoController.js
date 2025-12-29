const Dinosaur = require('../models/Dinosaur');

// @desc    Get all biological assets
// @route   GET /api/dinosaurs
exports.getDinosaurs = async (req, res) => {
    try {
        // 1. Get data from DB
        const dinos = await Dinosaur.find();
        
        // 2. Send it EXACTLY as is (No manual mapping!)
        res.status(200).json({
            success: true,
            count: dinos.length,
            data: dinos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Seed Database with initial Data
// @route   POST /api/dinosaurs/seed
exports.seedDatabase = async (req, res) => {
    try {
        await Dinosaur.deleteMany(); // Clear existing
        
        // PASTE YOUR EXISTING ARRAY FROM DinosaurManager.js HERE
        // But map the keys to match the Mongoose Schema (e.g. pos -> position)
        const initialData = [
            { 
                name: "T-Rex", sciName: "Tyrannosaurus rex",
                height: 5, length: 12, diet: "Carnivore",
                desc: "The King of Dinosaurs. Extremely powerful bite force.", 
                pos: {x: 0, y: 0, z: -30}, rot: Math.PI / 6, scale: 0.02, 
                model: "/models/T-Rex/trex.gltf"
            },
            { 
                name: "Velociraptor", sciName: "Velociraptor mongoliensis",
                height: 1.8, length: 3, diet: "Carnivore",
                desc: "Highly intelligent pack hunters. Watch the tall grass.", 
                pos: {x: 8, y: 1.5, z: -15}, rot: -Math.PI / 4, scale: 0.05, 
                model: "/models/Velociraptor/velociraptor.gltf", 
                textureConfig: {map: "Material_36_baseColor.jpeg"}
            },
            { 
                name: "Triceratops", sciName: "Triceratops horridus",
                height: 3, length: 9, diet: "Herbivore",
                desc: "Herbivore with three horns and a large frill.", 
                pos: {x:-25, y : 1, z : -20}, rot: Math.PI / 2, scale : 2, 
                model : "/models/Triceratops/triceratops.gltf" 
            },
            { 
                name: "Spinosaurus", sciName: "Spinosaurus aegyptiacus",
                height :7 , length :15, diet: "Piscivore",
                desc :"Largest carnivorous dinosaur, semi-aquatic with a sail.", 
                pos :{ x :30 , y :0 , z :-40 }, rot: -Math.PI / 6, scale :0.12, 
                model:"/models/Spinosaurus/spinosaurus.gltf" 
            },
            { 
                name: "Carnotaurus", sciName: "Carnotaurus sastrei",
                height :3.5 , length :8, diet: "Carnivore",
                desc :"Fast predator with bull-like horns above eyes.", 
                pos:{ x :-30 , y :1 , z :-10 }, rot: Math.PI, scale :0.8, 
                model:"/models/Carnotaurus/carnotaurus.gltf" 
            },
            { 
                name: "Brachiosaurus", sciName: "Brachiosaurus altithorax",
                height: 15, length: 26, diet: "Herbivore",
                desc: "Gentle giant. One of the tallest dinosaurs.", 
                pos: {x: 0, z: -60}, rot: 0, scale: 1.8, 
                model: "/models/Brachiosaurus/brachiosaurus.gltf" 
            },
            { 
                name: "Pterodactyl", sciName: "Pterodactylus antiquus",
                height: 1, length: 2, diet: "Carnivore",
                desc: "Flying reptile. Not technically a dinosaur.", 
                pos: {x: 15, z: -5, y: 30}, rot: Math.PI / 3, scale: 0.0005, 
                model: "/models/Pterodactyl/pterodactyl.gltf" 
            },
            { 
                name: "Giganotosaurus", sciName: "Giganotosaurus carolinii",
                height: 6.5, length: 13, diet: "Carnivore",
                desc: "Larger than T-Rex.", 
                pos: {x: 25, y:0, z: 0}, rot: Math.PI / 1.5, scale: 1.5,
                model: "/models/Giganotosaurus/giganotosaurus.gltf" 
            },
            { 
                name: "Allosaurus", sciName: "Allosaurus fragilis",
                height: 4, length: 10, diet: "Carnivore",
                desc: "The lion of the Jurassic period.", 
                pos: {x: -15, y: 1,z: 15}, rot: Math.PI / 4, scale: 1.2, 
                model: "/models/Allosaurus/allosaurus.gltf" 
            },
            { 
                name: "Argentinosaurus", sciName: "Argentinosaurus huinculensis",
                height: 21, length: 35, diet: "Herbivore",
                desc: "One of the largest land animals to ever exist.", 
                pos: {x: -40, y: 0, z: 30}, rot: Math.PI / 4, scale: 800, 
                model: "/models/Argentinosaurus/argentinosaurus.gltf" 
            },
            { 
                name: "Ankylosaurus", sciName: "Ankylosaurus magniventris",
                height: 2.5, length: 8, diet: "Herbivore",
                desc: "Living tank with a heavy tail club for defense.", 
                pos: {x: -10, y: 0, z: 45}, rot: Math.PI, scale: 0.1, 
                model: "/models/Ankylosaurus/ankylosaurus.gltf" 
            },
            { 
                name: "Parasaurolophus", sciName: "Parasaurolophus walkeri",
                height: 4, length: 10, diet: "Herbivore",
                desc: "Known for its large cranial crest used for communication.", 
                pos: {x: 45, y: 0, z: 20}, rot: Math.PI / 1.2, scale: 0.1, 
                model: "/models/Parasaurolophus/parasaurolophus.gltf" 
            },
            { 
                name: "Albertosaurus", sciName: "Albertosaurus sarcophagus",
                height: 3.2, length: 9, diet: "Carnivore",
                desc: "A smaller, faster relative of the T-Rex.", 
                pos: {x: -50, y: 0, z: 0}, rot: Math.PI / 3, scale: 0.1, 
                model: "/models/Albertosaurus/albertosaurus.gltf" 
            },
            { 
                name: "Carcharodontosaurus", sciName: "Carcharodontosaurus saharicus",
                height: 6, length: 13, diet: "Carnivore",
                desc: "The 'Shark-Toothed Lizard'. Massive land predator.", 
                pos: {x: 10, y: 0, z: 60}, rot: -Math.PI / 1.5, scale: 0.1, 
                model: "/models/Carcharodontosaurus/carcharodontosaurus.gltf" 
            },
            { 
                name: "Stegosaurus", sciName: "Stegosaurus stenops",
                height: 4, length: 9, diet: "Herbivore",
                desc: "A large armored dinosaur known for the kite-shaped plates on its back and spikes on its tail.", 
                pos: {x: 60, y: 0, z: 10}, rot: Math.PI / 1.5, scale: 0.12, 
                model: "/models/Stegosaurus/stegosaurus.gltf" 
            }
        ];

        await Dinosaur.insertMany(initialData);
        res.status(201).json({ success: true, message: "Database Seeded" });
    }  catch (error) {
        console.error("Seed Error:", error); // Log the actual error
        if (res) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};