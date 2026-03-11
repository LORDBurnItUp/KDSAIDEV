/**
 * Voice Service
 * Handles Text-to-Speech (TTS) using ElevenLabs and Speech-to-Text (STT) using Deepgram
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEFAULT_VOICE_ID = 'JBF8D9H2eM7e9mRpyTXR'; // George (British)

/**
 * Transcribe audio using Deepgram
 * @param {Buffer} audioBuffer - Raw audio data
 * @param {string} contentType - Optional MIME type (auto-detected if not provided)
 */
async function transcribeAudio(audioBuffer, contentType) {
  if (!DEEPGRAM_API_KEY) {
    console.error('✗ Deepgram API key missing');
    return null;
  }

  try {
    // Deepgram auto-detects format if Content-Type is not set, but providing
    // a valid type helps with parsing. Default to null for auto-detection.
    const headers = {
      'Authorization': `Token ${DEEPGRAM_API_KEY}`
    };
    
    // Only set Content-Type if explicitly provided to ensure compatibility
    // with various audio formats (mp3, wav, ogg, webm, etc.)
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      audioBuffer,
      {
        headers,
        params: {
          smart_format: true,
          model: 'nova-2',
          language: 'en-US'
        }
      }
    );

    return response.data.results.channels[0].alternatives[0].transcript;
  } catch (error) {
    console.error('✗ Deepgram Error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Generate speech from text using ElevenLabs
 */
async function generateSpeech(text) {
  if (!ELEVENLABS_API_KEY) {
    console.error('✗ ElevenLabs API key missing');
    return null;
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const fileName = `voice_${crypto.randomUUID()}.mp3`;
    const filePath = path.join(tempDir, fileName);
    
    fs.writeFileSync(filePath, Buffer.from(response.data));
    return filePath;
  } catch (error) {
    console.error('✗ ElevenLabs Error:', error.response?.data?.toString() || error.message);
    return null;
  }
}

/**
 * Cleanup temporary audio files
 */
function cleanupVoice(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error cleaning up voice file:', err.message);
  }
}

module.exports = {
  transcribeAudio,
  generateSpeech,
  cleanupVoice
};
