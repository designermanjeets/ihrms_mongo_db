import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { GQL_LEAVE_CREATE, GQL_LEAVE_REQUEST, GQL_LEAVE_TYPES, GQL_USER_BY_ID, IhrmsEmpDashboardService } from '../_services/ihrms-emp-dashboard.service';
import { map } from 'rxjs/operators';
import { EmpHelloComponent, IhrmsDialogComponent, MultiChartsComponent } from '@ihrms/ihrms-components';
import { IhrmsGridComponent } from '@ihrms/ihrms-grid';
import { CONSTANTS } from '@ihrms/shared';
import { EmpLeavesService } from './_services/emp-leaves.service';
import { MatDialog } from '@angular/material/dialog';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EmptyObject } from 'apollo-angular/build/types';


@Component({
  selector: 'ihrms-emp-leaves',
  templateUrl: './emp-leaves.component.html',
  styleUrls: ['./emp-leaves.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpLeavesComponent implements OnInit, AfterViewInit {

  highcharts: typeof Highcharts = Highcharts;
  gridsterOptions: GridsterConfig;
  cardSize = 340;
  gridLoaded = false;
  leaveTypesData: any;
  dashboardItems: Array<GridsterItem> | any;
  gridResize: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  multiChartData: any | undefined;
  LeaveTypesOptions : any;
  userManager: any;

  sub!: Subscription;

  public randomLoader = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);

  rowIndexOrIDLeaveRequest: Subject<any> = new Subject();

  constructor(
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private _els: EmpLeavesService,
    private router: Router,
    private apollo: Apollo,
    private toastrService: ToastrService,
    private ngxService: NgxUiLoaderService,
    private _eds: IhrmsEmpDashboardService
  ) {
    this.gridsterOptions = this._els.getGridsterOptions(this.cardSize, this); //, 'scroll'
  }

  ngOnInit(): void {

    this.multiChartData = [
      {
        title: 'Leaves Overview',
        series: {
          config: {
            innerSize: 60,
            depth: 0,
            alpha: 0
          },
          name: 'Leaves',
          type: 'pie',
          data: [ ['Sick', 42], ['Marriage', 40], ['Paternity', 45], ['Paid', 50], ['Un-Paid', 10] ]
        },
        flex: 24,
        height: 98
      },
      {
        title: 'Leaves by Month',
        series: {
          config: {
            beta: 0,
            depth: 0,
            alpha: 0
          },
          name: 'Days',
          type: 'column',
          subType: 'multi',
          data: [
            { name: 'Leaves', data: [13, 20, 10, 5, 13, 20]}
          ]
        },
        xAxisCategories: (this.highcharts as any).getOptions().lang.shortMonths,
        flex: 24,
        height: 98
      },
      {
        title: 'Leave Requests',
        series: {
          config: {
            innerSize: 50,
            depth: 35,
            alpha: 45
          },
          name: 'Leaves',
          type: 'pie',
          data: [ ['Approved', 10], ['Pending', 25], ['Declined', 7] ] //['Requests', 42],
        },
        flex: 24,
        height: 98
      },
      {
        title: 'Avg. Leave Types',
        series: {
          config: {
            beta: 25,
            depth: 70,
            alpha: 10
          },
          name: 'Leaves',
          type: 'column',
          data: [ 10, 25, 7, 5 ]
        },
        xAxisCategories: ['Marriage', 'Paternity', 'Sick', 'Unpaid'],
        flex: 24,
        height: 98
      },
    ]

    this.setupDashboardItems();
  }

  ngAfterViewInit() {
    this.gridLoaded = true;
    this.getUserManager();
    this.getLeaveTypes();
    this.getRequestleaves();
    this.cdRef.detectChanges();
  }

  outputActions(event: any) {
    console.log(event);
  }

  getLeaveTypes() {
    this.apollo.watchQuery({ query: GQL_LEAVE_TYPES, variables: { query: { limit: 100 }}}).valueChanges
      .pipe(map((data: any) => data?.data?.getLeaveTypes))
      .subscribe(val => this.LeaveTypesOptions = val);
  }

  getUserManager() {
    const userID = JSON.parse(sessionStorage.getItem('auth-user') || '').userID;
    this.apollo.watchQuery<any, any>({ query: GQL_USER_BY_ID, variables: { query: { limit: 100, id: userID}}}).valueChanges
      .pipe(map((data: any) => data?.data?.getUsers[0]))
      .subscribe(val => {
        this.userManager = [{ _id: val.reportingManager?._id, name: val.reportingManager?.username }];
        this.cdRef.detectChanges();
      });
  }

  setupDashboardItems() {

    this.dashboardItems = [
      {
        dynamicComponent: EmpHelloComponent,
        gridsterItem: { cols: 1, rows: 1, y: 0, x: 0 },
        inputs: {
          cardRadius: 20,
          palette: 'primary',
          component: CONSTANTS.EMP_LEAVES
        },
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler, args: ['$event', this] }
        }
      },
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 1, rows: 1, y: 0, x: 1 },
        inputs: {
          title: 'My Requests',
          cardRadius: 0,
          columnDefs: [
            { field: 'startDate'},
            { field: 'endDate'},
            { field: 'days'},
            { field: 'leaveType'},
            { field: 'status'}
          ],
          rowData: [],
          columnFit: true,
          flatItem: false,
          updateGridFromOutside: this.rowIndexOrIDLeaveRequest
        },
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler, args: ['$event', this] }
        }
      },
      {
        dynamicComponent: MultiChartsComponent,
        gridsterItem: { cols: 2, rows: 1, y: 1, x: 0 },
        inputs: {
          cardRadius: 20,
          title: "Overview",
          compData: this.multiChartData,
          filters: false,
        },
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler, args: ['$event', this] }
        }
      },
    ];
  }

  dynamicCompClickHandler(event: any, _this: EmpLeavesComponent) {
    if(event.component && event.comp_name === CONSTANTS.IHRMS_GRID_COMPONENT) {
      _this.router.navigateByUrl(`${CONSTANTS.EMP_DASHBOARD}/${CONSTANTS.EMP_LEAVES_DETAILS}`)
    }
    if(event.action === CONSTANTS.REQUEST_LEAVE) {
      _this.openDutyRequestDialog(CONSTANTS.REQUEST_LEAVE);
    }
  }

  getRequestleaves() {
    this.sub = this.apollo.watchQuery<any, any>({ query: GQL_LEAVE_REQUEST, variables: { query: { limit: 100 }}}).valueChanges
      .pipe(map((data: any) => data?.data?.getLeaveRequests))
      .subscribe(val => {
        if(val) {
          this.rowIndexOrIDLeaveRequest.next({ action: CONSTANTS.UPDATE, rowData: val });
          this.cdRef.detectChanges();
        }
      });
  }


  openDutyRequestDialog(action: string) {

    let fetchControls = null;
    let title = '';
    if(action === CONSTANTS.REQUEST_LEAVE) {
      title = 'Request Leave';
      fetchControls = this._els.getRequestLeaveDynamicControls();
    }

    const dialogRef = this.dialog.open(IhrmsDialogComponent,{
      data: {
        title: title,
        controls: fetchControls
      },
      panelClass: 'ihrms-dialog-overlay-panel',
    });

    dialogRef?.componentInstance?.dialogEventEmitter.subscribe((result: any) => {

      if(result && dialogRef.componentInstance) {
        if(result.action === CONSTANTS.FORM_OBJECT_EVENT) {
           this._eds.getSelectOptions(dialogRef.componentInstance?.controlsObj, this.LeaveTypesOptions, 'leaveTypeID', '_id');
           this._eds.getSelectOptions(dialogRef.componentInstance?.controlsObj, this.userManager, 'toManagerID', '_id');
           if(this.userManager && this.userManager[0]?._id) {
            dialogRef.componentInstance?.form?.get('toManagerID')?.patchValue(this.userManager[0]._id);
           } else {
            this.getUserManager();
           }
        }
        if(result.action === CONSTANTS.FORM_VALUE_CHANGE) {
          console.log(dialogRef.componentInstance?.form)
        }
        if(result.action === CONSTANTS.FORM_SUBMIT_EVENT) {
          const payload =  {
            userID: JSON.parse(sessionStorage.getItem('auth-user') || '').userID,
            ...result.value,
            days: Number(result.value.days)
          }
          this.apollo.mutate({ mutation: GQL_LEAVE_CREATE, variables: payload, })
            .pipe(map((res: any) => res?.data.createLeaveRequest))
            .subscribe((val: any) => {
              if(val) {
                this.toastrService.success( `Success`, `Leave Request Created Successfully!`, { } );
                this.getRequestleaves();
              }
            });
        }
      }

    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if(result) {
        console.log(`Dialog result: ${result}`);
      }
    });
 
  }
  


}

