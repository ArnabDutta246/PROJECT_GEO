import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pie-chart-container">
      <div class="pie-chart-wrapper">
        <svg [attr.width]="size" [attr.height]="size" [attr.viewBox]="'0 0 ' + size + ' ' + size" class="pie-chart-svg" preserveAspectRatio="xMidYMid meet">
          <g [attr.transform]="'translate(' + (size/2) + ',' + (size/2) + ')'">
            <path
              *ngFor="let segment of segments; let i = index"
              [attr.d]="segment.path"
              [attr.fill]="segment.color"
              [attr.stroke]="strokeColor"
              [attr.stroke-width]="strokeWidth"
              class="pie-segment"
              [attr.data-label]="segment.label"
              [attr.data-value]="segment.value"
            />
          </g>
          <g [attr.transform]="'translate(' + (size/2) + ',' + (size/2) + ')'">
            <text
              *ngIf="showCenterLabel"
              text-anchor="middle"
              dominant-baseline="middle"
              [attr.font-size]="centerFontSize"
              [attr.fill]="centerTextColor"
              [attr.font-weight]="'bold'"
              class="center-label"
            >
              {{ centerLabel }}
            </text>
          </g>
        </svg>
      </div>
      <div class="pie-chart-legend" *ngIf="showLegend">
        <div *ngFor="let item of data" class="legend-item">
          <span class="legend-color" [style.background-color]="item.color || getDefaultColor(item)"></span>
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">{{ item.value | number:'1.0-0' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pie-chart-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
    }

    .pie-chart-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    .pie-chart-svg {
      display: block;
      width: auto;
      height: auto;
    }

    .pie-segment {
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .pie-segment:hover {
      opacity: 0.8;
    }

    .center-label {
      pointer-events: none;
    }

    .pie-chart-legend {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      width: 100%;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      display: inline-block;
    }

    .legend-label {
      flex: 1;
      color: #333;
    }

    .legend-value {
      color: #666;
      font-weight: bold;
    }
  `]
})
export class PieChartComponent implements OnChanges, AfterViewInit {
  @Input() data: PieChartData[] = [];
  @Input() size: number = 200;
  @Input() showLegend: boolean = true;
  @Input() showCenterLabel: boolean = false;
  @Input() centerLabel: string = '';
  @Input() centerFontSize: number = 14;
  @Input() centerTextColor: string = '#333';
  @Input() strokeColor: string = '#fff';
  @Input() strokeWidth: number = 2;
  @Input() defaultColors: string[] = ['#0066cc', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14'];

  segments: Array<{ path: string; color: string; label: string; value: number }> = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['size']) {
      this.updateChart();
    }
  }

  ngAfterViewInit(): void {
    this.updateChart();
    this.cdr.detectChanges();
  }

  private updateChart(): void {
    if (!this.data || this.data.length === 0) {
      this.segments = [];
      return;
    }

    // Filter out zero values
    const validData = this.data.filter(item => item.value > 0);
    if (validData.length === 0) {
      this.segments = [];
      return;
    }

    const total = validData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      this.segments = [];
      return;
    }

    // Use a smaller radius to ensure the chart fits within the SVG with padding
    const padding = 10;
    const radius = (this.size / 2) - padding;
    let currentAngle = -Math.PI / 2; // Start from top
    let accumulatedAngle = 0;

    this.segments = validData.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 2 * Math.PI;
      const endAngle = currentAngle + angle;
      accumulatedAngle += angle;

      // Calculate start and end points on the circle
      const x1 = radius * Math.cos(currentAngle);
      const y1 = radius * Math.sin(currentAngle);
      const x2 = radius * Math.cos(endAngle);
      const y2 = radius * Math.sin(endAngle);

      // Determine if we need the large arc flag
      const largeArcFlag = percentage > 0.5 ? 1 : 0;

      // Create the path: Move to center, line to start point, arc to end point, close path
      const path = `M 0 0 L ${x1.toFixed(4)} ${y1.toFixed(4)} A ${radius.toFixed(4)} ${radius.toFixed(4)} 0 ${largeArcFlag} 1 ${x2.toFixed(4)} ${y2.toFixed(4)} Z`;

      const color = item.color || this.getDefaultColor(item, index);

      // Update current angle for next segment
      currentAngle = endAngle;

      return {
        path,
        color,
        label: item.label,
        value: item.value
      };
    });

    // Ensure the circle is closed - adjust the last segment if needed
    if (this.segments.length > 0 && Math.abs(accumulatedAngle - 2 * Math.PI) > 0.01) {
      const lastIndex = this.segments.length - 1;
      const lastItem = validData[lastIndex];
      const lastPercentage = lastItem.value / total;
      
      // Recalculate the last segment to ensure it closes the circle
      const adjustedAngle = 2 * Math.PI - (accumulatedAngle - (lastPercentage * 2 * Math.PI));
      const adjustedEndAngle = currentAngle - (lastPercentage * 2 * Math.PI) + adjustedAngle;
      
      const startAngle = currentAngle - (lastPercentage * 2 * Math.PI);
      const x1 = radius * Math.cos(startAngle);
      const y1 = radius * Math.sin(startAngle);
      const x2 = radius * Math.cos(adjustedEndAngle);
      const y2 = radius * Math.sin(adjustedEndAngle);
      
      const largeArcFlag = adjustedAngle > Math.PI ? 1 : 0;
      this.segments[lastIndex].path = `M 0 0 L ${x1.toFixed(4)} ${y1.toFixed(4)} A ${radius.toFixed(4)} ${radius.toFixed(4)} 0 ${largeArcFlag} 1 ${x2.toFixed(4)} ${y2.toFixed(4)} Z`;
    }
  }

  getDefaultColor(item: PieChartData, index: number = 0): string {
    return this.defaultColors[index % this.defaultColors.length];
  }
}

