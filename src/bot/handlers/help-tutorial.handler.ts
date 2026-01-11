import { Context } from 'grammy';
import { getBackKeyboard } from '../keyboards/menu.keyboard';

export class HelpTutorialHandler {
  async handle(ctx: Context) {
    if (ctx.callbackQuery?.message) {
      await ctx.answerCallbackQuery();
    }

    const message =
      '📖 <b>PDF faylini qanday olish mumkin</b>\n\n' +
      'Bu qadamlarni bajaring:\n\n' +
      '1️⃣ <b>Obuna bo\'ling</b>\n' +
      '   "Kanalga obuna bo\'lish" tugmasini bosing\n' +
      '   Ochilganda kanalga qo\'shiling\n\n' +
      '2️⃣ <b>Bu yerga qayting</b>\n' +
      '   Bu suhbatga qayting\n' +
      '   (Telegramda orqa qalam tugmasini bosing)\n\n' +
      '3️⃣ <b>Tasdiqlang</b>\n' +
      '   "Obunani tasdiqlash" tugmasini bosing\n\n' +
      '💡 <b>Muhim:</b>\n' +
      '• Obuna bo\'lgach 3-5 soniya kuting\n' +
      '• Haqiqatan ham kanalga qo\'shilganingizga ishonch hosil qiling\n' +
      '• PDF faylingiz darhol yuboriladi!';

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
