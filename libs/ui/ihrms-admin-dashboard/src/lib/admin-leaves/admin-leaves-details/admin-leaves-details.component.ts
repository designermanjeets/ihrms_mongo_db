import { ChangeDetectionStrategy, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { BehaviorSubject, map, Subject, Subscription } from 'rxjs';
import * as moment from 'moment';
import { IhrmsGridComponent } from '@ihrms/ihrms-grid';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AdminLeavesService, GQL_LEAVE_APPROVE_REJECT, GQL_LEAVE_REQUESTS } from '../_services/admin-leaves.service';
import { CONSTANTS } from '@ihrms/shared';
import { Apollo } from 'apollo-angular';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ihrms-admin-leaves-details',
  templateUrl: './admin-leaves-details.component.html',
  styleUrls: ['./admin-leaves-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLeavesDetailsComponent implements OnInit {

  gridsterOptions: GridsterConfig;
  gridLoaded = false;
  dashboardItemsLeaveRequests: Array<GridsterItem> | any;
  gridResize: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  selectedIndex! : number;
  @ViewChild('tabGroup') tabGroup!: ElementRef;

  cardSize = this.tabGroup?.nativeElement?.offsetHeight;

  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  sub!: Subscription;
  rowIndexOrIDLeaveRequests: Subject<any> = new Subject();

  leaveRequestsByStatus: any;
  leaveRequestsByTypes: any;

  filterConfig!: any;

  constructor(
    private _als: AdminLeavesService,
    private apollo: Apollo,
    public dialog: MatDialog,
    private toastrService: ToastrService,
  ) {
    this.gridsterOptions = this._als.getGridsterOptions(this.cardSize, this ); 
       
    this.filterConfig = {
      filterForm: false
    }
  }

  ngOnInit(): void {

    this.setupDashboardItems();
    this.getLeaveRequests();

  }

  getLeaveRequests() {
    this.sub = this.apollo.watchQuery<any, any>({ query: GQL_LEAVE_REQUESTS, variables: { query: { limit: 100 }}}).valueChanges
      .pipe(map((data: any) => data?.data?.getLeaveRequests))
      .subscribe(val => this.rowIndexOrIDLeaveRequests.next({ action: CONSTANTS.UPDATE, rowData: val }));
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

    this.dashboardItemsLeaveRequests = [
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 1, rows: 1, y: 0, x: 0 },
        inputs: {
          title: '',
          cardRadius: 0,
          columnDefs: [
            { field: 'user.username', headerName: 'Username'},
            { field: 'user.designation.name',headerName:'Designation'},
            { field: 'user.unitDepartment.name',headerName:'Department'},
            { field: 'leaveType.name', headerName: 'Type'},
            { field: 'startDate', headerName: 'Start Date', cellRenderer: (data: any) => data.value && moment(data.value).format('MM/DD/YYYY') },
            { field: 'endDate', headerName: 'End Date', cellRenderer: (data: any) => data.value && moment(data.value).format('MM/DD/YYYY') },
            { field: 'days', headerName: 'Days'},
            { field: 'status', headerName: 'Status'},
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
          columnFit: true,
          pagination: true,
          paginationAutoPageSize: true,
          viewAll: false,
          updateGridFromOutside: this.rowIndexOrIDLeaveRequests
        },
        flatItem: true,
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler, args: ['$event', this] }
        }
      }
    ];

  }

  dynamicCompClickHandler(event: any, _this: AdminLeavesDetailsComponent) {
    if(event.component && event.comp_name === CONSTANTS.IHRMS_GRID_COMPONENT) {
      if(event.action === CONSTANTS.ON_GRID_READY) {
        console.log(event)
      }
    }
  }

  onTabChanged(event: MatTabChangeEvent) {
    console.log(event);
    this.selectedIndex = event.index;
  }

}
