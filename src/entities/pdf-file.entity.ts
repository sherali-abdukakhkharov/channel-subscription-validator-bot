export class PdfFile {
  id: number;
  filename: string;
  file_path: string;
  telegram_file_id?: string;
  isActive: boolean;
  createdAt: Date;
}
