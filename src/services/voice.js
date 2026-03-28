const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');

// Load env explicitly if needed, assuming the MCP server will load it.
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

// Using a standard, authoritative, futuristic default voice available publicly or built-in, like Adam or a custom one if available.
const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Adam

/**
 * Text-to-Speech via ElevenLabs
 * Generates an MP3 and uses VBScript to play it out loud on Windows.
 */
async function speak(text, voiceId = DEFAULT_VOICE_ID) {
    if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is missing in .env");

    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
    
    // Make the TTS request
    const response = await axios.post(
        endpoint,
        {
            text: text,
            model_id: "eleven_turbo_v2_5",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
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

    // Save the audio file in the Listening folder
    const listenDir = path.resolve(process.cwd(), 'Listening');
    if (!fs.existsSync(listenDir)) fs.mkdirSync(listenDir, { recursive: true });
    
    const tmpPath = path.join(listenDir, `voice_msg_${crypto.randomBytes(4).toString('hex')}.mp3`);
    fs.writeFileSync(tmpPath, response.data);

    // Create a VBS script to play the audio silently via Windows Media Player
    const vbsPath = path.join(__dirname, 'play_audio.vbs');
    if (!fs.existsSync(vbsPath)) {
        fs.writeFileSync(vbsPath, `
Set Sound = CreateObject("WMPlayer.OCX.7")
Sound.URL = WScript.Arguments(0)
Sound.Controls.play
WScript.Sleep 500
Do While Sound.PlayState = 3
  WScript.Sleep 100
Loop
        `.trim());
    }

    // Play the audio
    return new Promise((resolve, reject) => {
        exec(`cscript //nologo "${vbsPath}" "${tmpPath}"`, (error) => {
            if (error) {
                console.error("Playback error:", error);
                // Even if playback fails, return the path so the agent knows it generated
            }
            resolve(tmpPath);
        });
    });
}

/**
 * Speech-to-Text via Deepgram
 * Transcribes audio files (from the Listening folder) into text.
 */
async function transcribe(filePath) {
    if (!DEEPGRAM_API_KEY) throw new Error("DEEPGRAM_API_KEY is missing in .env");
    if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

    const audioData = fs.readFileSync(filePath);

    const response = await axios.post(
        'https://api.deepgram.com/v1/listen?smart_format=true&model=nova-2&language=en-US',
        audioData,
        {
            headers: {
                'Authorization': `Token ${DEEPGRAM_API_KEY}`,
                // We let Deepgram auto-detect mimetype
                'Content-Type': 'audio/wav' 
            }
        }
    );

    const transcript = response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    return transcript;
}

/**
 * Clean up a temporary voice file after sending
 * @param {string} filePath - Path to the audio file to delete
 */
async function cleanupVoice(filePath) {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.warn('⚠ Could not clean up voice file:', err.message);
    }
}

module.exports = { speak, transcribe, cleanupVoice };
