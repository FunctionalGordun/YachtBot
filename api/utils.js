require('dotenv').config();

const CALLBACK_DATA = {
  showEvent: {
    title: "Посмотреть события",
    callback_data: 'events',
  },

  yachts: {
    title: "Яхты",
    callback_data: 'yachts',
  },

}

const isAdmin = (id) => {
  return process.env.ADMINS_ID.includes(id);
}

const getEventMessage = ({title, date, description, price, capacity}) => {
  return `${title}
  ${description}
  ${price}`
}

const getMainInlineKeyboard = () => {
  const inline_keyboard = [
    [{ text: CALLBACK_DATA.showEvent.title, callback_data: CALLBACK_DATA.showEvent.callback_data }],
    // [{ text: CALLBACK_DATA.yachts.title, callback_data: CALLBACK_DATA.yachts.callback_data }],
  ];
  return { inline_keyboard };
}

const getEventInlineKeyboard = (id, isAdmin, lat, log) => {
   const inline_keyboard = [
    [{ text: 'Забронировать', web_app: {url: `${process.env.WEB_APP_URL}/booking/?eventId=${id}`} }],
    [{ text: 'Как добраться?', callback_data: `location:${lat}:${log}` }],
  ]
    if (isAdmin) {
      inline_keyboard.push([{ text: 'Посетители',  web_app: {url: `${process.env.WEB_APP_URL}/visitors/?eventId=${id}`} }]);
      inline_keyboard.push([{ text: 'Редактировать',  web_app: {url: `${process.env.WEB_APP_URL}/booking/?eventId=${id}`} }]);
  }
  return { inline_keyboard }
}

const getAdminKeyboard = () => {
  const inline_keyboard = [
   [{ text: 'События', web_app: {url: `${process.env.WEB_APP_URL}/booking/`} }],
   [{ text: 'Клиенты', web_app: {url: `${process.env.WEB_APP_URL}/booking/`} }],
 ]
 return { inline_keyboard }
}

module.exports = { isAdmin, getEventMessage, getEventInlineKeyboard, getAdminKeyboard, getMainInlineKeyboard, CALLBACK_DATA  };