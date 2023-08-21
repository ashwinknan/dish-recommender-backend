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
            prompt: `List the ingredients for the dish: ${dishName}`,
            max_tokens: 150
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


