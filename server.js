const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

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
        res.status(500).json({ error: 'Failed to retrieve ingredients' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
