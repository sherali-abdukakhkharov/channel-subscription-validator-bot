import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';

@Injectable()
export class SubscriptionService {
  private bot: Bot;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('app.telegramBotToken');
    this.bot = new Bot(token);
  }

  async isSubscribed(userId: number): Promise<boolean> {
    const channelUsername = this.configService.get<string>('app.telegramChannelUsername');

    try {
      const chatMember = await this.bot.api.getChatMember(channelUsername, userId);

      // User is subscribed if they are a member, administrator, or creator
      return ['member', 'administrator', 'creator'].includes(chatMember.status);
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }
}
