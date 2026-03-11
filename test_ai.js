require('dotenv').config();
const axios = require('axios');

async function testOpenRouter() {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
        console.error('No OpenRouter key found in .env');
        return;
    }
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "anthropic/claude-3.5-sonnet",
            messages: [{ role: "user", content: "Say hello and your name is Douglas." }]
        }, {
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('OpenRouter Response:', response.data.choices[0].message.content);
    } catch (error) {
        console.error('OpenRouter Test Failed:', error.response?.data || error.message);
    }
}

testOpenRouter();
