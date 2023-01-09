import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CONSTANTS } from '@ihrms/shared';
import * as moment from 'moment';
import { UploaderOptions, UploadInput, UploadOutput } from 'ngx-uploader';

@Component({
  selector: 'ihrms-filters',
  templateUrl: './ihrms-filters.component.html',
  styleUrls: ['./ihrms-filters.component.scss']
})
export class IhrmsFiltersComponent implements AfterViewInit {

  @Input() filterConfig!: any;
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onFiltersClickHandler: EventEmitter<any> = new EventEmitter<any>();

  filterForm!: FormGroup;

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('uploader') uploader!: ElementRef;
  selectedFile: File | undefined;

  options!: UploaderOptions;
  uploadInput!: EventEmitter<UploadInput>;

  constructor(
    private fb: FormBuilder, 
    private cdRef: ChangeDetectorRef
  ) {
    
    this.options = { concurrency: 1, maxUploads: 3, maxFileSize: 1000000 };
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
  }

  ngAfterViewInit() {
    const start = this.filterConfig?.start && new Date(this.filterConfig?.start).toISOString();
    const end = this.filterConfig?.end && new Date(this.filterConfig?.end).toISOString();
    this.filterForm = this.fb.group({
      start: [start || ''],
      end: [end || ''],
      textFilter: [''],
      attendanceFilter: [''],
    });
    this.cdRef.detectChanges();
  }

  onSubmit() {
    this.onFiltersClickHandler.emit({action: CONSTANTS.FILTER_SEARCH, filterForm: this.filterForm, component: this, comp_name: CONSTANTS.IHRMS_FILTERS_COMPONENT });
  }

  onAddFun() {
    this.filterConfig?.uploadButton && this.uploader?.nativeElement.click();
    this.onFiltersClickHandler.emit({action: CONSTANTS.ADD_ANY, component: this, comp_name: CONSTANTS.IHRMS_FILTERS_COMPONENT, text: this.filterConfig?.addButtonText});
  }

  onUploadOutput(uploadOutput: UploadOutput) {
    this.onFiltersClickHandler.emit({ action: CONSTANTS.UPLOAD_ANY, component: this, comp_name: CONSTANTS.IHRMS_FILTERS_COMPONENT, uploadOutput });
  }
 
  onSwapClick() {
    this.onFiltersClickHandler.emit({action: CONSTANTS.FILTER_SWAP_DUTY, component: this, comp_name: CONSTANTS.IHRMS_FILTERS_COMPONENT });
  }
}
