require('dotenv').config();
const axios = require('axios');

async function testGroq() {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
        console.error('No Groq key found in .env');
        return;
    }
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3-70b-versatile",
            messages: [{ role: "user", content: "Say hello and your name is Douglas." }]
        }, {
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Groq Response:', response.data.choices[0].message.content);
    } catch (error) {
        console.error('Groq Test Failed:', error.response?.data || error.message);
    }
}

testGroq();
