const { REST, Routes } = require('discord.js');
const config = require('./config.js');

const commands = [
  {
    name: 'toggle-applications',
    description: 'يفتح/يقفل التقديم (للمديرين)'
  },
  {
    name: 'set-embed-color',
    description: 'يغير لون الإيمبد (HEX)',
    options: [{ name: 'color', type: 3, description: 'لون HEX مثل #ff00aa', required: true }]
  },
  {
    name: 'set-embed-image',
    description: 'يغير صورة الإيمبد (رابط)',
    options: [{ name: 'url', type: 3, description: 'رابط الصورة', required: true }]
  },
  {
    name: 'repost-card',
    description: 'ينشر/يحدّث بطاقة التقديم في القناة المحددة بالكونفق'
  }
];

(async () => {
  try {
    const rest = new REST({ version: '10' }).setToken(config.token);
    console.log('Deploying slash commands…');
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );
    console.log('Commands deployed.');
  } catch (e) {
    console.error(e);
  }
})();
