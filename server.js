require("dotenv").config();
const { Telegraf } = require("telegraf");
const { OpenAI } = require("openai");
const http = require("http");

const telegramToken = process.env.TELEGRAM_TOKEN;
const openaiKey = process.env.OPENAI_KEY;

const openai = new OpenAI({
  apiKey: openaiKey,
});

const bot = new Telegraf(telegramToken);

// Словарь для хранения контекста сообщений пользователей
const userContexts = {};

bot.on("text", async (ctx) => {
  const userId = ctx.message.from.id;
  const userMessage = ctx.message.text;

  // Если у пользователя еще нет контекста, создаем его
  if (!userContexts[userId]) {
    userContexts[userId] = [];
  }

  // Добавляем новое сообщение пользователя в контекст
  userContexts[userId].push({ role: "user", content: userMessage });

  try {
    // Создаем запрос к OpenAI с учетом контекста
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: userContexts[userId],
    });

    const botReply = response.choices[0].message.content;

    // Добавляем ответ бота в контекст
    userContexts[userId].push({ role: "assistant", content: botReply });

    ctx.reply(botReply);
  } catch (error) {
    console.error("Error:", error);
    ctx.reply("Sorry, something went wrong.");
  }
});

bot.launch().then(() => {
  console.log("Bot is running...");
});

// Добавляем простой HTTP-сервер
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, this is a placeholder server!\n");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
