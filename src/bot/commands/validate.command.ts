import { Context } from 'grammy';
import { InputFile } from 'grammy';
import { SubscriptionService } from '../../services/subscription.service';
import { PdfService } from '../../services/pdf.service';
import { SentDocumentsRepository } from '../../repositories/sent-documents.repository';
import { UsersRepository } from '../../repositories/users.repository';
import { getWelcomeKeyboard } from '../keyboards/welcome.keyboard';
import { ConfigService } from '@nestjs/config';

export class ValidateCommand {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly pdfService: PdfService,
    private readonly sentDocumentsRepository: SentDocumentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async handle(ctx: Context) {
    const telegramId = ctx.from?.id;

    if (!telegramId) {
      return;
    }

    await ctx.reply('Obunangiz tekshirilmoqda...');

    try {
      // Check if user is subscribed
      const isSubscribed = await this.subscriptionService.isSubscribed(telegramId);

      if (!isSubscribed) {
        const channelUsername = this.configService.get<string>('app.telegramChannelUsername');
        await ctx.reply(
          '❌ Siz hali kanalga obuna bo\'lmagansiz.\n\n' +
            'Iltimos, avval obuna bo\'ling va keyin qayta urinib ko\'ring.',
          { reply_markup: getWelcomeKeyboard(channelUsername) },
        );
        return;
      }

      // User is subscribed - send protected PDF
      await this.sendProtectedPdf(ctx, telegramId);
    } catch (error) {
      console.error('Error validating subscription:', error);
      await ctx.reply('❌ Obunangizni tekshirishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.');
    }
  }

  private async sendProtectedPdf(ctx: Context, telegramId: number) {
    try {
      const activePdf = await this.pdfService.getActivePdf();

      if (!activePdf) {
        await ctx.reply('❌ Hozircha PDF hujjati mavjud emas. Iltimos, keyinroq qayta urinib ko\'ring.');
        return;
      }

      // Check if already sent
      const alreadySent = await this.sentDocumentsRepository.wasDocumentSent(telegramId, activePdf.id);

      if (alreadySent) {
        await ctx.reply(
          '✅ Siz allaqachon bu hujjatni oldingiz!\n\n' + 'Himoyalangan PDF uchun suhbat tarixingizni tekshiring.',
        );
        return;
      }

      // Get internal user ID
      const internalUserId = await this.usersRepository.getInternalIdByTelegramId(telegramId);
      if (!internalUserId) {
        await ctx.reply('❌ Foydalanuvchi topilmadi. Iltimos, /start buyrug\'i bilan botni qayta boshlang');
        return;
      }

      // Send protected PDF using telegram file_id for instant delivery
      if (activePdf.telegram_file_id) {
        await ctx.replyWithDocument(activePdf.telegram_file_id, {
          caption:
            '📄 Bu sizning maxsus hujjatingiz!\n\nEslatma: Bu hujjat himoyalangan va uni yuborib yoki yuklab bo\'lmaydi.',
          parse_mode: 'HTML',
          protect_content: true,
        });
      } else {
        // Fallback to file path if telegram_file_id is not available
        await ctx.replyWithDocument(new InputFile(activePdf.file_path), {
          caption:
            '📄 Bu sizning maxsus hujjatingiz!\n\nEslatma: Bu hujjat himoyalangan va uni yuborib yoki yuklab bo\'lmaydi.',
          parse_mode: 'HTML',
          protect_content: true,
        });
      }

      // Record sent document
      await this.sentDocumentsRepository.create({
        userId: internalUserId,
        pdfFileId: activePdf.id,
      });

      await ctx.reply(
        '✅ Hujjat muvaffaqiyatli yuborildi!\n\n' +
          'Bu hujjat himoyalangan va uni tashqariga yuborib yoki yuklab bo\'lmaydi.',
      );
    } catch (error) {
      console.error('Error sending PDF:', error);
      await ctx.reply('❌ Hujjatni yuborish muvaffaqiyatsiz tugadi. Iltimos, keyinroq qayta urinib ko\'ring.');
    }
  }
}
