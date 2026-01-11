import { Context } from 'grammy';
import { getBackKeyboard } from '../keyboards/menu.keyboard';

export class FaqHandler {
  async handle(ctx: Context) {
    if (ctx.callbackQuery?.message) {
      await ctx.answerCallbackQuery();
    }

    const message =
      '❓ <b>Ko\'p beriladigan savollar</b>\n\n' +
      '<b>S: Nima uchun obuna bo\'lishim kerak?</b>\n' +
      'J: Bu bizning jamoamizni o\'stirishga yordam beradi va siz yangilanishlarni olasiz!\n\n' +
      '<b>S: PDF ni yuborishim mumkinmi?</b>\n' +
      'J: Yo\'q, PDF faqat obunachilar uchun himoyalangan.\n\n' +
      '<b>S: PDF ni yo\'qotdim. Uni qayta olish mumkinmi?</b>\n' +
      'J: /menu buyrug\'idan foydalaning - agar siz oldin olgan bo\'lsangiz, biz uni qayta yuborishimiz mumkin!\n\n' +
      '<b>S: PDF qancha vaqt mavjud?</b>\n' +
      'J: Abadiy! Bir marta olgach, u suhbat tarixingizda qoladi.\n\n' +
      '<b>S: Kanal yopiq. Nima qilishim kerak?</b>\n' +
      'J: Qadamma-qadam ko\'rsatma uchun /help buyrug\'idan foydalaning.';

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
