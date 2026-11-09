import { Component, Input, Output, EventEmitter, signal, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container relative" (click)="$event.stopPropagation()">
      <!-- Items per page with custom popup menu matching screenshot -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-[var(--mu)] font-medium">Items per page:</span>
        <div class="relative w-[68px]">
          <button 
            type="button"
            (click)="toggleMenu($event)" 
            class="pagination-select-btn"
            [class.open]="isMenuOpen()"
            [attr.aria-expanded]="isMenuOpen()"
            aria-label="Select items per page">
            <span>{{ pageSize }}</span>
            <i class="mi text-sm leading-none text-[var(--mu)]">{{ isMenuOpen() ? 'arrow_drop_up' : 'arrow_drop_down' }}</i>
          </button>

          <!-- Upward Floating Popover matching Screenshot media_1794118189750_c6221297.jpg -->
          @if (isMenuOpen()) {
            <div class="pagination-popover">
              @for (option of pageSizeOptions; track option) {
                <button 
                  type="button"
                  (click)="selectPageSize(option)"
                  [class.selected]="pageSize === option"
                  class="pagination-popover-item">
                  {{ option }}
                </button>
              }
            </div>
          }
        </div>
      </div>

      <!-- Range indicator matching: 1 - 10 of 38 -->
      <span class="text-xs font-medium text-[var(--hd)] min-w-[70px] text-center">
        {{ startItem }} - {{ endItem }} of {{ totalItems }}
      </span>

      <!-- Navigation Arrows -->
      <div class="flex items-center gap-1">
        <button 
          type="button"
          class="page-btn" 
          (click)="goToPage(1)" 
          [disabled]="currentPage <= 1" 
          title="First page">
          <i class="mi text-base">first_page</i>
        </button>
        <button 
          type="button"
          class="page-btn" 
          (click)="goToPage(currentPage - 1)" 
          [disabled]="currentPage <= 1" 
          title="Previous page">
          <i class="mi text-base">chevron_left</i>
        </button>
        <button 
          type="button"
          class="page-btn" 
          (click)="goToPage(currentPage + 1)" 
          [disabled]="currentPage >= totalPages" 
          title="Next page">
          <i class="mi text-base">chevron_right</i>
        </button>
        <button 
          type="button"
          class="page-btn" 
          (click)="goToPage(totalPages)" 
          [disabled]="currentPage >= totalPages" 
          title="Last page">
          <i class="mi text-base">last_page</i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes popIn {
      from { opacity: 0; transform: translateY(4px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-popIn {
      animation: popIn 0.12s ease-out;
    }
  `]
})
export class TablePaginationComponent {
  private el = inject(ElementRef);

  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  isMenuOpen = signal<boolean>(false);

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / (this.pageSize || 10)));
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    if (this.totalItems === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isMenuOpen.update(v => !v);
  }

  selectPageSize(size: number) {
    this.isMenuOpen.set(false);
    if (size !== this.pageSize) {
      this.pageSizeChange.emit(size);
    }
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }
}

