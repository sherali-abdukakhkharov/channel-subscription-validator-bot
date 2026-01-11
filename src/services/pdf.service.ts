import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import path from 'path';
import { Bot } from 'grammy';
import { PdfFilesRepository } from '../repositories/pdf-files.repository';
import { PdfFile } from '../entities/pdf-file.entity';

@Injectable()
export class PdfService {
  private bot: Bot;
  private storagePath: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly pdfFilesRepository: PdfFilesRepository,
  ) {
    const token = this.configService.get<string>('app.telegramBotToken');
    this.bot = new Bot(token);
    this.storagePath = this.configService.get<string>('app.pdfStoragePath');
  }

  async getActivePdf(): Promise<PdfFile | null> {
    return await this.pdfFilesRepository.findActive();
  }

  async savePdfFromTelegram(telegramFile: any, filename: string): Promise<string> {
    // Ensure storage directory exists
    await fs.mkdir(this.storagePath, { recursive: true });

    // Generate unique filename
    const uniqueFilename = `${Date.now()}-${filename}`;
    const filePath = path.join(this.storagePath, uniqueFilename);

    // Download file from Telegram
    const file = await this.bot.api.getFile(telegramFile.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${this.bot.token}/${file.file_path}`;
    const response = await fetch(fileUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Save to disk
    await fs.writeFile(filePath, buffer);

    return filePath;
  }

  async setActivePdf(filePath: string, filename: string, telegramFileId?: string): Promise<void> {
    // Deactivate all current PDFs
    await this.pdfFilesRepository.deactivateAll();

    // Create new active PDF entry
    await this.pdfFilesRepository.create({
      filename,
      filePath,
      telegramFileId,
      isActive: true,
    });
  }

  async deletePdf(id: number): Promise<void> {
    const pdfFile = await this.pdfFilesRepository.findById(id);

    if (!pdfFile) {
      throw new NotFoundException('PDF file not found');
    }

    // Delete from filesystem
    try {
      await fs.unlink(pdfFile.file_path);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete from database
    await this.pdfFilesRepository.delete(id);
  }
}
