import { Component, signal, computed ,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {BarcodeService } from '../services/query/api/barcode.service';
import { FormsModule } from '@angular/forms';
// import { ImgBG} from '../../../assets/BG_Barcode.png';
interface CsvRow {
  [key: string]: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  template: `<!-- home.component.html -->
 
<div class="flex gap-6 p-8 h-screen bg-slate-100 box-border overflow-hidden" style="background-image: url('assets/images/background.png')";>

  <!-- Left Panel: CSV Import & Preview -->
  <div class="bg-white rounded-2xl border-2 border-slate-200 flex flex-col overflow-hidden transition-all duration-300 opacity-90 min-h-0"

  [ngClass]="{
    'flex-[7]': horizonState() === 'left',
    'flex-[5]': horizonState() === 'split',
    'flex-[3]': horizonState() === 'right'
  }"
>
    <!-- Header Buttons -->
    <div class="flex justify-between items-center px-4 py-3 border-b border-slate-200 shrink-0" >
      <div class="flex gap-2" >
        <button
          (click)="toggleHorizonState()"
          [disabled]="!canGenerate() "
          [class]="isGenerated() 
            ? 'inline-flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 bg-blue-500 text-white '
            : 'inline-flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 bg-slate-400 text-white hover:bg-slate-500'"
          [title]="isExpanded() ? 'ย่อขนาด' : 'ขยายขนาด'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- @if (isExpanded() { -->
            @if (isExpanded() && isGenerating()) {

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

            <span>
              {{
                horizonState() === 'left' ? 'ขยายซ้าย' :
                horizonState() === 'split' ? 'เท่ากัน' :
                'ขยายขวา'
              }}
            </span>


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
        <button
          *ngIf="selectedMode() === 'dynamic'"
          [class]="enableDynamicPDF() 
            ? 'inline-flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 bg-emerald-500 text-white hover:bg-emerald-600'
            : 'inline-flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 bg-slate-400 text-white hover:bg-slate-500'"
          (click)="toggleDynamicPDF()">
          <span>{{ enableDynamicPDF() ? 'PDF: ON' : 'PDF: OFF' }}</span>
        </button>
      </div>
      <!-- <select
        class="px-3 py-2 rounded-lg border border-slate-300 text-[13px] bg-white text-slate-700"
        [ngModel]="selectedMode()"
        (ngModelChange)="onModeChange($event)">
        <option value="PPPP">PPPP</option>
        <option value="POST">POST</option>
        <option value="FRD">FRD</option>
        </select> -->
      <button
        class="inline-flex items-center gap-1.5 px-5 py-2 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-px hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        (click)="generatePdf()"
        
        [disabled]="!canGenerate() || isGenerating() ">
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
    <div class="w-full flex flex-col min-h-0 h-full">
      <!-- Top Half: CSV Content -->
      <div class="min-h-0 flex flex-col border-b border-slate-200 transition-all duration-300"
      [ngClass]="verticalState() === 'top' ? 'flex-[6]' : (verticalState() === 'split' ? 'flex-[5]' : 'flex-[4]')" >   
               <div  (click)="toggleVerticalExpand()"
          class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 hover:bg-slate-100">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <span class="text-[13px] font-medium text-slate-600 shrink-0">CSV Template:</span>
            @if (csvFile()?.name) {
              <div class="flex items-center gap-2 text-[13px] font-medium text-blue-500 min-w-0">
                <!-- <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg> -->
                <span class="truncate">{{ csvFile()?.name }}</span>
              </div>
            }
          </div>
          <button
              class="inline-flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300"
              (click)="$event.stopPropagation(); csvInput.click()">
              <input
                #csvInput
                type="file"
                accept=".csv"
                (change)="onCsvFileSelect($event)"
                hidden
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>{{ csvFile()?.name ? 'เปลี่ยน CSV' : 'อัปโหลด CSV' }}</span>
            </button>
       </div>
      <div class="flex-1 min-h-0 overflow-auto p-4">
        <ng-container *ngIf="!hasCsv(); else csvPreview">
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
            <input #csvInput type="file" accept=".csv" (change)="onCsvFileSelect($event)" hidden />
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
        </ng-container>

        <ng-template #csvPreview>
          <!-- CSV Preview Table -->
          <div class="flex flex-col min-h-0 h-full">

            <div class="flex-1 min-h-0 overflow-auto rounded-lg border border-slate-200">
              <table class="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th *ngFor="let header of csvHeaders()"
                        class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 bg-slate-50 font-semibold text-slate-800 sticky top-0 z-[1]">
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let row of csvRows()" class="hover:bg-slate-50">
                    <td *ngFor="let header of csvHeaders()"
                        class="px-3 py-2 text-left border-b border-r border-slate-200 last:border-r-0 text-slate-500 whitespace-nowrap">
                      {{ row[header] }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ng-template>
      </div>

       </div>

    <div
  class="border-t border-slate-200 flex flex-col min-h-0 transition-all duration-300" *ngIf="enableDynamicPDF()" 
  [ngClass]="verticalState() === 'bottom' ? 'flex-[6]' : (verticalState() === 'split' ? 'flex-[5]' : 'flex-[4]')">
        <!-- CSV Template Upload -->
        <div class="px-4 py-3 bg-slate-50" (click)="toggleVerticalExpand()" >
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span class="text-[13px] font-medium text-slate-600 shrink-0">PDF Template:</span>
              @if (pdfFile()?.name) {
                <div class="flex items-center gap-2 text-[13px] font-medium text-blue-500 min-w-0">
                  <span class="truncate">{{ pdfFile()?.name }}</span>
                </div>
              }
            </div>
            <button
              class="inline-flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300"
              (click)="$event.stopPropagation(); pdfInput3.click()">
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
          <!-- @if (pdfFile()?.name) {
            <div class="mt-2 text-[12px] text-slate-500 truncate">{{ pdfFile()?.name }}</div>
          } -->
        </div>

        <!-- PDF Preview -->
        <div class="flex-1 px-4 py-3 bg-blue-50 overflow-auto"
     (dragover)="onPdfDragOver($event)"
     (dragleave)="onPdfDragLeave($event)"
     (drop)="onPdfDrop($event)">
    <ng-container *ngIf="!pdfFile(); else pdfPreview">
      <!-- PDF Drop Zone -->
      <div
        class="border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 h-full w-full hover:border-blue-500 hover:bg-blue-500/[0.05]"
        [class.border-blue-500]="isDraggingPdf()"
        [class.bg-blue-500/[0.05]]="isDraggingPdf()"
        [class.border-[3px]]="isDraggingPdf()"
        (click)="pdfInput3.click()">
        <div class="flex flex-col items-center gap-3 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p class="text-base font-semibold text-slate-800 m-0">ลากไฟล์ PDF มาวางที่นี่</p>
          <p class="text-[13px] text-slate-400 m-0">หรือคลิกเพื่อเลือกไฟล์</p>
        </div>
      </div>
    </ng-container>

    <ng-template #pdfPreview>
      <div class="flex-1 p-2 bg-white rounded border border-slate-200 min-h-0 h-full">
        <iframe
          [src]="getPdfUrl()"
          class="w-full h-full rounded"
          frameborder="0">
        </iframe>
      </div>
    </ng-template>
  </div>
      </div>
    </div>
  </div>

  <!-- Right Panel: PDF Upload -->

<div
  class="bg-white rounded-2xl border-2 border-slate-200 flex flex-col transition-all duration-300"
  *ngIf="isGenerating() || isGenerated()"
  [ngClass]="{
    'flex-[3]': horizonState() === 'left',
    'flex-[5]': horizonState() === 'split',
    'flex-[7]': horizonState() === 'right'
  }"
>

    <div class="flex-1 overflow-auto p-4 flex items-center justify-center">
      @if (!isGenerated()) {
        <!-- Upload UI -->
        <div
          class="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:bg-blue-500/[0.03]"
          [class.bg-blue-500/[0.03]]="isDraggingPdf()"
          (dragover)="onPdfDragOver($event)"
          (dragleave)="onPdfDragLeave($event)"
          (drop)="onPdfDrop($event)"
          >

          <div class="flex flex-col items-center gap-3 text-center">
            <div class="relative flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
                stroke="#ef4444" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span class="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PDF</span>
            </div>
            <!-- <p class="text-base font-semibold text-slate-800 m-0">ยังไม่มีไฟล์ PDF</p>
            <p class="text-[13px] text-slate-400 m-0 leading-relaxed">กรุณาอัปโหลด PDF Template<br />เพื่อเริ่มการสร้างเอกสาร</p> -->
          </div>
        </div>
      } @else {
      <div class="w-full h-full flex flex-col">
        <!-- <div class="mb-2 text-[13px] text-slate-600">Generated PDF:</div> -->
        <div class="flex-1 bg-white rounded border border-slate-200 min-h-0">
          
          <iframe
            *ngIf="isGenerated()"
            [src]="getPreviewPdf()"
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

  private readonly barcodeService = inject(BarcodeService);
  enableDynamicPDF = signal(false);
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
  // previewFile = signal<File | null>(null);
  verticalState = signal<'top' | 'split' | 'bottom'>('split');

  // Computed
  hasCsv = computed(() => this.csvFile() !== null);
  hasPdf = computed(() => this.pdfFile() !== null);
  // canGenerate = computed(() => this.hasCsv() && this.hasPdf());
  canGenerate = computed(() => this.hasCsv() ); 

 horizonState = signal<'left' | 'split' | 'right'>('split');

  // setLeft() { this.horizonState = 'left'; }
  // setSplit() { this.horizonState = 'split'; }
  // setRight() { this.horizonState = 'right'; }

  modeOptions = ['dynamic', 'data'] as const;
  selectedMode = signal<'dynamic' | 'data'>('dynamic');
  onModeChange(mode: 'dynamic' | 'data'): void {
  this.selectedMode.set(mode);

  }
  // if (mode === 'data') {
  // this.enableDynamicPDF.set(false);
  // }
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
getPreviewPdf(): SafeResourceUrl {
  if (!this.safePdfUrl) return '';
  return this.safePdfUrl;
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

  toggleHorizonState(): void {
    this.horizonState.update(state =>
      state === 'left'
        ? 'split'
        : state === 'split'
        ? 'right'
        : 'left'
    );

    console.log('Horizon state:', this.horizonState());
  }

  toggleVerticalExpand(): void {
    this.verticalState.update((v) =>
      v === 'top' ? 'split' : v === 'split' ? 'bottom' : 'top'
    );
  }
toggleDynamicPDF(): void {
  console.log('Toggling Dynamic PDF:', !this.enableDynamicPDF());
  this.enableDynamicPDF.update(v => !v);
}

  //   toggleDynamicPDF() {
  //   this.enableDynamicPDF.update(current => !current); // Updates the state reactively
  // }
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
      if(this.enableDynamicPDF()){
      this.barcodeService.barcodePreviewFormPost(pdfFile, csvFile , 16).subscribe({
        next: (blob: any) => {
          const url = URL.createObjectURL(blob);
          this.previewPdfUrl.set(url);
          this.safePreviewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.isGenerated.set(true);
          this.isGenerating.set(false);
          // const a = document.createElement('a');
          // a.href = url;
          // a.download = 'generated-output.pdf';
          // a.click();
        }
      });
    }else  {
      this.barcodeService.barcodeGeneratePdfPost(csvFile).subscribe({
        next: (blob: any) => {
          const url = URL.createObjectURL(blob);
          this.previewPdfUrl.set(url);
          this.safePreviewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.isGenerating.set(false);
          this.isGenerated.set(true);
        },
        error: (err) => {
          console.error('Error generating PDF:', err);
          this.isGenerating.set(false);
        }
      });

    }

  }
}