require("dotenv").config();
const { Telegraf } = require("telegraf");
const { Configuration, OpenAIApi } = require("openai");

const telegramToken = process.env.TELEGRAM_TOKEN;
const openaiKey = process.env.OPENAI_KEY;

const configuration = new Configuration({
  apiKey: openaiKey,
});
const openai = new OpenAIApi(configuration);

const bot = new Telegraf(telegramToken);

bot.on("text", async (ctx) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: ctx.message.text }],
    });
    ctx.reply(response.data.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
    ctx.reply("Sorry, something went wrong.");
  }
});

bot.launch().then(() => {
  console.log("Bot is running...");
});


