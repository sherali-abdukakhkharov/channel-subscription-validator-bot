import { InlineKeyboard } from 'grammy';

export function getWelcomeKeyboard(channelUsername: string): InlineKeyboard {
  // Convert @username to https://t.me/username format
  const channelUrl = channelUsername.startsWith('@')
    ? `https://t.me/${channelUsername.slice(1)}`
    : channelUsername.startsWith('https://')
    ? channelUsername
    : `https://t.me/${channelUsername}`;

  return new InlineKeyboard()
    .url('1️⃣ Kanalga obuna bo\'lish', channelUrl)
    .row()
    .text('2️⃣ Obunani tasdiqlash', 'validate_subscription')
    .row()
    .text('❓ Yordam kerakmi?', 'help_tutorial');
}
