require('dotenv').config();
const express = require('express');
const cors = require('cors');
const telegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

const app = express();

app.use(express.json());
app.use(cors());

const token = process.env.BOT_TOKEN;
const bot = new telegramBot (token, {polling:true});
const { isAdmin, getEventMessage, getEventInlineKeyboard, getAdminKeyboard, getMainInlineKeyboard, CALLBACK_DATA } = require('./utils');


bot.setMyCommands([
  {command: '/start', description: 'Приветствие'},
  {command: '/events', description: 'Список мероприятий'},
])

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(chatId, 'Здравствуйте! \n Это бот района Yacht Party', {reply_markup: getMainInlineKeyboard()});
});

bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;

  await  bot.sendMessage(chatId, `Возможности администратора`, { reply_markup: getAdminKeyboard()});
});

bot.onText(/\/events/, async (msg) => {
  const chatId = msg.chat.id;
  const response = await fetch("https://yacht-backend.vercel.app/api/events/");
  if (response.ok) {
    const events = await response.json();
    events.map(async (event) => {
        await bot.sendPhoto(
          chatId,
          event.image,
          { caption: getEventMessage(event), reply_markup: getEventInlineKeyboard(event._id.toString(), isAdmin(chatId), event?.address?.latitude, event?.address?.longitude)}
        )
      })
      return ;
  } else {
    return bot.sendMessage(chatId, 'События не найдены');
  }
});

bot.on('message', async (msg) => {
  const { chat, contact = null, text, web_app_data } = msg;
  const { id: chatId } = chat;

  // if (contact) {
  //   const { phone_number, first_name, last_name, user_id } = contact;
  //   bot.sendMessage(chatId, `Вы отправили свой телефон ${phone_number}`);
  // }
  if (text == 'getId') {
    return bot.sendMessage(chatId, chatId);
  }
  if(web_app_data?.data) {
    try {
        const data = JSON.parse(web_app_data?.data)
        await bot.sendMessage(chatId, data?.message)
    } catch (e) {
      return bot.sendMessage(chatId, 'Ошибка бронирования');
    }
}
});



bot.on('callback_query', async (msg) => {
  const { data: callBackData, message } = msg;
  const { id: chatId } = message.chat;
  const tmp = callBackData.split(':');
  const data = tmp[0];

  switch (data) {
    case CALLBACK_DATA.showEvent.callback_data:
      const response = await fetch("https://yacht-backend.vercel.app/api/events/");
      if (response.ok) {
        const events = await response.json();
        events.map(async (event) => {
            await bot.sendPhoto(
              chatId,
              event.image,
              { caption: getEventMessage(event), reply_markup: getEventInlineKeyboard(event._id.toString(), isAdmin(chatId), event?.address?.latitude, event?.address?.longitude)}
            )
          })
          return ;
      } else {
        return bot.sendMessage(chatId, 'События не найдены');
      }
      break;
      case 'location':
        if (tmp[1] && tmp[2])
        return await bot.sendLocation(chatId, Number(tmp[1]), Number(tmp[2]));
      else
        return await bot.sendMessage(chatId, 'Не удалось загрузить координаты события');
      break;
  }
})

const PORT = process.env.PORT || 6969;

app.listen(PORT, () => console.log(`server running on port ${PORT}`));