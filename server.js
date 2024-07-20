require("dotenv").config();
const { Telegraf } = require("telegraf");
const { OpenAI } = require("openai");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const telegramToken = process.env.TELEGRAM_TOKEN;
const openaiKey = process.env.OPENAI_KEY;

const openai = new OpenAI({
  apiKey: openaiKey,
});

const bot = new Telegraf(telegramToken);

let conversationHistory = {};

bot.on("text", async (ctx) => {
  const chatId = ctx.message.chat.id;
  
  // Initialize conversation history if not present
  if (!conversationHistory[chatId]) {
    conversationHistory[chatId] = [];
  }

  // Add user's message to the conversation history
  conversationHistory[chatId].push({ role: "user", content: ctx.message.text });

  // Maintain a maximum length of conversation history to avoid excessive token usage
  if (conversationHistory[chatId].length > 10) {
    conversationHistory[chatId].shift(); // Remove the oldest message to maintain the size
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversationHistory[chatId],
    });

    const botReply = response.choices[0].message.content;

    // Add the bot's reply to the conversation history
    conversationHistory[chatId].push({ role: "assistant", content: botReply });

    ctx.reply(botReply);
  } catch (error) {
    console.error("Error:", error);
    ctx.reply("Sorry, something went wrong.");
  }
});

// Start Telegraf bot
bot.launch().then(() => {
  console.log("Bot is running...");
});

// Use Express to ensure the server is listening on port 3000
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
