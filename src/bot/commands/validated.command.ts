import { Context } from 'grammy';
import { InputFile } from 'grammy';
import { Bot } from 'grammy';
import { ConfigService } from '@nestjs/config';
import { PdfService } from '../../services/pdf.service';
import { SentDocumentsRepository } from '../../repositories/sent-documents.repository';
import { UsersRepository } from '../../repositories/users.repository';
import { getSuccessKeyboard } from '../keyboards/menu.keyboard';

export class ValidatedCommand {
  private bot: Bot;

  constructor(
    private readonly pdfService: PdfService,
    private readonly sentDocumentsRepository: SentDocumentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  setBot(bot: Bot) {
    this.bot = bot;
  }

  async handle(ctx: Context) {
    const telegramId = ctx.from?.id;

    if (!telegramId) {
      return;
    }

    try {
      const activePdf = await this.pdfService.getActivePdf();

      if (!activePdf) {
        await ctx.reply(
          '😔 <b>PDF mavjud emas</b>\n\n' + 'Hozircha PDF hujjati mavjud emas.\n\n' + 'Iltimos, keyinroq tekshiring!',
          { parse_mode: 'HTML' },
        );
        return;
      }

      // Check if already sent
      const alreadySent = await this.sentDocumentsRepository.wasDocumentSent(telegramId, activePdf.id);

      if (alreadySent) {
        await ctx.reply(
          '✅ <b>Sizda allaqachon bu PDF bor!</b>\n\n' +
            '📂 Yuqoridagi suhbat tarixingizni tekshiring - PDF u yerda!\n\n' +
            '💡 PDF ushbu suhbatda doimiy saqlanadi.',
          { parse_mode: 'HTML', reply_markup: getSuccessKeyboard() },
        );
        return;
      }

      // Get internal user ID
      const internalUserId = await this.usersRepository.getInternalIdByTelegramId(telegramId);
      if (!internalUserId) {
        await ctx.reply(
          '❌ <b>Foydalanuvchi topilmadi</b>\n\n' + 'Boshlash uchun /start buyrug\'ini yuboring.',
          { parse_mode: 'HTML' },
        );
        return;
      }

      // Send loading indicator
      const loadingMsg = await ctx.reply('⏳ PDF faylini tayyorlayapmiz...');

      // Record sent document before sending PDF
      await this.sentDocumentsRepository.create({
        userId: internalUserId,
        pdfFileId: activePdf.id,
      });

      // Delete loading message
      try {
        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      } catch {
        // Ignore if message was already deleted
      }

      // Send protected PDF with enhanced caption using telegram file_id for instant delivery
      if (activePdf.telegram_file_id) {
        await ctx.replyWithDocument(activePdf.telegram_file_id, {
          caption: this.getPdfCaption(),
          parse_mode: 'HTML',
          protect_content: true,
        });
      } else {
        // Fallback to file path if telegram_file_id is not available
        await ctx.replyWithDocument(new InputFile(activePdf.file_path), {
          caption: this.getPdfCaption(),
          parse_mode: 'HTML',
          protect_content: true,
        });
      }

      // Success message with keyboard
      await ctx.reply(
        '🎊 <b>PDF muvaffaqiyatli yuborildi!</b>\n\n' +
          '📁 Sizning hujjatingiz bu suhbatda abadiy saqlanadi!\n\n' +
          '💡 Siz uni yuqoridagi suhbat tarixida istalgan vaqtda topishingiz mumkin.',
        { parse_mode: 'HTML', reply_markup: getSuccessKeyboard() },
      );
    } catch (error) {
      console.error('Error sending PDF:', error);
      await ctx.reply(
        '❌ <b>PDF yuborilmadi</b>\n\n' + 'Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.',
        { parse_mode: 'HTML' },
      );

      // Send error log to admin
      await this.sendErrorToAdmin(error, telegramId);
    }
  }

  private getPdfCaption(): string {
    return (
      '📄 <b>Sizning maxsus hujjatingiz</b>\n\n' +
      '🔒 Bu PDF himoyalangan - tashqariga yuborib bo\'lmaydi.\n\n' +
      '💡 U suhbat tarixingizda doimiy saqlanadi!'
    );
  }

  private async sendErrorToAdmin(error: unknown, userId: number) {
    const adminIds = this.configService.get<number[]>('app.adminIds') || [];
    if (adminIds.length === 0 || !this.bot) {
      return;
    }

    const firstAdminId = adminIds[0];
    const timestamp = new Date().toISOString();
    const errorLog = this.formatErrorLog(error);

    try {
      await this.bot.api.sendMessage(
        firstAdminId,
        `🚨 <b>ValidatedCommand Error Report</b>\n\n` +
          `📅 <b>Time:</b> <code>${timestamp}</code>\n` +
          `👤 <b>User ID:</b> <code>${userId}</code>\n\n` +
          `${errorLog}`,
        { parse_mode: 'HTML' },
      );
    } catch (sendError) {
      console.error('Failed to send error log to admin:', sendError);
    }
  }

  private formatErrorLog(err: unknown): string {
    let log = '';

    if (err instanceof Error) {
      log += `🔴 <b>Error Type:</b> ${err.name}\n\n`;
      log += `📝 <b>Message:</b>\n<code>${this.escapeHtml(err.message)}</code>\n\n`;

      if (err.stack) {
        log += `📚 <b>Stack Trace:</b>\n<code>${this.escapeHtml(err.stack)}</code>\n\n`;
      }
    } else if (typeof err === 'string') {
      log += `🔴 <b>Error:</b>\n<code>${this.escapeHtml(err)}</code>\n\n`;
    } else if (err && typeof err === 'object') {
      try {
        const errStr = JSON.stringify(err, null, 2);
        log += `🔴 <b>Error Object:</b>\n<code>${this.escapeHtml(errStr)}</code>\n\n`;
      } catch {
        log += `🔴 <b>Error Object:</b> [Unable to stringify]\n\n`;
      }
    } else {
      log += `🔴 <b>Unknown Error:</b> ${String(err)}\n\n`;
    }

    return log;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
