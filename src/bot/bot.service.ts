import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { autoRetry } from '@grammyjs/auto-retry';
import { UsersRepository } from '../repositories/users.repository';
import { SentDocumentsRepository } from '../repositories/sent-documents.repository';
import { PdfFilesRepository } from '../repositories/pdf-files.repository';
import { SubscriptionService } from '../services/subscription.service';
import { PdfService } from '../services/pdf.service';
import { AnalyticsService } from '../services/analytics.service';
import { StartCommand } from './commands/start.command';
import { ValidateCommand } from './commands/validate.command';
import { ValidatedCommand } from './commands/validated.command';
import { SetPdfCommand } from './commands/setpdf.command';
import { StatsCommand } from './commands/stats.command';
import { HelpCommand } from './commands/help.command';
import { MenuCommand } from './commands/menu.command';
import { CallbackHandler } from './handlers/callback.handler';
import { FaqHandler } from './handlers/faq.handler';
import { HelpTutorialHandler } from './handlers/help-tutorial.handler';
import { ContactSupportHandler } from './handlers/contact-support.handler';

interface SessionData {
  utmSource?: string;
  attempts?: number;
}

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private bot: Bot;
  private readonly logger = new Logger(BotService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly sentDocumentsRepository: SentDocumentsRepository,
    private readonly pdfFilesRepository: PdfFilesRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly pdfService: PdfService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async onModuleInit() {
    try {
      const token = this.configService.get<string>('app.telegramBotToken');

      if (!token) {
        throw new Error('Telegram bot token is not configured');
      }

      this.logger.log('Initializing bot...');

      this.bot = new Bot(token);

      // Auto-retry on rate limits
      this.bot.api.config.use(autoRetry());

      // Create command instances
      const startCommand = new StartCommand(
        this.usersRepository,
        this.sentDocumentsRepository,
        this.pdfFilesRepository,
        this.configService,
      );
      const validateCommand = new ValidateCommand(
        this.subscriptionService,
        this.pdfService,
        this.sentDocumentsRepository,
        this.usersRepository,
        this.configService,
      );
      const validatedCommand = new ValidatedCommand(
        this.pdfService,
        this.sentDocumentsRepository,
        this.usersRepository,
        this.configService,
      );

      // Set bot instance on validated command after bot is created
      validatedCommand.setBot(this.bot);
      const setPdfCommand = new SetPdfCommand(this.pdfService, this.configService);
      const statsCommand = new StatsCommand(this.analyticsService, this.configService);
      const helpCommand = new HelpCommand(this.configService);
      const menuCommand = new MenuCommand(
        this.pdfFilesRepository,
        this.sentDocumentsRepository,
        this.configService,
      );
      const callbackHandler = new CallbackHandler(
        this.subscriptionService,
        validatedCommand,
        this.configService,
      );
      const faqHandler = new FaqHandler();
      const helpTutorialHandler = new HelpTutorialHandler();
      const contactSupportHandler = new ContactSupportHandler(this.configService);

      // Register commands
      this.bot.command('start', startCommand.handle.bind(startCommand));
      this.bot.command('validate', validateCommand.handle.bind(validateCommand));
      this.bot.command('setpdf', setPdfCommand.handle.bind(setPdfCommand));
      this.bot.command('stats', statsCommand.handle.bind(statsCommand));
      this.bot.command('help', helpCommand.handle.bind(helpCommand));
      this.bot.command('menu', menuCommand.handle.bind(menuCommand));

      // Register callback handlers
      this.bot.callbackQuery('validate_subscription', callbackHandler.handle.bind(callbackHandler));
      this.bot.callbackQuery('help_command', async (ctx) => {
        await helpCommand.handle(ctx);
      });
      this.bot.callbackQuery('faq_callback', faqHandler.handle.bind(faqHandler));
      this.bot.callbackQuery('help_tutorial', helpTutorialHandler.handle.bind(helpTutorialHandler));
      this.bot.callbackQuery('contact_support', contactSupportHandler.handle.bind(contactSupportHandler));

      // Handle errors
      this.bot.catch(async (err) => {
        this.logger.error('Bot error:', err);

        // Send error log to first admin
        const adminIds = this.configService.get<number[]>('app.adminIds') || [];
        if (adminIds.length > 0) {
          const firstAdminId = adminIds[0];

          const errorLog = this.formatErrorLog(err);
          const timestamp = new Date().toISOString();

          try {
            await this.bot.api.sendMessage(
              firstAdminId,
              `🚨 <b>Bot Error Report</b>\n\n` +
                `📅 <b>Time:</b> <code>${timestamp}</code>\n\n` +
                `${errorLog}`,
              { parse_mode: 'HTML' },
            );
          } catch (sendError) {
            this.logger.error('Failed to send error log to admin:', sendError);
          }
        }
      });

      // Start bot
      await this.bot.start();
      this.logger.log('Bot started successfully');
    } catch (error) {
      this.logger.error('Failed to start bot:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.bot) {
      await this.bot.stop();
      this.logger.log('Bot stopped');
    }
  }

  getBot(): Bot {
    return this.bot;
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
