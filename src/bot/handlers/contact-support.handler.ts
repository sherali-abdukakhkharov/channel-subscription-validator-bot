import { Context } from 'grammy';
import { ConfigService } from '@nestjs/config';
import { getBackKeyboard } from '../keyboards/menu.keyboard';

export class ContactSupportHandler {
  constructor(private readonly configService: ConfigService) {}

  async handle(ctx: Context) {
    if (ctx.callbackQuery?.message) {
      await ctx.answerCallbackQuery();
    }

    const supportUsername = this.configService.get<string>('app.supportUsername') || '@support';

    const message =
      '🆘 <b>Yordam kerakmi?</b>\n\n' +
      'Agar PDF olishda muammoga duch kelsangiz:\n\n' +
      '✅ Kanalga obuna bo\'lganingizga ishonch hosil qiling\n' +
      '✅ Obuna bo\'lgach 5 soniya kuting\n' +
      '✅ "Obunani tasdiqlash" ni qayta urinib ko\'ring\n\n' +
      'Hali ham qiyinchilik bormi? Qo\'llab-quvvatlash jamoasimiz bilan bog\'laning:\n\n' +
      `📧 ${supportUsername}`;

    try {
      await ctx.editMessageText(message, {
        parse_mode: 'HTML',
        reply_markup: getBackKeyboard(),
      });
    } catch {
      // If message can't be edited, send new message
      await ctx.reply(message, {
        parse_mode: 'HTML',
        reply_markup: getBackKeyboard(),
      });
    }
  }
}
