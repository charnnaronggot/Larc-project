import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  private readonly apiUrl = '/api/generate-pdf';

  constructor(private http: HttpClient) {}

  generatePdf(csvFile: File, pdfFile: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('PdfFile', pdfFile, pdfFile.name);
    formData.append('Data', csvFile, csvFile.name);
    formData.append('FontSize', '14');


    return this.http.post('http://localhost:5000/api/pdf/preview-form', formData, {
      responseType: 'blob',
    });
  }
}
