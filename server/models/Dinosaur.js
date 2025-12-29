const mongoose = require('mongoose');

const DinosaurSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sciName: { type: String, required: true },
    height: { type: Number, required: true },
    length: { type: Number, required: true },
    diet: { type: String, required: true },
    desc: { type: String, required: true },
    model: { type: String, required: true },
    scale: { type: Number, default: 1 },

    // --- CHANGE THIS LINE ONLY ---
    // Old: pos: { x: Number... }
    // New:
    pos: Object, 
    // -----------------------------

    rot: { type: Number, default: 0 },
    textureConfig: { type: Map, of: String }
});

module.exports = mongoose.model('Dinosaur', DinosaurSchema);