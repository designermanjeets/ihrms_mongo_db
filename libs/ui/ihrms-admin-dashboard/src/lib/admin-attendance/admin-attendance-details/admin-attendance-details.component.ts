import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { BehaviorSubject, Subscription } from 'rxjs';
import * as moment from 'moment';
import { IhrmsGridComponent } from '@ihrms/ihrms-grid';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AdminAttendanceService, GQL_ATTENDANCES_REQUESTS, GQL_ATTENDANCE_TYPE_APPROVE_REJECT, GQL_TODAYS_ATTENDANCES_DAY_ALL_USERS } from '../_services/admin-attendance.service';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { CONSTANTS } from '@ihrms/shared';
import { IhrmsDialogComponent, TodaysInoutComponent } from '@ihrms/ihrms-components';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { IhrmsAdminDashboardService } from '../../_services/ihrms-admin-dashboard.service';
import { Apollo } from 'apollo-angular';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ihrms-admin-attendance-details',
  templateUrl: './admin-attendance-details.component.html',
  styleUrls: ['./admin-attendance-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAttendanceDetailsComponent implements OnInit {

  gridsterOptions: GridsterConfig;
  cardSize = 500;
  gridLoaded = false;
  dashboardItemsAttendanceDetails: Array<GridsterItem> | any;
  dashboardItemsAttendanceRequests: Array<GridsterItem> | any;
  gridResize: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  selectedIndex! : number;

  filterConfig!: any;

  attendanceTypeReqRowData: any;
  updateComponent$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  updateComponentAttendance$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  sub!: Subscription;

  constructor(
    private _ads: AdminAttendanceService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    public dialog: MatDialog,
    private _ihrmsads: IhrmsAdminDashboardService,
    private apollo: Apollo,
    private toastrService: ToastrService,
  ) {
    this.gridsterOptions = this._ads.getGridsterOptions(this.cardSize, this);

    this.filterConfig = { // Default Range
      filterForm: false
    };
  }

  ngOnInit(): void {

    this.setupDashboardItems();

    this.route.queryParams.subscribe(params => {
      this.selectedIndex = +params['tab'];
    });

    this.getAttendanceAllToday();

    this.getAttendanceRequests();

  }

  setupDashboardItems() {

    this.dashboardItemsAttendanceDetails = [
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 1, rows: 1, y: 0, x: 0 },
        inputs: {
          title: '',
          cardRadius: 0,
          columnFit: true,
          columnDefs: [
            { field: 'date', sort: 'desc', headerName: 'Date', cellRenderer: (data: any) => moment(data.value).format('MM/DD/YYYY') },
            { field: 'username', headerName: 'Employee' },
            { field: 'punchIn', headerName: 'PunchIn' },
            { field: 'punchOut', headerName: 'PunchOut' },
            { field: 'userShiftName', headerName: 'Shift' },
            { field: 'totalHours', headerName: 'Production', valueFormatter: (params: any) => params.value && params.value.toFixed(2) },
            { field: 'overtime', headerName: 'Overtime', valueFormatter: (params: any) => params.value && params.value.toFixed(2) },
          ],
          rowData: [],
          pagination: true,
          paginationAutoPageSize: true,
          viewAll: false,
          updateGridFromOutside: this.updateComponentAttendance$
        },
        flatItem: true,
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event']}
        }
      }
    ];

    this.dashboardItemsAttendanceRequests = [
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 1, rows: 1, y: 0, x: 0 },
        inputs: {
          title: '',
          cardRadius: 0,
          columnDefs: this._ads.getAttendanceRequestColDefs(this.outputActions, this),
          rowData: this.attendanceTypeReqRowData,
          pagination: true,
          paginationAutoPageSize: true,
          columnFit: true,
          viewAll: false,
          updateGridFromOutside: this.updateComponent$
        },
        flatItem: true,
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event'] }
        }
      }
    ];

  }

  getCurrentZoneTime(d: any) {
    return moment(d).format('MM/DD/YYYY');
  }

  outputActions(event: any) {
    if(event.action === CONSTANTS.CHECK_CIRCLE || event.action === CONSTANTS.CANCEL) {

      const dialogRef = this.openDialog(event.params.data, event.action);

      dialogRef.componentInstance.dialogEventEmitter.subscribe((result: any) => {

        if(result) {
          if(result.action === CONSTANTS.FORM_OBJECT_EVENT) {
            // this._ihrmsads.getSelectOptions(dialogRef.componentInstance?.controlsObj, this.userOptions, 'toManagerID', 'username', 'username');
            (result.value as FormGroup).get('user')?.patchValue(event.params.data?.user?.username);
            (result.value as FormGroup).get('toManagerID')?.patchValue(event.params.data?.toManager?.username);
          }
          if(result.action === CONSTANTS.FORM_SUBMIT_EVENT) {
            const payload = {
              ...result.value,
              status: event.action === CONSTANTS.CHECK_CIRCLE ? CONSTANTS.Approved : CONSTANTS.Rejected,
              id: result.value._id,
              userId: result.value.user._id
            }
            this.apollo.mutate({ mutation: GQL_ATTENDANCE_TYPE_APPROVE_REJECT, variables: payload, })
              .pipe(map((res: any) => res?.data.approveRejectAttendanceRequest))
              .subscribe((val: any) => {
                if(val) {
                  this.toastrService.success( `Success`, `Data Added Successfully!`, { } );
                  this.dialog.closeAll();
                  this.getAttendanceRequests();
                }
              });
          }
        }

      });
    }  
  }
  
  openDialog(rowData: any, action: string): any {
    
    const fetchControls = this._ads.getDynamicControls();

    return this.dialog.open(IhrmsDialogComponent, {
      data: {
        title: action === CONSTANTS.CHECK_CIRCLE ? 'Approve Attendance Request': 'Reject Attendance Request',
        controls: fetchControls,
        formConfig: {
          okButtonText: action === CONSTANTS.CHECK_CIRCLE ? 'Confirm': 'Reject',
          patchValue: rowData,
          readOnly: true,
          closeFromOutside: true
        }
      },
      panelClass: 'ihrms-dialog-overlay-panel',
    });

  }

  dynamicCompClickHandler(event: any) {
    console.log(event);
    if(event.comp_name === CONSTANTS.IHRMS_GRID_COMPONENT && event.action === CONSTANTS.ROW_CLICKED) {
      const dialogRef = this.dialog.open(TodaysInoutComponent, {
        panelClass: 'attendance-details',
        data: event.event?.data
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    }
  }

  getAttendanceAllToday() {
    this.sub = this.apollo.watchQuery<any, any>({ 
      query: GQL_TODAYS_ATTENDANCES_DAY_ALL_USERS, 
      variables: { 
        query: { 
          limit: 100,
          dates: {
            gte: moment().startOf('year')
          }
        }
      }})
      .valueChanges
      .pipe(map((data: any) => data?.data?.getAttendancesByDayWiseAllUsers))
      .subscribe(val => {
        if(val) {
          this.updateComponentAttendance$.next({ action: CONSTANTS.UPDATE, rowData: val });
        }
      });
  }

  getAttendanceRequests() {
    this.sub = this.apollo.watchQuery<any, any>({ 
      query: GQL_ATTENDANCES_REQUESTS, 
      variables: { 
        query: { 
          limit: 100,
          dates: {
            // gte: moment(moment.now()).format('DD-MM-YYYY') // Need All Previous "Pending" Ones
          }
        }
      }})
      .valueChanges
      .pipe(map((data: any) => data?.data?.getAttendanceRequests))
      .subscribe(val => {
        if(val) {
          this.updateComponent$.next({ action: CONSTANTS.UPDATE, rowData: val });
        }
      });
  }

  uploadAttendance(selectedFiles: any) {
    const formData = new FormData();
    formData.append('file', selectedFiles);
    this._ihrmsads.createEntityWithAction(CONSTANTS.TITLES.Attendance, 'UploadExcel', formData)
      .pipe(map((data: any) => data?.result))
      .subscribe(val => {
        if(val) {
          console.log(val);
          this.cdRef.detectChanges();
        }
      });
  }

  onFilterSubmit(event: any) {
    console.log(event);
    if(event.component && event.comp_name === CONSTANTS.IHRMS_FILTERS_COMPONENT) {
      if(event.action === CONSTANTS.UPLOAD_ANY) {
        this.uploadAttendance(event?.selectedFiles[0]);
      }
      if(event.action === CONSTANTS.FILTER_SEARCH) {
        // 
      }
    }
  }

  onTabChanged(event: MatTabChangeEvent) {
    this.selectedIndex = event.index;
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { tab: this.selectedIndex }});
  }

}

