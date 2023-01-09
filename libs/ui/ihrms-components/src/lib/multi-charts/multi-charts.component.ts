import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, OnChanges,
  Output, SimpleChanges, TemplateRef
} from '@angular/core';
import { CONSTANTS } from '@ihrms/shared';
import { Subject } from 'rxjs';

@Component({
  selector: 'ihrms-multi-charts',
  templateUrl: './multi-charts.component.html',
  styleUrls: ['./multi-charts.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MultiChartsComponent implements AfterViewInit, OnChanges {

  @Input() set cardRadius(radius: number) {
    if(radius) {
      this._radius = radius;
    }
  };

  @Input() palette: string | undefined;

  @Input() compData!: any;

  @Input() filterConfig!: any;

  @Input() filters!: boolean;

  @Input() title: string | undefined;

  @Input() gridComponentFullHeight!: any;

  @Input() gridHeaderTemplate!: TemplateRef<any>;

  @Input() flexStart!: boolean;

  @Input() updateMultiChart: Subject<any> = new Subject();

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onClickHandler: EventEmitter<any> = new EventEmitter<any>();

  public _radius: number | undefined;

  onClickHandlerFun($event: any) {
    this.onClickHandler.emit($event);
  }

  onFiltersClickHandlerFun($event: any) {
    this.onClickHandler.emit($event);
  }

  getHeight(offsetHeight: number | undefined | any) {
    return offsetHeight - 15;
  }

  constructor(
    private cdRef: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
    this.updateMultiChart.subscribe(val => {
      this.cdRef.detectChanges();
      this.onClickHandler.emit({ action: CONSTANTS.REFRESH, component: this, comp_name: CONSTANTS.IHRMS_MULTI_CHART_COMPONENT });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.cdRef.detectChanges();
  }

  onGridReadyOut(event: any) {
    this.onClickHandler.emit(event);
  }

}
