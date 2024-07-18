require("dotenv").config();
const { Telegraf } = require("telegraf");
const { OpenAI } = require("openai");

const telegramToken = process.env.TELEGRAM_TOKEN;
const openaiKey = process.env.OPENAI_KEY;

const openai = new OpenAI({
  apiKey: openaiKey,
});

const bot = new Telegraf(telegramToken);

bot.on("text", async (ctx) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: ctx.message.text }],
    });
    ctx.reply(response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
    ctx.reply("Sorry, something went wrong.");
  }
});

bot.launch().then(() => {
  console.log("Bot is running...");
});



