require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dinoRoutes = require('./routes/dinoRoutes');
const { seedDatabase } = require('./controllers/dinoController'); // Import for auto-run

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jurstatic_park')
    .then(async () => {
        console.log('InGen Mainframe Connected');
        
        // Check if DB is empty, if so, seed it automatically
        const Dinosaur = require('./models/Dinosaur');
        const count = await Dinosaur.countDocuments();
        if(count === 0) await seedDatabase(null, null);
    })
    .catch(err => console.error('Connection Failed:', err));

// Mount Routers
app.use('/api/dinosaurs', dinoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));