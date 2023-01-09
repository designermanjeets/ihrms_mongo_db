import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import * as _moment from 'moment';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'ihrms-nextpayroll',
  templateUrl: './nextpayroll.component.html',
  styleUrls: ['./nextpayroll.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NextpayrollComponent implements OnInit{

  @Input() set cardRadius(radius: number) {
    if(radius) {
      this._radius = radius;
    }
  };

  @Input() palette: string | undefined;

  @Input() compData: any | undefined;

  @Input() title: string | undefined;

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onClickHandler: EventEmitter<any> = new EventEmitter<any>();

  public _radius: number | undefined;

  counter: any = {};

  public randomLoader = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);

  constructor(
    private ngxService: NgxUiLoaderService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {

    this.ngxService.startLoader(this.randomLoader);

    this.clockUpdate();

    setInterval(this.clockUpdate.bind(this), 1000);

    setTimeout( () => this.ngxService.stopLoader(this.randomLoader), 1000);

  }

  clockUpdate() {

    const today = _moment();
    const lastDay = _moment().endOf("month");

    this.counter = {
      today : today,
      lastDay : lastDay,
      duration : _moment.duration(lastDay.diff(today))
    }

    this.cdRef.detectChanges();

  }

}
