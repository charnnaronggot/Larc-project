export type ApiResponse = {
  success: boolean;
  message: string;
  filePath?: string;
  fileId?: string;
  pdfData?: string;
  rowsProcessed?: number;
};
