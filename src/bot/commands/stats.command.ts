import { Context } from 'grammy';
import { AnalyticsService } from '../../services/analytics.service';
import { ConfigService } from '@nestjs/config';

export class StatsCommand {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly configService: ConfigService,
  ) {}

  async handle(ctx: Context) {
    const telegramId = ctx.from?.id;
    const adminIds = this.configService.get<number[]>('app.adminIds', []);

    // Check if user is admin
    if (!telegramId || !adminIds.includes(telegramId)) {
      await ctx.reply('❌ You are not authorized to use this command.');
      return;
    }

    try {
      const stats = await this.analyticsService.getStats();

      const message = this.formatStatsMessage(stats);
      await ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error fetching stats:', error);
      await ctx.reply('❌ Failed to fetch statistics.');
    }
  }

  private formatStatsMessage(stats: {
    totalUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    utmSourceStats: Record<string, number>;
    documentsSent: number;
    uniqueRecipients: number;
    activePdf: string | null;
  }): string {
    return (
      '<b>📊 Bot Statistics</b>\n\n' +
      '<b>Users:</b>\n' +
      `Total: ${stats.totalUsers}\n` +
      `New today: ${stats.newUsersToday}\n` +
      `New this week: ${stats.newUsersThisWeek}\n\n` +
      '<b>UTM Sources:</b>\n' +
      this.formatUtmSources(stats.utmSourceStats) +
      '\n<b>Documents Sent:</b>\n' +
      `Total: ${stats.documentsSent}\n` +
      `Unique users: ${stats.uniqueRecipients}\n\n` +
      '<b>Current Active PDF:</b>\n' +
      `${stats.activePdf || 'None set'}`
    );
  }

  private formatUtmSources(utmStats: Record<string, number>): string {
    return Object.entries(utmStats)
      .map(([source, count]) => `  ${source}: ${count}`)
      .join('\n');
  }
}
