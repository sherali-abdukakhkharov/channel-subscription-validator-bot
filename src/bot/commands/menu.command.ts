import { Context } from 'grammy';
import { PdfFilesRepository } from '../../repositories/pdf-files.repository';
import { SentDocumentsRepository } from '../../repositories/sent-documents.repository';
import { ConfigService } from '@nestjs/config';
import { getMainMenuKeyboard } from '../keyboards/menu.keyboard';

export class MenuCommand {
  constructor(
    private readonly pdfFilesRepository: PdfFilesRepository,
    private readonly sentDocumentsRepository: SentDocumentsRepository,
    private readonly configService: ConfigService,
  ) {}

  async handle(ctx: Context) {
    const telegramId = ctx.from?.id;

    if (!telegramId) {
      return;
    }

    const activePdf = await this.pdfFilesRepository.findActive();
    const hasReceived = activePdf
      ? await this.sentDocumentsRepository.wasDocumentSent(telegramId, activePdf.id)
      : false;

    let message = '🎯 <b>Asosiy menyu</b>\n\n';

    if (hasReceived) {
      message += '✅ Sizda allaqachon PDF bor!\n\n';
      message += '📂 Uga kirish uchun suhbat tarixingizni tekshiring.\n\n';
    } else if (activePdf) {
      message += '📄 Siz uchun PDF mavjud!\n\n';
      message += 'Uni olish uchun bu qadamlarni bajaring:\n';
      message += '1. Kanalga obuna bo\'ling\n';
      message += '2. "Obunani tasdiqlash" tugmasini bosing\n\n';
    } else {
      message += '😔 Hozircha PDF mavjud emas.\n\n';
      message += 'Iltimos, keyinroq tekshiring!\n\n';
    }

    message += '📌 Pastdagi tugmalardan foydalaning:';

    await ctx.reply(message, {
      parse_mode: 'HTML',
      reply_markup: getMainMenuKeyboard(hasReceived, !!activePdf, this.configService),
    });
  }
}
