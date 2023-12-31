require('dotenv').config();

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
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
    credentials: true, 
};

// Apply CORS with the custom options
app.use(cors(corsOptions));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send("Dish Recommender Backend Service is Running!");
});

app.post('/getIngredients', async (req, res) => {
    const dishName = req.body.dishName;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a culinary expert. You only know about dishes, their ingredients and their recipes."
                },
                {
                    role: "user",
                    content: `Provide an exhaustive list of ingredients traditionally used to make the dish ${dishName}. Give the ingredients as a continuous list separated by commas. No introductory paragraph or no descriptions of ingredients please - just a list of ingredients separated by commas`
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

app.post('/getRecipe', async (req, res) => {
    const dishName = req.body.dishName;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a culinary expert. You only know about dishes, their ingredients and their recipes."
                },
                {
                    role: "user",
                    content: `Provide a step-by-step recipe to prepare 4 servings of the dish ${dishName}. This should be in the form of a numbered list.`
                }
            ],
            max_tokens: 1000,  // Increased tokens to ensure entire recipe is captured
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const recipe = response.data.choices[0].message.content.trim();
        res.json({ recipe });

    } catch (error) {
        console.error("Error with OpenAI request:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to retrieve recipe' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
