import { Context } from 'grammy';
import { UsersRepository } from '../../repositories/users.repository';
import { SentDocumentsRepository } from '../../repositories/sent-documents.repository';
import { PdfFilesRepository } from '../../repositories/pdf-files.repository';
import { ConfigService } from '@nestjs/config';
import { getWelcomeKeyboard } from '../keyboards/welcome.keyboard';

export class StartCommand {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sentDocumentsRepository: SentDocumentsRepository,
    private readonly pdfFilesRepository: PdfFilesRepository,
    private readonly configService: ConfigService,
  ) {}

  async handle(ctx: Context) {
    const telegramId = ctx.from?.id;
    const startParam = ctx.match; // Contains ?start=utm_source parameter

    if (!telegramId) {
      return;
    }

    // Extract UTM source from start parameter
    const utmSource = this.extractUtmSource(startParam);

    // Check if user already exists before creating
    const existingUser = await this.usersRepository.findByTelegramId(telegramId);

    // Save or update user in database
    const user = await this.usersRepository.findOrCreate({
      telegramId,
      firstName: ctx.from?.first_name,
      lastName: ctx.from?.last_name,
      username: ctx.from?.username,
      utmSource: utmSource || 'direct',
    });

    // Determine if first-time user (just created or first_seen_at === created_at)
    const isFirstTime = !existingUser || (user.first_seen_at && user.created_at && user.first_seen_at.getTime() === user.created_at.getTime());

    // Check if user has already received a PDF
    const activePdf = await this.pdfFilesRepository.findActive();

    if (activePdf) {
      const alreadyReceived = await this.sentDocumentsRepository.wasDocumentSent(telegramId, activePdf.id);

      if (alreadyReceived) {
        // User already has the PDF
        const channelUsername = this.configService.get<string>('app.telegramChannelUsername');
        const channelUrl = channelUsername?.startsWith('@')
          ? `https://t.me/${channelUsername.slice(1)}`
          : channelUsername || '';

        await ctx.reply(
          '✅ Siz allaqachon PDF hujjatni oldingiz!\n\n' +
            `Yangi yangilanishlar va kontentdan xabardor bo\'lishingiz uchun kanalga obuna bo\'lib qoling.\n\n` +
            `🔗 ${channelUrl}`,
          { parse_mode: 'HTML' },
        );
        return;
      }
    }

    // Send welcome message with subscription prompt
    const channelUsername = this.configService.get<string>('app.telegramChannelUsername');
    await ctx.reply(this.getWelcomeMessage(isFirstTime), {
      parse_mode: 'HTML',
      reply_markup: getWelcomeKeyboard(channelUsername),
    });
  }

  private extractUtmSource(param: unknown): string | null {
    if (!param || typeof param !== 'string') {
      return null;
    }

    // param format: "utm_source=value" or "value"
    const parts = param.split('=');
    return parts.length > 1 ? parts[1] : parts[0];
  }

  private getWelcomeMessage(firstTime: boolean): string {
    if (firstTime) {
      return (
        '🎉 <b>Xush kelibsiz!</b>\n\n' +
        '📚 Maxsus PDF faylingizni oling!\n\n' +
        '📋 <b>3 oddiy qadam:</b>\n' +
        '1️⃣ Pastdagi "Kanalga obuna bo\'lish" tugmasini bosing\n' +
        '2️⃣ Obuna bo\'ling va 3 soniya kuting\n' +
        '3️⃣ Qaytib kelib "Obunani tasdiqlash" tugmasini bosing\n\n' +
        '⏱️ Buning uchun 30 soniyadan kam kerak!\n\n' +
        'Boshlaymiz 👇'
      );
    } else {
      return (
        '👋 <b>Yana xush kelibsiz!</b>\n\n' +
        'PDF faylni olishga tayyormisiz?\n\n' +
        'Uni olish uchun pastdagi "Obunani tasdiqlash" tugmasini bosing!\n\n' +
        'Yoki ko\'rish uchun /help buyrug\'idan foydalaning.'
      );
    }
  }
}
