import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotService } from './bot.service';
import { DatabaseModule } from '../database/database.module';
import { UsersRepository } from '../repositories/users.repository';
import { SubscriptionService } from '../services/subscription.service';
import { PdfService } from '../services/pdf.service';
import { AnalyticsService } from '../services/analytics.service';
import { PdfFilesRepository } from '../repositories/pdf-files.repository';
import { SentDocumentsRepository } from '../repositories/sent-documents.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    BotService,
    UsersRepository,
    SubscriptionService,
    PdfService,
    AnalyticsService,
    PdfFilesRepository,
    SentDocumentsRepository,
  ],
  exports: [BotService],
})
export class BotModule {}
