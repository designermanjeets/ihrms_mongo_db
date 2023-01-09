import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { IhrmsGridComponent } from '@ihrms/ihrms-grid';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EmpLeavesService } from '../_services/emp-leaves.service';


@Component({
  selector: 'ihrms-emp-leaves-details',
  templateUrl: './emp-leaves-details.component.html',
  styleUrls: ['./emp-leaves-details.component.scss']
})
export class EmpLeavesDetailsComponent implements OnInit {

  gridsterOptions: GridsterConfig;
  gridLoaded = false;
  dashboardItemsLeaveRequests: Array<GridsterItem> | any;
  gridResize: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  selectedIndex! : number;
  @ViewChild('tabGroup') tabGroup!: ElementRef;

  cardSize = this.tabGroup?.nativeElement?.offsetHeight;

  filterConfig: any;

  constructor(
    private _els: EmpLeavesService,
  ) {
    this.gridsterOptions = this._els.getGridsterOptions(this.cardSize, this );
  }

  ngOnInit(): void {

    this.setupDashboardItems();

    this.filterConfig = {
      filterForm: false
    };

  }

  outputActions(event: any) {
    console.log(event);
  }

  setupDashboardItems() {

   
    const columnDefsLeaveRequests = [
      { field: 'Employee', cellRenderer: 'GridAvatarComponent', autoHeight: true, },
      { field: 'Designation'},
      { field: 'Department'},
      { field: 'Leave Type'},
      { field: 'Start Date'},
      { field: 'End Date'},
      { field: 'Status'},
      { field: 'Action', cellRenderer: 'GridActionComponent',
        cellRendererParams: {
          action: this.outputActions.bind(this),
          value: { actionBtn: [ 'event_busy' ] }
        }
      },
    ];
    
    this.dashboardItemsLeaveRequests = [
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 1, rows: 1, y: 0, x: 0 },
        inputs: {
          title: '',
          cardRadius: 0,
          rowData: [],
          columnDefs: columnDefsLeaveRequests,
          columnFit: true,
          pagination: true,
          paginationAutoPageSize: true,
          viewAll: false,
          illustration: 'Illustration_Leave.png',
        },
        flatItem: true,
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler, args: ['$event', this] }
        }
      }
    ];

  }

  dynamicCompClickHandler(event: any, _this: EmpLeavesDetailsComponent) {
    //
  }

  onTabChanged(event: MatTabChangeEvent) {
    console.log(event);
    this.selectedIndex = event.index;
  }

}

