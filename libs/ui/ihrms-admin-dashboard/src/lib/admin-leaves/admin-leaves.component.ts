import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { BehaviorSubject, map, Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { MultiChartsComponent } from '@ihrms/ihrms-components';
import { IhrmsGridComponent } from '@ihrms/ihrms-grid';
import { CONSTANTS, IhrmsDashboardItem } from '@ihrms/shared';
import { AdminLeavesService, GQL_LEAVE_APPROVE_REJECT, GQL_LEAVE_REQUESTS } from './_services/admin-leaves.service';
import { Apollo } from 'apollo-angular';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { GridApi, GridOptions, RowNode } from 'ag-grid-community';
import { ColumnApi } from '@ag-grid-community/core';

@Component({
  selector: 'ihrms-admin-leaves',
  templateUrl: './admin-leaves.component.html',
  styleUrls: ['./admin-leaves.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLeavesComponent implements OnInit, AfterViewInit {

  highcharts: typeof Highcharts = Highcharts;
  gridsterOptions: GridsterConfig;
  cardSize = 500;
  gridLoaded = false;
  dashboardItems!: Array<IhrmsDashboardItem>;
  gridResize: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  multiChartData: any | undefined;

  sub!: Subscription;
  rowIndexOrIDLeaveRequests: Subject<any> = new Subject();
  updateMultiChartFromOutside$: Subject<any> = new Subject();

  leaveRequestsByStatus: any;
  leaveRequestsByTypes: any;

  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  constructor(
    private cdRef: ChangeDetectorRef,
    private _als: AdminLeavesService,
    private router: Router,
    private apollo: Apollo,
    public dialog: MatDialog,
    private toastrService: ToastrService,
  ) {
    this.gridsterOptions = this._als.getGridsterOptions(this.cardSize, this);
  }

  ngOnInit(): void {

    this.multiChartData = [
      {
        title: CONSTANTS.TITLES.RequestsApprovals,
        columnFit: true,
        gridData: {
          columnDefs: [
            { field: 'status', headerName: 'Status'},
            { field: 'user.username', headerName: 'Username'},
            { field: 'startDate', headerName: 'Start Date', cellRenderer: (data: any) => data.value && moment(data.value).format('MM/DD/YYYY') },
            { field: 'endDate', headerName: 'End Date', cellRenderer: (data: any) => data.value && moment(data.value).format('MM/DD/YYYY') },
            { field: 'days', headerName: 'Days'},
            { field: 'leaveType.name', headerName: 'Type'},
            { field: 'comments' },
            { field: 'audit.created_at', headerName: 'Date', cellRenderer: (data: any) => data.value && moment(data.value).format('MM/DD/YYYY') },
            { field: 'Action', filter: false, cellRenderer: 'GridActionComponent',
              cellRendererParams: {
                action: this.outputActions.bind(this),
                value: { actionBtn: [ 'check_circle', 'cancel' ] },
                type: CONSTANTS.REQUEST_LEAVE
              }
            },
          ],
          rowData: [],
          updateGridFromOutside: this.rowIndexOrIDLeaveRequests,
        },
        height: 45,
        flex: 100,
        marginBottom: 20
      },
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
          data: [ ]
        },
        height: 49,
        flex: 24
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
            { name: 'Leaves', data: [ ]}
          ]
        },
        xAxisCategories: (this.highcharts as any).getOptions().lang.shortMonths,
        height: 49,
        flex: 24
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
          data: []
        },
        height: 49,
        flex: 24
      },
      {
        title: 'Leave Types',
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
        height: 49,
        flex: 24
      },
    ]
    this.setupDashboardItems();

    setTimeout(() => this.initCharts(), 1000);
  }

  ngAfterViewInit() {
    this.gridLoaded = true;
    this.cdRef.detectChanges();
  }

  initCharts() {
    this.getLeaveRequests();
    this.getLeaveRequestsByCurrentMonth();
    this.getLeaveRequestsByCurrentYear();
  }

  getLeaveRequests() {
    this.sub = this.apollo.watchQuery<any, any>({ query: GQL_LEAVE_REQUESTS, variables: { query: { limit: 100 }}}).valueChanges
      .pipe(map((data: any) => data?.data?.getLeaveRequests))
      .subscribe(val => this.rowIndexOrIDLeaveRequests.next({ action: CONSTANTS.UPDATE, rowData: val }));
  }

  getLeaveRequestsByCurrentMonth() {
    this.sub = this.apollo.watchQuery<any, any>({ 
      query: GQL_LEAVE_REQUESTS, 
      variables: { query: { limit: 100, dates: {
          gte: moment().startOf('month').format(),
          lt: moment().endOf('month').format()
        } 
      }}
    }).valueChanges
      .pipe(map((data: any) => data?.data?.getLeaveRequests))
      .subscribe(val => {
        this.leaveRequestsByStatus = {};
        this.leaveRequestsByStatus = _.groupBy(val, 'status');

        const leaveTypes: any = [];
        _.forEach(_.groupBy(val, 'leaveType.name'), (lv, idx) => leaveTypes.push([ idx,  lv.length]));

        this.multiChartData[1].series = Object.assign({ }, this.multiChartData[1].series, { data: leaveTypes });

        this.multiChartData[3].series = Object.assign({ }, 
          this.multiChartData[3].series, {
          data: [
            ['Approved', this.leaveRequestsByStatus?.Approved?.length],
            ['Pending', this.leaveRequestsByStatus?.Pending?.length],
            ['Rejected', this.leaveRequestsByStatus?.Rejected?.length]
          ] 
        });

        this.multiChartData[4].series = Object.assign({ }, this.multiChartData[4].series, { data: leaveTypes });
        this.updateMultiChartFromOutside$.next(true);
      });
  }

  getLeaveRequestsByCurrentYear() {
    this.sub = this.apollo.watchQuery<any, any>({ 
      query: GQL_LEAVE_REQUESTS, 
      variables: { query: { limit: 100, dates: {
          gte: moment().startOf('year').format(),
          lt: moment().endOf('year').format()
        } 
      }}
    }).valueChanges
      .pipe(map((data: any) => data?.data?.getLeaveRequests))
      .subscribe(val => {
        let res = _.cloneDeep(val);
        _.each(res, (lv, idx) => res[idx].startDate = moment(res[idx].startDate, 'YYYY/MM/DD').format('MMM'));

        const leaveTypes: any = [];
        _.forEach(_.groupBy(res, 'startDate'), (lv, idx) => leaveTypes.push([idx, lv.length]));

        this.multiChartData[1].series = Object.assign({ }, this.multiChartData[1].series, { data: { name: "Leaves", data: [leaveTypes] } });
      });
  }

  outputActions(event: any) {
    console.log(event);
    if(event.action === CONSTANTS.CHECK_CIRCLE || event.action === CONSTANTS.CANCEL) {
      this.openDialog(event.params.data, event.action);
    }
  }

  onCancel(data: any, action: string) { 
    this.dialog.closeAll();
  }

  onConfirm(data: any, action: string) {
    const payload = {
      ...data,
      status: action === CONSTANTS.CHECK_CIRCLE ? CONSTANTS.Approved : CONSTANTS.Rejected,
      id: data._id
    }
    this.apollo.mutate({ mutation: GQL_LEAVE_APPROVE_REJECT, variables: payload, })
      .pipe(map((res: any) => res?.data.approveRejectLeaveRequest))
      .subscribe((val: any) => {
        if(val) {
          this.toastrService.success( `Success`, `Data Added Successfully!`, { } );
          this.dialog.closeAll();
          this.getLeaveRequests();
        }
      });
  }
  
  openDialog(rowData: any, action: string): any {
    return this.dialog.open(this.confirmDialog, {
      data: { rowData, action },
      panelClass: ['ihrms-dialog-overlay-panel', 'confirm-dialog-panel'],
    });
  }

  setupDashboardItems() {

    this.dashboardItems = [
      {
        dynamicComponent: MultiChartsComponent,
        gridsterItem: { cols: 1, rows: 4, y: 0, x: 0 },
        inputs: {
          cardRadius: 20,
          title: CONSTANTS.TITLES.Overview,
          compData: this.multiChartData,
          filters: false,
          updateMultiChart: this.updateMultiChartFromOutside$,
        },
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event'] }
        }
      },
    ];
  }

  dynamicCompClickHandler(event: any) {
    if(event.component && event.comp_name === CONSTANTS.IHRMS_GRID_COMPONENT) {
      if(event.action === CONSTANTS.VIEW_ALL) {
        if(event.component?.title === CONSTANTS.TITLES.RequestsApprovals) {
          this.router.navigate([`${CONSTANTS.ADMIN_DASHBOARD}/${CONSTANTS.ADMIN_LEAVES_DETAILS}`])
        }
      }
      if(event.action === CONSTANTS.ON_GRID_READY) {
        console.log(event)
      }
    }
    if(event.component && event.comp_name === CONSTANTS.IHRMS_MULTI_CHART_COMPONENT) {
      console.log(event)
    }
  }

}
