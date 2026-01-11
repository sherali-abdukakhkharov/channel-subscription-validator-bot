import { Context } from 'grammy';
import { SubscriptionService } from '../../services/subscription.service';
import { ValidatedCommand } from '../commands/validated.command';
import { ConfigService } from '@nestjs/config';

export class CallbackHandler {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly validatedCommand: ValidatedCommand,
    private readonly configService: ConfigService,
  ) {}

  async handle(ctx: Context) {
    const telegramId = ctx.from?.id;

    if (!telegramId) {
      await ctx.answerCallbackQuery({
        text: '❌ Xatolik: Foydalanuvchini aniqlab bo\'lmadi',
        show_alert: true,
      });
      return;
    }

    // Show "checking" feedback
    await ctx.answerCallbackQuery({
      text: '🔍 Obunangiz tekshirilmoqda...',
      show_alert: false,
    });

    // Check if user is subscribed
    const isSubscribed = await this.subscriptionService.isSubscribed(telegramId);

    if (!isSubscribed) {
      // User not subscribed - show alert with helpful message
      await ctx.answerCallbackQuery({
        text: '❌ Iltimos, avval kanalga obuna bo\'ling!',
        show_alert: true,
      });

      // Update message with better instructions
      try {
        const channelUsername = this.configService.get<string>('app.telegramChannelUsername') || '';
        await ctx.editMessageText(
          '📢 <b>Obuna talab qilinadi</b>\n\n' +
            'Iltimos, bu qadamlarni bajaring:\n\n' +
            '1. "Kanalga obuna bo\'lish" tugmasini bosing\n' +
            '2. Kanalga qo\'shiling\n' +
            '3. 3 soniya kuting\n' +
            '4. Qaytib kelib "Obunani tasdiqlash" tugmasini bosing\n\n' +
            '💡 Maslahat: PDF olish uchun kanal a\'zosi bo\'lishingiz shart!' +
            '\n\n' +
            `🔗 Kanal: ${channelUsername}`,
          { parse_mode: 'HTML' },
        );
      } catch {
        // Message might have been modified already, ignore error
      }
      return;
    }

    // User is subscribed - delete the message with inline keyboard
    if (ctx.callbackQuery?.message) {
      try {
        await ctx.deleteMessage();
      } catch (error) {
        // Message might have been deleted already, ignore error
        console.error('Error deleting message:', error);
      }
    }

    // Acknowledge callback silently
    try {
      await ctx.answerCallbackQuery();
    } catch {
      // Callback might have already been answered
    }

    // Send the PDF
    await this.validatedCommand.handle(ctx);
  }
}
