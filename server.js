const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Set up whitelisted origins
const whitelist = ['https://ashwin-dishrecommender-system.netlify.app', 'http://localhost:3000'];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // specify the methods you want to allow
    credentials: true, // this allows session cookies to be sent with the request
};

// Apply CORS with the custom options
app.use(cors(corsOptions));

app.use(express.json());

// Add this root route to show a confirmation message when accessing the root URL
app.get('/', (req, res) => {
    res.send("Dish Recommender Backend Service is Running!");
});

app.post('/getIngredients', async (req, res) => {
    const dishName = req.body.dishName;

    try {
        const response = await axios.post('https://api.openai.com/v1/engines/gpt-3.5-turbo/completions', {
            messages: [
                {
                    role: "user",
                    content: `You are a culinary expert. You only know about dishes and their recipes. Provide a detailed list of ingredients traditionally used to make the dish ${dishName}. Give the responses as an ordered list, and do not provide any description about the dish or the ingredients.`
                }
            ],
            max_tokens: 350,
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const ingredients = response.data.choices[0].message.content.trim();
        res.json({ ingredients });

    } catch (error) {
        console.error("Error with OpenAI request:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to retrieve ingredients' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

