import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  private readonly apiBaseUrl =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : '';
  private readonly apiUrl = `${this.apiBaseUrl}/api/pdf/preview-form`;

  constructor(private http: HttpClient) {}

  generatePdf(csvFile: File, pdfFile?: File, fontSize = 16): Observable<Blob> {
    const formData = new FormData();
    if (pdfFile) {
      formData.append('pdfFile', pdfFile, pdfFile.name);
    }
    formData.append('data', csvFile, csvFile.name);
    formData.append('fontSize', String(fontSize));

    return this.http.post<Blob>(this.apiUrl, formData, {
      responseType: 'blob' as 'json',
    });
  }
}
