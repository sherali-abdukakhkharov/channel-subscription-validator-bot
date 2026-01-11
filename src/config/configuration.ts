import { registerAs } from '@nestjs/config';
import dotenv from 'dotenv';

dotenv.config();


export interface AppConfig {
  telegramBotToken: string;
  telegramChannelUsername: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  port: number;
  nodeEnv: string;
  pdfStoragePath: string;
  adminIds: number[];
  supportUsername: string;
}

export const configuration = registerAs('app', (): AppConfig => {
  const adminIds = process.env.ADMIN_IDS
    ? process.env.ADMIN_IDS.split(',').map(id => parseInt(id.trim(), 10))
    : [];

  // Use first admin ID as support username if not explicitly set
  const firstAdminId = adminIds.length > 0 ? adminIds[0] : null;
  const supportUsername = process.env.SUPPORT_USERNAME || '';

  return {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChannelUsername: process.env.TELEGRAM_CHANNEL_USERNAME || '',
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'channel_validator_bot',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    },
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    pdfStoragePath: process.env.PDF_STORAGE_PATH || './storage/pdfs',
    adminIds,
    supportUsername,
  };
});
