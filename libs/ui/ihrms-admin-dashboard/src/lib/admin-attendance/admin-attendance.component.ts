import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,EventEmitter, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { BehaviorSubject, Observable, Subject, Subscription, zip } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import * as moment from 'moment';
import { GQL_EMPLOYEES, IhrmsDialogComponent, MultiChartsComponent } from '@ihrms/ihrms-components';
import { IhrmsGridComponent } from '@ihrms/ihrms-grid';
import { CONSTANTS } from '@ihrms/shared';
import { AdminAttendanceService,GQL_UPLOAD_ATTENDANCE_DETAILS, GQL_ATTENDANCES_REQUESTS, GQL_ATTENDANCE_TIME_CORRECTIONS, GQL_ATTENDANCE_TYPE_APPROVE_REJECT, GQL_ATTENDANCE_UPLOAD, GQL_TODAYS_ATTENDANCES, GQL_TODAYS_ATTENDANCES_DAY_ALL_USERS, GQL_TODAYS_ATTENDANCES_DAY_ALL_USERS_AVG, GQL_TODAYS_ATTENDANCES_OVERVIEW,GQL_ATTENDANCE_CORRECTION_CREATE } from './_services/admin-attendance.service';
import { map } from 'rxjs/operators';
import { UploadFile, UploadInput, UploadOutput } from 'ngx-uploader';
import { IhrmsAdminDashboardService } from '../_services/ihrms-admin-dashboard.service';
import { Apollo } from 'apollo-angular';
import { GridApi } from 'ag-grid-community';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '@ihrms/shared';

@Component({
  selector: 'ihrms-admin-attendance',
  templateUrl: './admin-attendance.component.html',
  styleUrls: ['./admin-attendance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAttendanceComponent implements OnInit, AfterViewInit {

  highcharts: typeof Highcharts = Highcharts;
  gridsterOptions: GridsterConfig;
  cardSize = 500;
  gridLoaded = false;
  dashboardItems: Array<GridsterItem> | any;
  gridResize: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  updateComponent$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  multiChartData: any | undefined;

  sub!: Subscription;
  attendanceDetailsArray: any;
  hide_show_import_button: any;
  
    // Upload
  files: UploadFile[] = [];
  uploadInput: EventEmitter<UploadInput> = new EventEmitter<UploadInput>();
  fileToUpload!: File;
 

  updateCharts$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  updateComponentAttendance$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  getUserAttendanceCorrReq$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  @ViewChild('preUploadDialog', { static: true }) preUploadDialog!: TemplateRef<any>;
  preUploadData: any | undefined;

  constructor(
    private cdRef: ChangeDetectorRef,
    private _ads: AdminAttendanceService,
    private router: Router,
    public dialog: MatDialog,
    private _ihrmsads: IhrmsAdminDashboardService,
    private apollo: Apollo,
    private toastrService: ToastrService,
    private _eas:  AdminAttendanceService,
    private sharedService: SharedService
  ) {
    this.gridsterOptions =this._ads.getGridsterOptions(this.cardSize, this);
  }

  ngOnInit(): void {

    this.multiChartData = [
      {
        title: "Today's Attendance",
        columnFit: true,
        gridData: {
          columnDefs: [
            { field: 'date', sort: 'desc', headerName: 'Date', cellRenderer: (data: any) => moment(data.value).format('MM/DD/YYYY') },
            { field: 'username', headerName: 'Employee' },
            { field: 'punchIn', headerName: 'PunchIn' ,cellRenderer: (node: any) => node.value && this._ihrmsads.getLocalTimeZone(node.data.date, node.value) },
            { field: 'punchOut', headerName: 'PunchOut',cellRenderer: (node: any) => node.value && this._ihrmsads.getLocalTimeZone(node.data.date, node.value) },
            { field: 'userShiftName', headerName: 'Shift' },
            { field: 'totalHours', headerName: 'Production', valueFormatter: (params: any) => params.value && params.value.toFixed(2) },
            { field: 'overtime', headerName: 'Overtime', valueFormatter: (params: any) => params.value && params.value.toFixed(2) },
          ],
          rowData: [],
          updateGridFromOutside: this.updateComponentAttendance$
        },
        height: 45,
        flex: 100,
        marginBottom: 20
      },
      {
        title: 'Attendance Overview',
        series: {
          config: {
            innerSize: 50,
            depth: 35,
            alpha: 45
          },
          name: 'Days',
          type: 'pie',
          data: []
        },
        xAxisCategories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        height: 49,
        flex: 49
      },
      {
        title: 'Avg Working hours',
        series: {
          config: {
            beta: 25,
            depth: 70,
            alpha: 10
          },
          name: 'Working hours',
          type: 'column',
          data: [], //  ['Week 1', 42], ['Week 2', 40], ['Week 3', 45], ['Week 4', 50]
          updateChartFromOutside: this.updateCharts$,
        },
        xAxisCategories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        height: 49,
        flex: 49
      },
    ]
    
    this.preUploadData = {
      title: '',
      pagination: true,
      columnFit: true,
      paginationPageSize: 5,
      viewAll: false,
      gridData: {
        columnDefs: [
          { field: 'eCode' }, // , headerCheckboxSelection: true, checkboxSelection: true,
          { field: 'username' },
          { field: 'inTime' },
          { field: 'ouTime'},
        ],
        rowData: [],
      },
      flex: 100
    };

    this.setupDashboardItems();

    setTimeout(() => this.initCharts(), 1000);

  }

  initCharts() {

    this.getAttendanceRequests();

    this.getAttendanceAllToday();

    this.getAvgWorkingHours();

    this.getAttendanceOverview();
    
    this.getAttendanceTimeCorrections();

  }

  ngAfterViewInit() {
    this.gridLoaded = true;
    this.cdRef.detectChanges();
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

  getAttendanceAllToday() {
    this.sub = this.apollo.watchQuery<any, any>({ 
      query: GQL_TODAYS_ATTENDANCES_DAY_ALL_USERS, 
      variables: { 
        query: { 
          limit: 100,
          dates: {
            gte: new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()
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

  getAvgWorkingHours() {
    this.sub = this.apollo.watchQuery<any, any>({ 
      query: GQL_TODAYS_ATTENDANCES_DAY_ALL_USERS_AVG, 
      variables: { 
        query: { 
          limit: 100,
          dates: {
            gte: moment().startOf('month').format(),
            lt: moment().endOf('month').format()
          }
        }
      }})
      .valueChanges
      .pipe(map((data: any) => data?.data?.getAttendancesByDayWiseAllUsersAvg))
      .subscribe(val => {
        if(val) {
          const avgPieData: any = [];
          val.forEach((avg: any, idx: number) => avgPieData.push(avg.totalHoursAvg))
          this.multiChartData[2].series = Object.assign({ }, this.multiChartData[2].series, { data: [avgPieData] });
        }
      });
  }

  UploadAttendanceData(event: any) {
    this.apollo.mutate({ mutation: GQL_UPLOAD_ATTENDANCE_DETAILS, variables: { input:this.attendanceDetailsArray} })
    .pipe(map((res: any) => res?.data.insertManyAttendances))
    .subscribe((val: any) => {
      if(val) {
        this.dialog.closeAll();
        this.toastrService.success( `Success`, `Data Upload Successfully!`, { } );
      }
    });
    
  }

 
  getAttendanceOverview() {
    this.sub = this.apollo.watchQuery<any, any>({ 
      query: GQL_TODAYS_ATTENDANCES_OVERVIEW, 
      variables: { 
        query: { 
          limit: 100,
          dates: {
            gte: moment().startOf('month').format(),
            lt: moment().endOf('month').format()
          }
        }
      }})
      .valueChanges
      .pipe(map((data: any) => data?.data?.getAttendanceRequestsByDayWiseOverview))
      .subscribe(val => {
        if(val) {
          const clean: any = [];
          const pieData = _.omit(Object.assign({}, _.countBy(val, 'attendanceType'), _.countBy(val, 'leaveTypeName')), ['undefined']);
          _.forEach(pieData, (val, key) => clean.push([key, val]));
          this.multiChartData[1].series = Object.assign({ }, this.multiChartData[1].series, { data: clean });
        }
      });
  }

  getAttendanceTimeCorrections() {
    this.sub = this.apollo.watchQuery<any, any>({ 
      query: GQL_ATTENDANCE_TIME_CORRECTIONS, 
      variables: { 
        query: { 
          limit: 100,
          dates: {
           // gte: moment().startOf('month').format(),
          }
        }
      }})
      .valueChanges
      .pipe(map((data: any) => data?.data?.getAttendanceCorrections))
      .subscribe(val => this.getUserAttendanceCorrReq$.next({ action: CONSTANTS.UPDATE, rowData: val }));   
}

  openDialogTimeCorr(rowData: any, action: string): any {
    
    const fetchControls = this._ads.getAttendanceTimeCorrectionsControls();
          
    const rowDatam = _.cloneDeep(rowData);
    rowDatam.userfield = rowData.user.username;
    rowDatam.inTime = rowData.inTime && moment(rowData.inTime).format('hh:mm A');
    rowDatam.outTime = rowData.outTime && moment(rowData.outTime).format('hh:mm A');
    rowDatam.toManagerID = rowData.toManager.username;
   
    return this.dialog.open(IhrmsDialogComponent, {
      data: {
        title: action === CONSTANTS.CHECK_CIRCLE ? 'Approve Attendance Time Corrections': 'Reject Attendance Time Corrections',
        controls: fetchControls,
        formConfig: {
          okButtonText: action === CONSTANTS.CHECK_CIRCLE ? 'Confirm': 'Reject',
          patchValue: rowDatam,
          readOnly: true,
          closeFromOutside: true
        }
      },
      panelClass: 'ihrms-dialog-overlay-panel',
    });
  
  }

outputActionsTimeCorr(event: any) {
  console.log('outputActionsTimeCorr',event);
  if(event.action === CONSTANTS.CHECK_CIRCLE || event.action === CONSTANTS.CANCEL) {

    const dialogRef = this.openDialogTimeCorr(event.params.data, event.action);

    dialogRef.componentInstance.dialogEventEmitter.subscribe((result: any) => {

      if(result) {
        console.log(result);
      if(result.action === CONSTANTS.FORM_OBJECT_EVENT) {
        //
        }
        if(result.action === CONSTANTS.FORM_SUBMIT_EVENT) {
          console.log('outputActionsTimeCorr',event);
          const payload = {
            id:result.value._id,
            ...result.value,
            status: event.action === CONSTANTS.CHECK_CIRCLE ? CONSTANTS.Approved : CONSTANTS.Rejected,
            _id: result.value._id,
            inTime:event.params.data.inTime,
            outTime:event.params.data.outTime,
            created_by:event.params.data.user.username,
           // userId: result.value.user?._id
          }
          this.apollo.mutate({ mutation: GQL_ATTENDANCE_CORRECTION_CREATE, variables: payload, })
          .pipe(map((res: any) => res?.data.approveRejectTimeCorrection))
          .subscribe((val: any) => {
            if(val) {
              this.toastrService.success( `Success`, `Data Added Successfully!`, { } );
              this.dialog.closeAll();
              this.getAttendanceTimeCorrections();
            }
          });        
         
        }
      }})
    }
}
outputActions(event: any) {

  if(event.action === CONSTANTS.CHECK_CIRCLE || event.action === CONSTANTS.CANCEL) {

    const dialogRef = this.openDialog(event.params.data, event.action);

    dialogRef.componentInstance.dialogEventEmitter.subscribe((result: any) => {

      if(result) {
        console.log(result);
        if(result.action === CONSTANTS.FORM_OBJECT_EVENT) {
          //
        }
        if(result.action === CONSTANTS.FORM_SUBMIT_EVENT) {
          const payload = {
            ...result.value,
            status: event.action === CONSTANTS.CHECK_CIRCLE ? CONSTANTS.Approved : CONSTANTS.Rejected,
            id: result.value._id,
            userId: result.value.user?._id
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
  const rowDatam = _.cloneDeep(rowData);
  const fetchControls = this._ads.getDynamicControls();

  rowDatam['userfield'] = rowData?.user?.username;
  rowDatam['toManagerIDField'] = rowData?.toManager?.username;

  return this.dialog.open(IhrmsDialogComponent, {
    data: {
      title: action === CONSTANTS.CHECK_CIRCLE ? 'Approve Attendance Request': 'Reject Attendance Request',
      controls: fetchControls,
      formConfig: {
        okButtonText: action === CONSTANTS.CHECK_CIRCLE ? 'Confirm': 'Reject',
        patchValue: rowDatam,
        readOnly: true,
        closeFromOutside: true
      }
    },
    panelClass: 'ihrms-dialog-overlay-panel',
  });

}
  
  setupDashboardItems() {

    this.hide_show_import_button = this.sharedService.checkuserPermission('Admin', 'Attendance', 'import');

    this.dashboardItems = [
      {
        dynamicComponent: MultiChartsComponent,
        gridsterItem: { cols: 2, rows: 2, y: 0, x: 0 },
        inputs: {
          cardRadius: 20,
          title: 'Overview',
          filterConfig: {
            filterForm: false,
            uploadButton: this.hide_show_import_button,
            uploadText: this.hide_show_import_button && '.csv file only',
            uploadSample: this.hide_show_import_button && { text: 'Downlaod users-sample.xlsx', url: '/assets/users-sample.xlsx' }
          },
          compData: this.multiChartData,
          gridComponentFullHeight: true,
        },
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event'] }
        }
      },
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 1, rows: 1, y: 1, x: 2 },
        inputs: {
          title: CONSTANTS.TITLES.AttendanceTypeRequests,
          cardRadius: 0,
          columnDefs: this._ads.getAttendanceRequestColDefs(this.outputActions, this),
          rowData: [],
          flatItem: false,
          updateGridFromOutside: this.updateComponent$
        },
        cellRendererParams: {
          action: this.outputActions.bind(this),
          //value: { actionBtn: [ 'check_circle', 'cancel' ] },
          type: CONSTANTS.REQUEST_ATTENDANCE,
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event'] }
        }
      }},
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 1, rows: 1, y: 1, x: 2 },
        inputs: {
          title: CONSTANTS.TITLES.AttendanceTimeCorrections,
          cardRadius: 2,
          columnDefs: [
            { field: 'Action', filter: false, cellRenderer: 'GridActionComponent',
              cellRendererParams: {
                action: this.outputActionsTimeCorr.bind(this),
                value: { actionBtn: [ 'check_circle', 'cancel' ] },
 
                type: CONSTANTS.REQUEST_ATTENDANCE
              }        
            },
            { field: 'date', headerName: 'Date', sort: 'desc', cellRenderer: (data: any) => data.value && this._ihrmsads.getCurrentZoneTime(data.value) },
            { field: 'toManagerID', hide: true },
            { field: 'inTime', headerName: 'PunchIn', cellRenderer: (data: any) => data.value && moment(data.value).format('hh:mm A') },
            { field: 'outTime', headerName: 'PunchOut', cellRenderer: (data: any) => data.value && moment(data.value).format('hh:mm A') },
            { field: 'shiftName', headerName: 'Shift'},
            { field: 'totalHours', headerName: 'Production'},
            { field: 'overtime', headerName: 'Overtime' },
            { field: 'comments', headerName : 'Comments' },
          ],
          rowData: [],
          updateGridFromOutside: this.getUserAttendanceCorrReq$,
          flatItem: false,
          columnFit: false,
        },
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event'] }
        }
        
      },
    ];
  }
  getLocalTimeZone(date: any, time: any) {
    const local = new Date(date); //  + 'Z'
    const new_local = moment(local).add(time, 'hours');
    return new_local.format('hh:mm A');
  }



  getCurrentZoneTime(d: any) {
    return moment(d).format('MM/DD/YYYY');
  }
 
  dynamicCompClickHandler(event: any) {
    if(event.component && event.comp_name === CONSTANTS.IHRMS_GRID_COMPONENT) {
      if(event.action === CONSTANTS.VIEW_ALL) {
        if(event.component?.title === CONSTANTS.TITLES.AttendanceTypeRequests) {
          const navExtras: NavigationExtras = { queryParams: { tab: 1 } };
          this.router.navigate([`${CONSTANTS.ADMIN_DASHBOARD}/${CONSTANTS.ADMIN_ATTENDANCE_DETAILS}`], navExtras);
        }
        if(event.component?.title === CONSTANTS.TITLES.TodaysAttendance) {
          this.router.navigate([`${CONSTANTS.ADMIN_DASHBOARD}/${CONSTANTS.ADMIN_ATTENDANCE_DETAILS}`]);
        }
        if(event.component?.title === CONSTANTS.TITLES.AttendanceTimeCorrections) {
          this.router.navigate([`${CONSTANTS.ADMIN_DASHBOARD}/${CONSTANTS.ADMIN_ATTENDANCE_DETAILS}`]);
        }
      }
      if(event.action === CONSTANTS.ON_GRID_READY) {
        //
      }
    
    }
    if(event.action === CONSTANTS.UPLOAD_ANY) {
       if(event.uploadOutput.type === 'addedToQueue') {
         this.startUpload(event.uploadOutput);
       }
     }
  }
    // Upload
    startUpload(uploadOutput: UploadOutput) {
      // You will get Single File Always || Single Enable
      this.apollo.mutate({ 
          mutation: GQL_ATTENDANCE_UPLOAD, 
          variables: { file: uploadOutput.file?.nativeFile }
        })
        .pipe(map((res: any) => res?.data.uploadFileAttendance))
        .subscribe((val: any) => {
          this.attendanceDetailsArray = val;
          if(val) this.openPreUploadDialog(this.preUploadDialog, val);
      });
    }

    openPreUploadDialog(templateRef: TemplateRef<any>, data: { dups: any[], invalids: any[], employees: any[], DBUsers: [] }) {
      this.dialog.open(templateRef, { data, minWidth: '80vw', disableClose: true })
      .afterClosed().subscribe((val: boolean) => {
        console.log(val);
      })
    }

    preUploadGridReady(event: any) {
      // 
    }

    getRows(rows: any) {
      return rows;
    }
  

}
