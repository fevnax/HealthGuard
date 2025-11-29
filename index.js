import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

dotenv.config();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static("public"));

app.set('view engine', 'ejs');

let airCache = null;
let lastFetch = 0;
const TTL = 5 * 60 * 1000; // 5 minutes

async function fetchAirData() {
    const now = Date.now();

    // Basic cache (forward-looking and eco-friendly)
    if (airCache && now - lastFetch < TTL) {
        return airCache;
    }

    const AQIUrl = 'https://api.waqi.info/feed/city/?token=420ac4061a0f20dd3b2b0f2e538d132ec154af1b';

    const response = await axios.get(AQIUrl);
    airCache = response.data;
    lastFetch = now;

    return airCache;
}

app.get('/', async (req, res) => {
    try {
        const data = await fetchAirData();
        res.render('index', { air: data });
    } catch (err) {
        console.error('API fetch failed:', err.message);
        res.status(500).send('Failed to load air quality data');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});