import { Context } from 'grammy';
import { ConfigService } from '@nestjs/config';
import { getHelpKeyboard } from '../keyboards/help.keyboard';

export class HelpCommand {
  constructor(private readonly configService: ConfigService) {}

  async handle(ctx: Context) {
    const supportUsername = this.configService.get<string>('app.supportUsername') || '@support';

    const message = this.getHelpMessage(supportUsername);

    await ctx.reply(message, {
      parse_mode: 'HTML',
      reply_markup: getHelpKeyboard(),
    });
  }

  private getHelpMessage(supportUsername: string): string {
    return (
      '📖 <b>PDF faylini qanday olish mumkin</b>\n\n' +
      'Bu 3 oddiy qadamni bajaring:\n\n' +
      '1️⃣ <b>Obuna bo\'ling</b> - "Kanalga obuna bo\'lish" tugmasini bosing\n' +
      '2️⃣ <b>Qayting</b> - Obuna bo\'lgach, bu suhbatga qayting\n' +
      '3️⃣ <b>Tasdiqlang</b> - "Obunani tasdiqlash" tugmasini bosing\n\n' +
      '💡 <b>Maslahatlar:</b>\n' +
      '• Tasdiqlashdan oldin obuna bo\'lgach 3-5 soniya kuting\n' +
      '• PDF himoyalangan va bu suhbatda abadiy saqlanadi\n' +
      '• Siz uni suhbat tarixida istalgan vaqtda topishingiz mumkin\n\n' +
      '❓ <b>Keng uchraydigan muammolar:</b>\n' +
      '• "Obuna bo\'lmagansiz" xatosi → Kanalga obuna bo\'lganingizga ishonchingizni tekshiring\n' +
      '• Tasdiqlash muvaffaqiyatsiz tugadi → Bir necha soniya kutib qayta urinib ko\'ring\n' +
      "• PDF topilmadi → Yuqoridagi suhbat tarixini tekshiring\n\n" +
      `🆘 <b>Yordam kerakmi?</b>\n` +
      `Aloqa: ${supportUsername}`
    );
  }
}
