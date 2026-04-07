import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  private readonly apiUrl = '/api/generate-pdf';

  constructor(private http: HttpClient) {}

  generatePdf(csvFile: File, pdfFile?: File, fontSize = 16): Observable<Blob> {
    const formData = new FormData();
    if (pdfFile) {
      formData.append('pdfFile', pdfFile, pdfFile.name);
    }
    formData.append('data', csvFile, csvFile.name);
    formData.append('fontSize', String(fontSize));

    return this.http.post<Blob>('http://localhost:3000/api/pdf/preview-form', formData, {
      responseType: 'blob' as 'json',
    });
  }
}
