import { Component, signal, computed ,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TableModule } from 'primeng/table';
// import { ImgBG} from '../../../assets/BG_Barcode.png';
interface CsvRow {
  [key: string]: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `<!-- home.component.html -->
 
<div class="flex gap-6 p-8 h-screen bg-slate-100 box-border overflow-hidden" style="background-image: url('assets/images/background.png')";>

  <!-- Left Panel: CSV Import & Preview -->
  <div class="bg-white rounded-2xl border-2 border-slate-200 flex flex-col overflow-hidden transition-all duration-300 opacity-90"
       [class]="isExpanded() ? 'flex-[3]' : 'flex-[1.5]'">
    <!-- Header Buttons -->
    <div class="flex justify-between items-center px-4 py-3 border-b border-slate-200 shrink-0" >
      <div class="flex gap-2" >
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600"
          (click)="toggleExpand()"
          [title]="isExpanded() ? 'ย่อขนาด' : 'ขยายขนาด'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            @if (isExpanded()) {
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            } @else {
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            }
          </svg>
          <span>ย่อขยาย</span>
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 bg-red-500 text-white hover:bg-red-600"
          (click)="deleteDocument()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span>ลบเอกสาร</span>
        </button>
      </div>
      <button
        class="inline-flex items-center gap-1.5 px-5 py-2 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-px hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        (click)="generatePdf()"
        
        [disabled]="!canGenerate() || isGenerating()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <span>{{ isGenerating() ? 'กำลังสร้าง...' : 'สร้าง PDF' }}</span>
      </button>
    </div>
    <!-- CSV Content Area -->
    <div class="w-full flex flex-col my-auto max-h-[90%]"  [ngClass]="verticalState() === 'top' ? 'flex-[3]' : (verticalState() === 'split' ? 'flex-[1.5]' : 'flex-[1]')">
      <!-- Top Half: CSV Content -->
       <div class="flex-1 flex flex-col border-b border-slate-200" >   
               <div  (click)="toggleVerticalExpand()"
          class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-slate-100">
         <span class="text-[13px] font-medium text-slate-600">PDF Template:</span>
       </div>
      <div class="flex-1 overflow-auto p-4">
        @if (!hasCsv()) {
         <!-- @if(false) { -->
          <!-- Drop Zone -->
          <div
            class="border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 h-full w-full hover:border-blue-500 hover:bg-blue-500/[0.03]"
            [class.border-blue-500]="isDraggingCsv()"
            [class.bg-blue-500/[0.03]]="isDraggingCsv()"
            [class.border-[3px]]="isDraggingCsv()"
            (dragover)="onCsvDragOver($event)"
            (dragleave)="onCsvDragLeave($event)"
            (drop)="onCsvDrop($event)"
            (click)="csvInput.click()">
            <input
              #csvInput
              type="file"
              accept=".csv"
              (change)="onCsvFileSelect($event)"
              hidden
            />
            <div class="flex flex-col items-center gap-3 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p class="text-base font-semibold text-slate-800 m-0">ลากไฟล์ CSV มาวางที่นี่</p>
              <p class="text-[13px] text-slate-400 m-0">หรือคลิกเพื่อเลือกไฟล์</p>
            </div>
          </div>
        } @else {
          <!-- CSV Preview Table -->
          <div class=" flex flex-col">
            <div class="flex items-center gap-2 py-2 mb-2 text-[13px] font-medium text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>{{ csvFile()?.name }}</span>
            </div>
            <div class="flex-1 overflow-auto rounded-lg border border-slate-200">
              <!-- <p-table [value]="csvRows()">
                <ng-template pTemplate="header">
                  <tr>
                    @for (header of csvHeaders(); track header) {
                      <th>{{ header }}</th>
                    }
                  </tr>
                </ng-template>

                <ng-template pTemplate="body" let-row>
                  <tr>
                    @for (header of csvHeaders(); track header) {
                      <td>{{ row[header] }}</td>
                    }
                  </tr>
                </ng-template>
              </p-table> -->
          <!-- <table class="w-full border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr>
                <th class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 bg-slate-50 font-semibold text-slate-800 sticky top-0 z-[1]">Column A</th>
                <th class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 bg-slate-50 font-semibold text-slate-800 sticky top-0 z-[1]">Column B</th>
                <th class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 bg-slate-50 font-semibold text-slate-800 sticky top-0 z-[1]">Column C</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover:bg-slate-50 last:[&>td]:border-b-0">
                <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 1</td>
                <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 2</td>
                <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 3</td>
              </tr>
              <tr class="hover:bg-slate-50 last:[&>td]:border-b-0">
                <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 4</td>
                <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 5</td>
                <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 6</td>
              </tr>
              <tr class="hover:bg-slate-50 last:[&>td]:border-b-0">
                <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 7</td>
                <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 8</td>
                <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 9</td>
              </tr>
            </tbody>
          </table>
          <p-table class="w-full text-xs">
  <ng-template pTemplate="header">
    <tr>
      <th class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 bg-slate-50 font-semibold text-slate-800 sticky top-0 z-[1]">Column A</th>
      <th class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 bg-slate-50 font-semibold text-slate-800 sticky top-0 z-[1]">Column B</th>
      <th class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 bg-slate-50 font-semibold text-slate-800 sticky top-0 z-[1]">Column C</th>
    </tr>
  </ng-template>

  <ng-template pTemplate="body">
    <tr class="hover:bg-slate-50 last:[&>td]:border-b-0">
      <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 1</td>
      <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 2</td>
      <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 3</td>
    </tr>
    <tr class="hover:bg-slate-50 last:[&>td]:border-b-0">
      <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 4</td>
      <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 5</td>
      <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 6</td>
    </tr>
    <tr class="hover:bg-slate-50 last:[&>td]:border-b-0">
      <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 7</td>
      <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 8</td>
      <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">Data 9</td>
    </tr>
  </ng-template>
</p-table> -->
              <table class="w-full border-collapse text-xs whitespace-nowrap">
                <thead>
                  <tr>
                    @for (header of csvHeaders(); track header) {
                      <th class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 bg-slate-50 font-semibold text-slate-800 sticky top-0 z-[1]">{{ header }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of csvRows(); track $index) {
                    <tr class="hover:bg-slate-50 last:[&>td]:border-b-0">
                      @for (header of csvHeaders(); track header) {
                        <td class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500">{{ row[header] }}</td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

       </div>

    <div
  class="border-t border-slate-200 flex flex-col transition-all duration-300"
  [ngClass]="verticalState() === 'bottom' ? 'flex-[3]' : (verticalState() === 'split' ? 'flex-[1.5]' : 'flex-[1]')">
        <!-- PDF Template Upload -->
        <div class="px-4 py-3 bg-slate-50"  (click)="toggleVerticalExpand()" >
          <div class="flex items-center justify-between">
            <span class="text-[13px] font-medium text-slate-600"  >CSV Template:</span>
            <button
              class="inline-flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300"
              (click)="pdfInput3.click()">
              <input
                #pdfInput3
                type="file"
                accept=".pdf"
                (change)="onPdfFileSelect($event)"
                hidden
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>{{ pdfFile()?.name ? 'เปลี่ยน PDF' : 'อัปโหลด PDF' }}</span>
            </button>
          </div>
          @if (pdfFile()?.name) {
            <div class="mt-2 text-[12px] text-slate-500 truncate">{{ pdfFile()?.name }}</div>
          }
        </div>

        <!-- PDF Preview -->
        <div class="flex-1 px-4 py-3 bg-blue-50 overflow-auto">
          @if (pdfFile()?.name) {
            @if (isVerticalExpanded()) {
              <div class="flex items-center gap-2 text-[13px] text-blue-600 mb-2">
                <span class="font-medium">{{ pdfFile()?.name }}</span>
              </div>
            }
            <div class="flex-1 p-2 bg-white rounded border border-slate-200 min-h-0 h-full">
              <iframe 
                [src]="getPdfUrl()" 
                class="w-full h-full rounded"
                frameborder="0">
              </iframe>
            </div>
          }
        </div>
      </div>
    </div>
  </div>

  <!-- Right Panel: PDF Upload -->
  <div class="flex-1 bg-white rounded-2xl border-2 border-slate-200 flex flex-col overflow-hidden transition-all duration-300" *ngIf="isGenerating() || isGenerated()">
    <div class="flex-1 overflow-auto p-4 flex items-center justify-center">
      @if (!isGenerated()) {
        <!-- Upload UI -->
        <div
          class="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:bg-blue-500/[0.03]"
          [class.bg-blue-500/[0.03]]="isDraggingPdf()"
          (dragover)="onPdfDragOver($event)"
          (dragleave)="onPdfDragLeave($event)"
          (drop)="onPdfDrop($event)"
          (click)="pdfInput.click()">
          <input
            #pdfInput
            type="file"
            accept=".pdf"
            (change)="onPdfFileSelect($event)"
            hidden
          />
          <div class="flex flex-col items-center gap-3 text-center">
            <div class="relative flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
                stroke="#ef4444" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span class="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PDF</span>
            </div>
            <p class="text-base font-semibold text-slate-800 m-0">ยังไม่มีไฟล์ PDF</p>
            <p class="text-[13px] text-slate-400 m-0 leading-relaxed">กรุณาอัปโหลด PDF Template<br />เพื่อเริ่มการสร้างเอกสาร</p>
          </div>
        </div>
      } @else {
      <div class="w-full h-full flex flex-col">
        <!-- <div class="mb-2 text-[13px] text-slate-600">Generated PDF:</div> -->
        <div class="flex-1 bg-white rounded border border-slate-200 min-h-0">
          <iframe
            [src]="getPdfUrl()"
            class="w-full h-full rounded"
            frameborder="0">
          </iframe>
        </div>
      </div>
        <!-- <div class="flex flex-col items-center gap-2 text-center">
          <div class="relative flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
              stroke="#22c55e" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <polyline points="9 15 12 18 15 12"></polyline>
            </svg>
            <span class="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PDF</span>
          </div>
          <p class="text-sm font-medium text-slate-800 break-all">{{ pdfFile()?.name }}</p>
          <button
            class="mt-3 px-4 py-1.5 bg-transparent text-blue-500 border border-blue-500 rounded-lg text-[13px] cursor-pointer hover:bg-blue-500/5 transition-all duration-200"
            (click)="pdfInput2.click()">
            <input
              #pdfInput2
              type="file"
              accept=".pdf"
              (change)="onPdfFileSelect($event)"
              hidden
            />
            เปลี่ยนไฟล์
          </button>
        </div> -->
      }
    </div>
  </div>
</div> `,
  styleUrl: './home.component.scss',
})
export class HomeComponent {

  backgroundImage = signal<string>('../../assets/images/background2.png');
  safeBackgroundImage: SafeResourceUrl | null = null;

  // CSV state
  csvFile = signal<File | null>(null);
  csvHeaders = signal<string[]>([]);
  csvRows = signal<CsvRow[]>([]);
  csvRawContent = signal<string>('');
  isDraggingCsv = signal(false);

  // PDF state
  pdfFile = signal<File | null>(null);
  pdfPreviewFile = signal<File | null>(null);
  isDraggingPdf = signal(false);
  safePdfUrl: SafeResourceUrl | null = null;
  safePreviewPdfUrl: SafeResourceUrl | null = null;

  // UI state
  isVerticalExpanded = signal(false);
  isExpanded = signal(false);
  isGenerating = signal(false);
  isGenerated = signal(false);
  sourcePdfUrl = signal<string | null>(null);
  previewPdfUrl = signal<string | null>(null);
  verticalState = signal<'top' | 'split' | 'bottom'>('split');

  // Computed
  hasCsv = computed(() => this.csvFile() !== null);
  hasPdf = computed(() => this.pdfFile() !== null);
  canGenerate = computed(() => this.hasCsv() && this.hasPdf());
  private pdfBlobUrl: string | null = null;
  private previewPdfBlobUrl: string | null = null;
  private readonly sanitizer = inject(DomSanitizer);
  constructor(private pdfService: PdfGeneratorService) {
    this.loadBackgroundImage();
  }
  private loadBackgroundImage(): void {
    const imagePath = this.backgroundImage();
    this.safeBackgroundImage = this.sanitizer.bypassSecurityTrustStyle(
      `url('${imagePath}')`
    );
      console.log('Background loaded:', imagePath);
  }
  getDummyData(): any[] {
    return [
      { col1: 'Data 1', col2: 'Data 2', col3: 'Data 3' },
      { col1: 'Data 4', col2: 'Data 5', col3: 'Data 6' },
      { col1: 'Data 7', col2: 'Data 8', col3: 'Data 9' },
    ];
  }
  // === CSV Drag & Drop ===
  onCsvDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingCsv.set(true);
  }

  onCsvDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingCsv.set(false);
  }

  onCsvDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingCsv.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv')) {
        this.processCsvFile(file);
      }
    }
  }

  onCsvFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processCsvFile(input.files[0]);
    }
  }

  private processCsvFile(file: File): void {
    this.csvFile.set(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.csvRawContent.set(text);
      this.parseCsv(text);
    };
    reader.readAsText(file, 'utf-8');
  }

  private parseCsv(text: string): void {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    const headers = this.parseCsvLine(lines[0]);
    this.csvHeaders.set(headers);

    const rows: CsvRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      const row: CsvRow = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row);
    }
    this.csvRows.set(rows);
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // === PDF Drag & Drop ===
  onPdfDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingPdf.set(true);
  }

  onPdfDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingPdf.set(false);
  }

  onPdfDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingPdf.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        this.pdfFile.set(file);
      }
    }
  }
getPdfUrl(): SafeResourceUrl {
  if (!this.pdfFile()) return '';
  return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.pdfFile()!));
}


onPdfFileSelect(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    this.revokeUrl(this.pdfBlobUrl);
    this.pdfFile.set(file);
    this.pdfBlobUrl = URL.createObjectURL(file);
    // this.safePreviewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfBlobUrl);
  }
}

  private revokeUrl(url: string | null) {
    if (url) URL.revokeObjectURL(url);
  }
  // === Actions ===
  toggleExpand(): void {
    this.isExpanded.update((v) => !v);
  }

  toggleVerticalExpand(): void {
    this.verticalState.update((v) =>
      v === 'top' ? 'split' : v === 'split' ? 'bottom' : 'top'
    );
  }

  deleteDocument(): void {
    console.log('Deleting document...');
    this.csvFile.set(null);
    this.csvHeaders.set([]);
    this.csvRows.set([]);
    this.csvRawContent.set('');
    this.pdfFile.set(null);
    this.safePreviewPdfUrl = null;
    this.sourcePdfUrl.set(null);
    this.previewPdfUrl.set(null);
    this.isGenerating.set(false);
    this.isGenerated.set(false);
  }

  generatePdf(): void {
    if (!this.canGenerate()) return;

  this.isGenerating.set(true);
    const csvFile = this.csvFile()!;
    const pdfFile = this.pdfFile()!;

    this.pdfService.generatePdf(csvFile, pdfFile).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.previewPdfUrl.set(url);
        this.safePreviewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.isGenerating.set(false);
        this.isGenerated.set(true);


        // Auto download
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = 'generated-output.pdf';
        // a.click();
      },
      error: (err) => {
        console.error('Error generating PDF:', err);
        this.isGenerating.set(false);
        alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
      },
    });
  }
}
