/**
 * Discord Service
 * Handles Discord bot interaction, webhooks, and AI chat listeners
 */

const { Client, Intents, MessageEmbed, Events } = require('discord.js');
const axios = require('axios');
const openclawService = require('./openclaw');
const voiceService = require('./voice');
const { AttachmentBuilder } = require('discord.js');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

let client = null;
let isReady = false;

/**
 * Initialize Discord bot client
 */
async function initialize() {
  if (!DISCORD_TOKEN) {
    console.log('⚠️ Skipping Discord Bot initialization: DISCORD_TOKEN not set.');
    console.log('💡 Outgoing notifications will use Webhook if provided.');
    
    // Send a startup message via webhook if possible
    if (DISCORD_WEBHOOK_URL) {
      sendWebhook('🚀 SWAGCLAW Webhook Active. Waiting for Bot Token to enable interactive chat.');
    }
    return;
  }

  try {
    client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES
      ],
      partials: ['CHANNEL', 'MESSAGE'],
    });

    client.once('ready', async () => {
      isReady = true;
      console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
      
      // Send startup message to channel
      if (DISCORD_CHANNEL_ID) {
        sendMessage('🚀 SWAGCLAW is now online and connected to VOXCODE via Bot Agent!');
      }

      // DM the admin on startup (DISCORD_ADMIN_ID must be YOUR user ID, not the bot's)
      const ADMIN_ID = process.env.DISCORD_ADMIN_ID;
      if (ADMIN_ID && ADMIN_ID !== client.user.id) {
        try {
          const user = await client.users.fetch(ADMIN_ID);
          await user.send('👋 Hey! **SWAGCLAW** (Douglas) is online and ready for commands.');
          console.log(`✓ Startup DM sent to ${user.tag}`);
        } catch (err) {
          console.warn(`⚠ Could not DM admin (${ADMIN_ID}): ${err.message}`);
        }
      } else if (ADMIN_ID === client.user.id) {
        console.warn('⚠ DISCORD_ADMIN_ID is set to the bot\'s own ID — set it to your personal Discord user ID instead.');
      }
    });

    client.on('error', (err) => {
      console.error('Discord Client Error:', err.message);
    });

    // Handle messages (The Chat Thing)
    client.on('messageCreate', async (message) => {
      if (message.author.bot) return;

      // Check if bot is mentioned or if it's a DM
      const isMentioned = message.mentions.has(client.user.id);
      const isDM = !message.guild;

      console.log(`📨 Message from ${message.author.tag} | mentioned: ${isMentioned} | DM: ${isDM} | content: "${message.content.substring(0, 60)}"`);

      if (isMentioned || isDM) {
        message.channel.sendTyping();
        
        // Clean the message content (remove mention)
        let cleanContent = message.content.replace(`<@!${client.user.id}>`, '').replace(`<@${client.user.id}>`, '').trim();
        
        // Handle Audio Attachments (STT)
        const audioAttachment = message.attachments.find(a => a.contentType?.startsWith('audio/') || a.name.endsWith('.mp3') || a.name.endsWith('.wav') || a.name.endsWith('.ogg'));
        if (audioAttachment) {
          try {
            // Validate URL is from Discord CDN before fetching - use proper URL parsing
            const url = audioAttachment.url;
            const size = audioAttachment.size;
            
            // Validate file size before downloading (10MB limit)
            if (size > 10 * 1024 * 1024) {
              console.warn('⚠ Audio file too large:', size, 'bytes');
              await message.reply('⚠ Audio file too large (max 10MB). Please upload a smaller file.');
              return;
            }
            
            if (!url) {
              console.warn('⚠ Invalid audio URL');
              return;
            }
            let urlObj;
            try {
              urlObj = new URL(url);
            } catch (e) {
              console.warn('⚠ Invalid audio URL format');
              return;
            }
            const validHosts = ['cdn.discordapp.com', 'discord.com', 'media.discordapp.net'];
            const isValidHost = validHosts.includes(urlObj.hostname);
            if (!isValidHost) {
              console.warn('⚠ Invalid audio URL source - not from Discord CDN');
              return;
            }
            console.log(`🎤 Processing audio message from ${message.author.tag}...`);
            const audioResponse = await axios.get(url, { 
              responseType: 'arraybuffer',
              maxContentLength: 10 * 1024 * 1024, // 10MB limit
              maxBodyLength: 10 * 1024 * 1024
            });
            const transcription = await voiceService.transcribeAudio(Buffer.from(audioResponse.data));
            if (transcription) {
              console.log(`📝 Transcription: "${transcription}"`);
              cleanContent = `${cleanContent} ${transcription}`.trim();
            }
          } catch (err) {
            console.error('✗ STT Failed:', err.message);
          }
        }

        if (!cleanContent && !audioAttachment) return;

        // Process thru OpenClaw AI with timeout protection
        let response;
        try {
          response = await Promise.race([
            openclawService.processCommand(cleanContent),
            new Promise((_, reject) => setTimeout(() => reject(new Error('AI processing timeout (25s)')), 25000))
          ]);
        } catch (err) {
          console.error('✗ OpenClaw Error:', err.message);
          response = '⏱️ Request timed out. Please try again.';
        }
        
        // Generate Voice Response (ElevenLabs)
        let voicePath = null;
        if (process.env.ELEVENLABS_API_KEY) {
           // Use a truncated version for voice if the response is very long
           const voiceText = response.length > 500 ? response.substring(0, 500) + '...' : response;
           voicePath = await voiceService.generateSpeech(voiceText);
        }

        // Send response
        if (voicePath) {
          const attachment = new AttachmentBuilder(voicePath, { name: 'swagclaw_voice.mp3' });
          await message.reply({ 
            content: response,
            files: [attachment]
          });
          voiceService.cleanupVoice(voicePath);
        } else {
          await message.reply(response);
        }
      }
    });

    await client.login(DISCORD_TOKEN);
    return true;
  } catch (error) {
    if (error.message.includes('Used disallowed intents')) {
      console.error('✗ Discord Error: Disallowed Intents.');
      console.error('👉 ACTION REQUIRED: Go to Discord Developer Portal > Your App > Bot');
      console.error('👉 Enable "MESSAGE CONTENT INTENT" and "SERVER MEMBERS INTENT".');
    } else {
      console.error('✗ Failed to initialize Discord client:', error.message);
    }
    return false;
  }
}

/**
 * Send a message via Discord Bot (preferred) or Webhook (fallback)
 */
async function sendMessage(message) {
  // If bot is ready, use bot to send message
  if (isReady && client && DISCORD_CHANNEL_ID) {
    try {
      const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
      if (channel) {
        // Handle Forum/Thread channels vs typical Text channels
        if (typeof channel.send === 'function') {
          await channel.send(message);
          return true;
        } else if (channel.isThreadOnly) {
          // Forum channel - requires a thread
          await channel.threads.create({
            name: 'SWAGCLAW Notification',
            message: { content: message },
          });
          return true;
        }
      }
    } catch (error) {
      console.error('Error sending Bot message:', error.message);
    }
  }

  // Fallback to Webhook
  if (DISCORD_WEBHOOK_URL) {
    return sendWebhook(message);
  }

  console.log('Cannot send message: No Bot session or Webhook configured');
  return false;
}

/**
 * Send a message via Webhook
 */
async function sendWebhook(message) {
  try {
    await axios.post(DISCORD_WEBHOOK_URL, {
      content: message,
      username: 'SWAGCLAW',
      avatar_url: process.env.DISCORD_AVATAR_URL || 'https://raw.githubusercontent.com/LORDBurnItUp/FRPaiUnlocks/main/assets/logo.png'
    });
    return true;
  } catch (error) {
    console.error('Webhook Error:', error.response?.data || error.message);
    return false;
  }
}

module.exports = {
  initialize,
  sendMessage,
  sendWebhook,
  isReady: () => isReady,
  getClient: () => client
};
