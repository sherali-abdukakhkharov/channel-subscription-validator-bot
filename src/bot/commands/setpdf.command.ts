import { Context } from 'grammy';
import { PdfService } from '../../services/pdf.service';
import { ConfigService } from '@nestjs/config';

export class SetPdfCommand {
  constructor(
    private readonly pdfService: PdfService,
    private readonly configService: ConfigService,
  ) {}

  async handle(ctx: Context) {
    const telegramId = ctx.from?.id;
    const adminIds = this.configService.get<number[]>('app.adminIds', []);

    // Check if user is admin
    if (!telegramId || !adminIds.includes(telegramId)) {
      await ctx.reply('❌ Siz bu buyruqdan foydalanishga ruxsat etilmagansiz.');
      return;
    }

    // Get document from reply
    const document = ctx.message?.reply_to_message?.document;

    if (!document) {
      await ctx.reply(
        '📝 Foydalanish:\n\n' +
          '1. Botga PDF hujjatini yuboring\n' +
          '2. /setpdf buyrug\'i bilan javob bering\n' +
          '3. PDF faol hujjat sifatida o\'rnatiladi',
      );
      return;
    }

    try {
      // Download and save PDF
      const file = await ctx.api.getFile(document.file_id);
      const savedPath = await this.pdfService.savePdfFromTelegram(file, document.file_name);

      // Set as active PDF with telegram file_id
      await this.pdfService.setActivePdf(savedPath, document.file_name, document.file_id);

      await ctx.reply(
        `✅ PDF muvaffaqiyatli o\'rnatildi!\n\n` + `Fayl: ${document.file_name}\n` + `Yo\'l: ${savedPath}\n\n` + `Barcha yangi tasdiqlangan foydalanuvchilar bu hujjatni oladi.`,
      );
    } catch (error) {
      console.error('Error setting PDF:', error);
      await ctx.reply('❌ PDFni o\'rnatib bo\'lmadi. Iltimos, qayta urinib ko\'ring.');
    }
  }
}
