import { InlineKeyboard } from 'grammy';
import { ConfigService } from '@nestjs/config';

export function getMainMenuKeyboard(hasPdf: boolean, pdfAvailable: boolean, configService: ConfigService): InlineKeyboard {
  const channelUsername = configService.get<string>('app.telegramChannelUsername') || '';
  const channelUrl = channelUsername.startsWith('@')
    ? `https://t.me/${channelUsername.slice(1)}`
    : channelUsername.startsWith('https://')
    ? channelUsername
    : `https://t.me/${channelUsername}`;

  const keyboard = new InlineKeyboard();

  if (pdfAvailable && !hasPdf) {
    keyboard.text('✅ Obunani tasdiqlash', 'validate_subscription').row();
  }

  keyboard.url('📢 Kanal', channelUrl).row();
  keyboard.text('📖 Yordam', 'help_command').text('❓ Savollar', 'faq_callback');

  return keyboard;
}

export function getSuccessKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('📖 Yordam', 'help_command')
    .text('❓ Savollar', 'faq_callback');
}

export function getRetryKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🔄 Qayta urinish', 'validate_subscription')
    .row()
    .text('📖 Yordam', 'help_command');
}

export function getBackKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('⬅️ Orqaga', 'help_command');
}
