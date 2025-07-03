const { Client, Intents } = require('discord.js-selfbot-v13'); const express = require('express');

const tokens = ["كسم توكنك", "كسم الثاني"]; const targets = [ { userId: "كسخت القحبة الاول" }, { userId: "كسخت الثاني" } ]; const targetChannels = ["كسم الروم", "كسم ثاني روم"]; const startMessageId = "كسم ايدي الرسالة";

const randomReplies = [...new Set(["شنقمك", "دعسمك", "اكسرمك", "اشقمك", "ارفسمك", "اسرطمك", "غدرمك", "نيجمك", "عصرمك", "طحنمك", "خلطمك", "بعصمك", "فلقمك", "قتلمك", "قطعمك", "شطرمك", "عجنمك", "دهسمك", "ظرفمك", "شويمك", "حرقمك", "نيكمك", "كسمك", "كسعرضك", "فتحمك", "ركلمك", "خطفمك", "نكحمك", "جلدمك", "خبطمك", "يبن القحبة", "ضربمك", "عفطمك", "ربطمك", "زرفمك", "شلعمك", "نيجختك", "كسختك", "انيكمك", "هردمك", "نفيمك", "صعقمك", "دعسكسمك", "نحرمك", "سلخمك", "هرسمك", "جلدختك", "نطحمك", "نتحمك", "افجرمك", "سحقمك", "صرعمك", "نسخمك", "قشعمك", "هروبمك", "اقودمك", "كس امك", "نفخمك", "قمعمك", "موتمك", "وفاتمك", "يبن الشرموطة", "دفنمك", "لطشمك", "لهبمك", "خرقمك", "اغتصبمك", "انيكختك", "يبن القحاب", "سخطمك", "لعنمك", "فرشمك"]);

const specialWords = ["نقطة", "نقط", "نقطه", "نوقطا", "ن..قط", "ن قط", "نق ط", "بروجكت", "بروجيكت", "البروجكت", "يبن البروجكت", "يبن الروبوت", "يبن الروبوتة"]; const specialReplies = ["كسمك.", "كسختك.", "حرقمك.", "قتلمك.", "شفطمك.", "عصرمك.", "ركلمك.", "خطفمك.", "فتحمك.", "عجنمك.", "نيجمك.", "سحقمك.", "شلعمك.", "افترسمك.", "انهشمك.", "اشقمك.", "رفسمك.", "غدرمك."]; const screenshotReplies = ["اسكرن كسمك", "سكرين بطبونمك"]; const streamReplies = ["ستريم بحتشونمك", "ستريم بكسختك"]; const questionReplies = ["لو امك قحبة اجبر", "لو ابوك ديوث اجبر", "لو اخوك ابن زنا اجبر", "لو كسمك اسود اجبر"]; const imageReplies = ["حط الصورة بكسمك", "انيكمك بالصور", "اخشي صورة بكسمك"];

const offensivePatterns = [/امك.*قحبة.*نقط/, /قحبة.*نقط/, /نقط.قحبة/, /امك.نقط/]; const questionTriggerPatterns = [/شتقول|شنو تقول|وش تقول|ماذا تقول|قل شي|قول شي|قل وش تقول/i]; const mockInsultPrompt = /لو ?امك ?قحبة([^\w]|$)/i; const imagePatterns = [/^صور$/, /^صورة$/]; const screenshotPatterns = [/سكرن/, /سكرين/]; const streamPatterns = [/ستريم/, /بث/, /تعال.بث/]; const emojiRequestPatterns = [/حط.?([\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F1E0}-\u{1F1FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}])/u];

const expressApp = express(); expressApp.get('/', (_, res) => res.send('Bot running.')); expressApp.listen(process.env.PORT || 3000);

function normalize(text) { return text.replace(/[^؀-ۿa-zA-Z0-9]/g, '').toLowerCase(); }

function includesSpecial(content) { const flat = normalize(content); return specialWords.findIndex(word => flat.includes(normalize(word))); }

let recentReplies = []; function rememberReply(text) { recentReplies.push(text); if (recentReplies.length > 5) recentReplies.shift(); }

function extractTrigger(content) { const flat = normalize(content); const fuzzy = ["ن", "ق", "ط", "ة"]; const score = fuzzy.reduce((a, ch) => flat.includes(ch) ? a + 1 : a, 0); if (score >= 3) return "."; const syms = ["-", ".", ",", "#", ")"]; for (let ch of syms) if (content.includes(ch)) return ch; return ""; }

function getRandomReply() { let reply; do { reply = randomReplies[Math.floor(Math.random() * randomReplies.length)]; } while (recentReplies.includes(reply)); rememberReply(reply); return reply; }

function buildReply(content) { if (questionTriggerPatterns.some(rx => rx.test(content))) return questionReplies[Math.floor(Math.random() * questionReplies.length)]; if (mockInsultPrompt.test(content) && !offensivePatterns.some(rx => rx.test(content))) return questionReplies[Math.floor(Math.random() * questionReplies.length)];

const emojiMatch = content.match(emojiRequestPatterns); if (emojiMatch) return ${getRandomReply()} ${emojiMatch[1]};

if (offensivePatterns.some(rx => rx.test(content))) return Math.random() < 0.5 ? "احطها بكسمك" : "ادك نقطة بكسمك"; if (imagePatterns.some(rx => rx.test(content))) return ${getRandomReply()} في الصورة; if (screenshotPatterns.some(rx => rx.test(content))) return screenshotReplies[Math.floor(Math.random() * screenshotReplies.length)]; if (streamPatterns.some(rx => rx.test(content))) return streamReplies[Math.floor(Math.random() * streamReplies.length)];

const trigger = extractTrigger(content); const idx = includesSpecial(content); let base; do { base = idx !== -1 ? specialReplies[idx % specialReplies.length] : getRandomReply(); } while (recentReplies.includes(base) || base.replace(/^./, '') === recentReplies[recentReplies.length - 1]?.replace(/^./, ''));

if (trigger && !base.startsWith(trigger)) base = ${trigger}${base}; return base; }

function getRandomDelay() { const chance = Math.random(); if (chance < 0.1) return 3000 + Math.random() * 1000; if (chance < 0.4) return 2000 + Math.random() * 800; return 1000 + Math.random() * 800; }

function isDirectToBot(msg, client) { return ( msg.mentions.has(client.user.id) || (msg.reference?.messageId && msg.channel.messages.resolve(msg.reference.messageId)?.author.id === client.user.id) ); }

const repliedMessages = new Set();

tokens.forEach(token => { const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }); let lastActivity = Date.now(); let lastReplyHappened = false; const userProgress = {};

client.once('ready', async () => { for (const channelId of targetChannels) { const channel = await client.channels.fetch(channelId); for (const target of targets) { const messages = await channel.messages.fetch({ after: startMessageId, limit: 100 }); userProgress[target.userId] = { channel, lastMessageId: startMessageId, liveMode: true, pendingMessages: messages.filter(m => m.author.id === target.userId && !repliedMessages.has(m.id)).sort((a, b) => a.createdTimestamp - b.createdTimestamp) }; } } });

client.on('messageCreate', async msg => { if (!targets.some(t => t.userId === msg.author.id)) return; if (!targetChannels.includes(msg.channel.id)) return; if (repliedMessages.has(msg.id)) return;

const userData = userProgress[msg.author.id]; if (!userData) return; const isDirected = isDirectToBot(msg, client); const hasSpecialTrigger = ( questionTriggerPatterns.some(rx => rx.test(msg.content)) || mockInsultPrompt.test(msg.content) || imagePatterns.some(rx => rx.test(msg.content)) || screenshotPatterns.some(rx => rx.test(msg.content)) || streamPatterns.some(rx => rx.test(msg.content)) || includesSpecial(msg.content) !== -1 || emojiRequestPatterns.some(rx => rx.test(msg.content)) ); if (hasSpecialTrigger && !isDirected) return; if (msg.attachments.size > 0) { const reply = imageReplies[Math.floor(Math.random() * imageReplies.length)]; await new Promise(r => setTimeout(r, getRandomDelay())); await msg.reply(reply); } else { const reply = buildReply(msg.content); await new Promise(r => setTimeout(r, getRandomDelay())); await msg.reply(reply); } repliedMessages.add(msg.id); userData.liveMode = true; lastActivity = Date.now(); lastReplyHappened = true; 

});

setInterval(async () => { const now = Date.now(); const idle = now - lastActivity;

if (idle > 60000 && idle < 180000 && lastReplyHappened) { const channel = await client.channels.fetch(targetChannels[0]); await channel.send("هروبمه"); await new Promise(r => setTimeout(r, 500)); await channel.send("ههه"); lastReplyHappened = false; } if (idle >= 180000 && lastReplyHappened) { const channel = await client.channels.fetch(targetChannels[0]); const mentions = targets.map(t => `<@${t.userId}>`).join(" "); await channel.send(`${mentions} بنسف كسمك من فوق لتحت يين المتشردة`); for (const t of targets) { const data = userProgress[t.userId]; if (data) data.liveMode = true; } lastReplyHappened = false; } for (const target of targets) { const data = userProgress[target.userId]; if (!data || !data.liveMode || !data.pendingMessages.length) continue; const nextMsg = data.pendingMessages.shift(); if (!repliedMessages.has(nextMsg.id)) { const reply = buildReply(nextMsg.content); await new Promise(r => setTimeout(r, getRandomDelay())); await nextMsg.reply(reply); repliedMessages.add(nextMsg.id); lastActivity = Date.now(); lastReplyHappened = true; } } 

}, 5000);

client.login(token); });
