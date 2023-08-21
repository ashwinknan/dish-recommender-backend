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
        const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
            prompt: `Provide a detailed list of ingredients traditionally used to make this dish: ${dishName}. Give the responses as an ordered list and don't include any inappropriate or offensive language, or obscene sexual references`,
            max_tokens: 250,
            temperature:0.2
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const ingredients = response.data.choices[0].text.trim();
        res.json({ ingredients });

    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve ingredients' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


