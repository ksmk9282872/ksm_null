const { Client, Intents } = require('discord.js-selfbot-v13');
const express = require('express');

const tokens = ["كسم توكنك", "كسم الثاني"];
const targets = [{ userId: "كسخت القحبة الاول" }, { userId: "كسخت الثاني" }];
const startMessageId = "كسم ايدي الرسالة";
const targetChannels = ["كسم الروم", "كسم ثاني روم"];

const randomReplies = [...new Set([
  "شنقمك", "دعسمك", "اكسرمك", "اشقمك", "ارفسمك", "اسرطمك", "غدرمك", "نيجمك", "عصرمك",
  "طحنمك", "خلطمك", "بعصمك", "فلقمك", "قتلمك", "قطعمك", "شطرمك", "عجنمك", "دهسمك",
  "ظرفمك", "شويمك", "حرقمك", "نيكمك", "كسمك", "كسعرضك", "فتحمك", "ركلمك", "خطفمك",
  "نكحمك", "جلدمك", "خبطمك", "يبن القحبة", "ضربمك", "عفطمك", "ربطمك", "زرفمك", "شلعمك",
  "نيجختك", "كسختك", "انيكمك", "هردمك", "نفيمك", "صعقمك", "دعسكسمك", "نحرمك", "سلخمك",
  "هرسمك", "جلدختك", "نطحمك", "نتحمك", "افجرمك", "سحقمك", "صرعمك", "نسخمك", "قشعمك",
  "هروبمك", "اقودمك", "كس امك", "نفخمك", "قمعمك", "موتمك", "وفاتمك", "يبن الشرموطة",
  "دفنمك", "لطشمك", "لهبمك", "خرقمك", "اغتصبمك", "انيكختك", "يبن القحاب", "سخطمك", "لعنمك", "فرشمك"
])];

const specialWords = [
  "نقطة", "نقط", "نقطه", "نوقطا", "ن..قط", "ن قط", "نق ط", "بروجكت", "بروجيكت",
  "البروجكت", "يبن البروجكت", "يبن الروبوت", "يبن الروبوتة"
];

const specialReplies = [
  "كسمك.", "كسختك.", "حرقمك.", "قتلمك.", "شفطمك.", "عصرمك.", "ركلمك.", "خطفمك.",
  "فتحمك.", "عجنمك.", "نيجمك.", "سحقمك.", "شلعمك.", "افترسمك.", "انهشمك.", "اشقمك.",
  "رفسمك.", "غدرمك."
];

const screenshotReplies = ["اسكرن كسمك", "سكرين بطبونمك"];
const streamReplies = ["ستريم بحتشونمك", "ستريم بكسختك"];
const laughing = ["هه", "هخخ", "هههههه", "ههه", "هههه", "هههخهه"];

const offensivePatterns = [/امك.*قحبة/, /قحبة.*نقط/, /نقط.*قحبة/, /امك.نقط/];
const imagePatterns = [/^صور$/, /^صورة$/];
const screenshotPatterns = [/سكرن/, /سكرين/];
const streamPatterns = [/ستريم/, /بث/];

function normalize(text) {
  return text.replace(/[^؀-ۿa-zA-Z0-9]/g, '').toLowerCase();
}

function includesSpecial(content) {
  const flat = normalize(content);
  return specialWords.findIndex(word => flat.includes(normalize(word)));
}

let lastReply = null;

function extractTrigger(content) {
  const flat = normalize(content);
  const fuzzy = ["ن", "ق", "ط", "ة"];
  let score = fuzzy.reduce((a, ch) => flat.includes(ch) ? a + 1 : a, 0);
  if (score >= 3) return ".";
  const syms = ["-", ".", ",", "", "#", "", ")"];
  for (let ch of syms) if (content.includes(ch)) return ch;
  return null;
}

function getRandomReply() {
  const reply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
  return reply === lastReply ? getRandomReply() : reply;
}

function buildReply(content) {
  if (offensivePatterns.some(rx => rx.test(content))) {
    return Math.random() < 0.5 ? "احطها بكسمك" : "ادك نقطة بكسمك";
  }

  if (imagePatterns.some(rx => rx.test(content))) {
    return `${getRandomReply()} في الصورة`;
  }

  if (screenshotPatterns.some(rx => rx.test(content))) {
    return screenshotReplies[Math.floor(Math.random() * screenshotReplies.length)];
  }

  if (streamPatterns.some(rx => rx.test(content))) {
    return streamReplies[Math.floor(Math.random() * streamReplies.length)];
  }

  const trigger = extractTrigger(content);
  const idx = includesSpecial(content);

  let base;
  do {
    base = idx !== -1 ? specialReplies[idx % specialReplies.length] : getRandomReply();
  } while (base === lastReply);

  if (trigger && !base.startsWith(trigger)) base = `${trigger}${base}`;
  lastReply = base;
  return base;
}

function getRandomDelay() {
  return Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
}

const repliedMessages = new Set();

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot running.'));
app.listen(PORT);

tokens.forEach(token => {
  const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

  let lastActivity = Date.now();
  let lastIdleNotice = false;
  let lastMentionNotice = false;
  const userProgress = {};

  client.once('ready', async () => {
    for (const channelId of targetChannels) {
      const channel = await client.channels.fetch(channelId);
      for (const target of targets) {
        userProgress[target.userId] = {
          channel,
          lastMessageId: startMessageId,
          liveMode: false,
          pendingMessages: []
        };
      }
    }
  });

  client.on('messageCreate', async msg => {
    if (!targets.some(t => t.userId === msg.author.id)) return;
    if (!targetChannels.includes(msg.channel.id)) return;
    if (repliedMessages.has(msg.id)) return;

    const userData = userProgress[msg.author.id];
    if (!userData) return;

    if (!userData.liveMode) {
      userData.pendingMessages.push(msg);
      return;
    }

    const reply = buildReply(msg.content);
    await new Promise(r => setTimeout(r, getRandomDelay()));
    await msg.reply(reply);
    repliedMessages.add(msg.id);
    lastActivity = Date.now();
    lastIdleNotice = false;
    lastMentionNotice = false;
  });

  setInterval(async () => {
    const now = Date.now();
    const idle = now - lastActivity;

    if (idle > 60000 && idle < 180000 && !lastIdleNotice) {
      const channel = await client.channels.fetch(targetChannels[0]);
      await channel.send("هروبمه");
      await new Promise(r => setTimeout(r, 500));
      await channel.send(laughing[Math.floor(Math.random() * laughing.length)]);
      lastIdleNotice = true;
    }

    if (idle >= 180000 && !lastMentionNotice) {
      const channel = await client.channels.fetch(targetChannels[0]);
      const mentions = targets.map(t => `<@${t.userId}>`).join(" ");
      await channel.send(`${mentions} بنسف كسمك من فوق لتحت يين المتشردة`);
      lastMentionNotice = true;

      for (const t of targets) {
        const data = userProgress[t.userId];
        if (data) data.liveMode = true;
      }
    }

    for (const target of targets) {
      const data = userProgress[target.userId];
      if (!data || data.liveMode || !data.pendingMessages.length) continue;

      const nextMsg = data.pendingMessages.shift();
      if (!repliedMessages.has(nextMsg.id)) {
        const reply = buildReply(nextMsg.content);
        await new Promise(r => setTimeout(r, getRandomDelay()));
        await nextMsg.reply(reply);
        repliedMessages.add(nextMsg.id);
        lastActivity = Date.now();
        lastIdleNotice = false;
        lastMentionNotice = false;
      }

      if (!data.pendingMessages.length) data.liveMode = true;
    }
  }, 5000);

  client.login(token);
});
