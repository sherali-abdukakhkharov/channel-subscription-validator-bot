import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { SentDocumentsRepository } from '../repositories/sent-documents.repository';
import { PdfFilesRepository } from '../repositories/pdf-files.repository';

export interface BotStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  utmSourceStats: Record<string, number>;
  documentsSent: number;
  uniqueRecipients: number;
  activePdf: string | null;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sentDocumentsRepository: SentDocumentsRepository,
    private readonly pdfFilesRepository: PdfFilesRepository,
  ) {}

  async getStats(): Promise<BotStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      totalUsersResult,
      newTodayResult,
      newWeekResult,
      utmStats,
      documentsSentResult,
      uniqueRecipientsResult,
      activePdf,
    ] = await Promise.all([
      this.usersRepository.getTotalCount(),
      this.usersRepository.getNewUsersCount(today),
      this.usersRepository.getNewUsersCount(weekAgo),
      this.usersRepository.getStatsByUtmSource(),
      this.sentDocumentsRepository.getTotalSent(),
      this.sentDocumentsRepository.getUniqueRecipients(),
      this.pdfFilesRepository.findActive(),
    ]);

    return {
      totalUsers: parseInt(String(totalUsersResult?.count || '0')),
      newUsersToday: parseInt(String(newTodayResult?.count || '0')),
      newUsersThisWeek: parseInt(String(newWeekResult?.count || '0')),
      utmSourceStats: this.formatUtmStats(utmStats),
      documentsSent: parseInt(String(documentsSentResult?.count || '0')),
      uniqueRecipients: parseInt(String(uniqueRecipientsResult?.count || '0')),
      activePdf: activePdf?.filename || null,
    };
  }

  private formatUtmStats(stats: any[]): Record<string, number> {
    return stats.reduce(
      (acc, stat) => {
        acc[stat.utm_source] = parseInt(String(stat.count));
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
