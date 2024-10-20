// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5001;

app.use(cors());

app.get('/api/hospitals', async (req, res) => {
    const { lat, lng } = req.query;
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!googleMapsApiKey) {
        console.error('Google Maps API key is not defined');
        return res.status(500).json({ error: 'Google Maps API key is missing' });
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
                location: `${lat},${lng}`,
                radius: 5000,
                type: 'hospital',
                key: googleMapsApiKey,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching hospitals:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch hospitals' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});