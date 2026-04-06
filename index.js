const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');

const fs = require('fs');
const path = require('path');
const config = require('./config');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// تحميل البيانات
let applications = {};
if (fs.existsSync(config.stateFile)) {
  applications = JSON.parse(fs.readFileSync(config.stateFile, 'utf8'));
}

function saveData() {
  fs.writeFileSync(config.stateFile, JSON.stringify(applications, null, 2));
}

// تشغيل البوت
client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // 📢 روم زر التقديم
  const channel = await client.channels.fetch(config.applyChannelId);

  const embed = new EmbedBuilder()
    .setTitle(config.embed.title)
    .setDescription(config.embed.description)
    .setColor(config.colors.pending)
    .setThumbnail('attachment://zone1.png')
    .setImage('attachment://zone2.png');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('apply_button')
      .setLabel(config.buttons.apply_label)
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('status')
      .setLabel(config.buttons.status_label)
      .setStyle(ButtonStyle.Secondary)
  );

  await channel.send({
    embeds: [embed],
    components: [row],
    files: [
      { attachment: path.join(__dirname, 'images', 'zone1.png'), name: 'zone1.png' },
      { attachment: path.join(__dirname, 'images', 'zone2.png'), name: 'zone2.png' }
    ]
  });
});

// التفاعلات
client.on(Events.InteractionCreate, async interaction => {
  try {

    // زر التقديم
    if (interaction.isButton() && interaction.customId === 'apply_button') {
      const userId = interaction.user.id;

      if (applications[userId] && applications[userId].status === "accepted") {
        return interaction.reply({
          content: "❌ انت مقبول بالفعل وما تقدر تقدم مرة ثانية",
          ephemeral: true
        });
      }

      const modal = new ModalBuilder()
        .setCustomId('apply_modal')
        .setTitle('نموذج التقديم');

      config.form.forEach(q => {
        const input = new TextInputBuilder()
          .setCustomId(q.id)
          .setLabel(q.label)
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(q.required)
          .setMaxLength(q.max || 400);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
      });

      await interaction.showModal(modal);
    }

    // ارسال النموذج
    if (interaction.isModalSubmit() && interaction.customId === 'apply_modal') {
      const userId = interaction.user.id;
      const today = new Date().toDateString();

      if (!applications[userId] || applications[userId].date !== today) {
        applications[userId] = { count: 0, date: today, status: "none" };
      }

      if (applications[userId].count >= config.dailyLimit) {
        return interaction.reply({ content: "❌ وصلت الحد اليومي", ephemeral: true });
      }

      applications[userId].count++;
      applications[userId].status = "pending";
      saveData();

      let description = '';
      config.form.forEach(q => {
        const answer = interaction.fields.getTextInputValue(q.id);
        description += `**${q.label}**\n${answer}\n\n`;
      });

      const embed = new EmbedBuilder()
        .setColor(config.colors.pending)
        .setTitle(`طلب جديد على ${config.application.positionName}`)
        .setDescription(description)
        .addFields({ name: '👤 صاحب الطلب', value: `<@${userId}>` });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('accept').setLabel('قبول ✅').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('reject').setLabel('رفض ❌').setStyle(ButtonStyle.Danger)
      );

      // 📩 روم التقديمات
      const channel = await client.channels.fetch(config.applicationChannelId);
      await channel.send({ embeds: [embed], components: [row] });

      await interaction.reply({ content: "✅ تم إرسال طلبك", ephemeral: true });
    }

    // زر الحالة
    if (interaction.isButton() && interaction.customId === 'status') {
      const data = applications[interaction.user.id];

      if (!data) {
        return interaction.reply({ content: "❌ ما عندك تقديم", ephemeral: true });
      }

      let text = "⏳ Pending";
      if (data.status === "accepted") text = "✅ Accepted";
      if (data.status === "rejected") text = "❌ Rejected";

      return interaction.reply({ content: `📊 حالتك: ${text}`, ephemeral: true });
    }

    // قبول
    if (interaction.isButton() && interaction.customId === 'accept') {
      if (!interaction.member.roles.cache.has(config.reviewerRoleId)) {
        return interaction.reply({ content: "❌ ما عندك صلاحية", ephemeral: true });
      }

      const embed = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(config.colors.accepted)
        .setFooter({ text: `✅ تم القبول بواسطة ${interaction.user.tag}` });

      await interaction.update({ embeds: [embed], components: [] });

      const userId = interaction.message.embeds[0].fields[0].value.replace(/[<@>]/g, '');

      applications[userId].status = "accepted";
      saveData();

      const member = await interaction.guild.members.fetch(userId);
      await member.roles.add(config.acceptRoleId);

      const user = await client.users.fetch(userId);
      user.send(config.dmMessages.accepted);
    }

    // رفض
    if (interaction.isButton() && interaction.customId === 'reject') {
      if (!interaction.member.roles.cache.has(config.reviewerRoleId)) {
        return interaction.reply({ content: "❌ ما عندك صلاحية", ephemeral: true });
      }

      const modal = new ModalBuilder()
        .setCustomId(`reject_${interaction.message.id}`)
        .setTitle('سبب الرفض');

      const input = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('اكتب السبب')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    }

    // تنفيذ الرفض
    if (interaction.isModalSubmit() && interaction.customId.startsWith('reject_')) {
      const reason = interaction.fields.getTextInputValue('reason');
      const msgId = interaction.customId.replace('reject_', '');

      const channel = await client.channels.fetch(config.applicationChannelId);
      const message = await channel.messages.fetch(msgId);

      const embed = EmbedBuilder.from(message.embeds[0])
        .setColor(config.colors.rejected)
        .setFooter({ text: `❌ تم الرفض بواسطة ${interaction.user.tag}` })
        .addFields({ name: 'السبب', value: reason });

      await message.edit({ embeds: [embed], components: [] });

      const userId = message.embeds[0].fields[0].value.replace(/[<@>]/g, '');

      applications[userId].status = "rejected";
      saveData();

      const user = await client.users.fetch(userId);
      user.send(`${config.dmMessages.rejected}\nالسبب: ${reason}`);

      await interaction.reply({ content: "✅ تم الرفض", ephemeral: true });
    }

  } catch (err) {
    console.error(err);
  }
});

client.login(config.token);