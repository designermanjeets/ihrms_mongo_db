import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { IhrmsGridComponent } from '@ihrms/ihrms-grid';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AdminFinancesService } from '../_services/admin-finances.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ihrms-admin-finances-details',
  templateUrl: './admin-finances-details.component.html',
  styleUrls: ['./admin-finances-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminFinancesDetailsComponent implements OnInit {

  gridsterOptions: GridsterConfig;
  gridLoaded = false;
  dashboardItemsSalaryRevisions: Array<GridsterItem> | any;
  dashboardItemsIncomeTax: Array<GridsterItem> | any;
  dashboardItemsPayroll: Array<GridsterItem> | any;
  gridResize: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  selectedIndex! : number;
  @ViewChild('tabGroup') tabGroup!: ElementRef;

  cardSize = this.tabGroup?.nativeElement?.offsetHeight;
  
  filterConfig: any;

  constructor(
    private _afs: AdminFinancesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.gridsterOptions = this._afs.getGridsterOptions(this.cardSize, this );
  }

  ngOnInit(): void {

    this.setupDashboardItems();

    this.route.queryParams.subscribe(params => {
      this.selectedIndex = +params['tab'];
    });

    this.filterConfig = {
      filterForm: false
    };

  }

  outputActions(event: any) {
    console.log(event);
  }

  setupDashboardItems() {

    const userObj = { username: 'Harry', userImg: 'shiba1.jpg', subTitle: 'Engineer' };

    const columnDefsSalaryRevisions = [
      // { field: 'Employee', cellRenderer: 'GridAvatarComponent', autoHeight: true, },
      { field: 'Effective Date'},
      { field: 'Payout Month'},
      { field: 'Annual CTC', cellRenderer: function(params: any) {
          return '<span><i class="material-icons text-primary bold cell-icon" ihrmsUtil fontSize="14">north</i>' + params.value + '</span>'
        }
      },
      { field: 'Designation'},
      { field: 'Department'},
      { field: 'Action', cellRenderer: 'GridActionComponent',
        cellRendererParams: {
          action: this.outputActions.bind(this),
          value: { actionBtn: [ 'visibility', 'print', 'download'] }
        }
      },
    ];
    const rowDataSalaryRevisions = [
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      },
      {
        Employee: userObj,
        'Effective Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Payout Month': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual CTC': '$45,000',
        Designation: 'Engineer',
        Department: 'IT',
      }
    ];

    const columnDefsIncomeTax = [
      { field: 'null',},
      { field: 'Total',},
      { field: 'Jan',},
      { field: 'Feb',},
      { field: 'Mar',},
      { field: 'Apr',},
      { field: 'May',},
      { field: 'Jun',},
      { field: 'Jul',},
      { field: 'Aug',},
      { field: 'Sep',},
      { field: 'Oct',},
      { field: 'Nov',},
      { field: 'Dec',},
    ];
    const rowDataIncomeTax = [
      {
        null: 'Basic', Total: '$15,000', Jan: '$14,000', Feb: '$13,000', Mar: '$13,000', Apr: '$15,000', May: '$11,000',
        Jun: '$13,000', Jul: '$16,000', Aug: '$14,000', Sep: '$11,000', Oct: '$12,000', Nov: '$15,000', Dec: '$13,000',
      },
      {
        null: 'HRA', Total: '$14,000', Jan: '$14,000', Feb: '$13,000', Mar: '$13,000', Apr: '$15,000', May: '$11,000',
        Jun: '$13,000', Jul: '$16,000', Aug: '$14,000', Sep: '$11,000', Oct: '$12,000', Nov: '$15,000', Dec: '$13,000',
      },
      {
        null: 'DA', Total: '$14,000', Jan: '$14,000', Feb: '$13,000', Mar: '$13,000', Apr: '$15,000', May: '$11,000',
        Jun: '$13,000', Jul: '$16,000', Aug: '$14,000', Sep: '$11,000', Oct: '$12,000', Nov: '$15,000', Dec: '$13,000',
      },
    ];

    const columnDefsPayroll = [
      // { field: 'Employee', cellRenderer: 'GridAvatarComponent', autoHeight: true, },
      { field: 'Total Salary' },
      { field: 'Earnings' },
      { field: 'Days' },
      { field: 'Leaves' },
      { field: 'Overtime' },
      { field: 'Loss Of Pay' },
      { field: 'Taxes' },
      { field: 'Gross' },
      { field: 'Status', cellRenderer: 'GridStatusComponent' },
      { field: 'Actions', cellRenderer: 'GridActionComponent',
        cellRendererParams: {
          action: this.outputActions.bind(this),
          value: { type: 'buttons', names: [ 'Pay'] }
        }
      },
    ];
    const rowDataPayroll = [
      { Employee: userObj, 'Total Salary': '$15,000', 'Days': '29', 'Leaves': '5', 'Overtime': '20', 'Loss Of Pay': '100', Earnings: '$6,000', Taxes: '$3000', Gross: '$9000', status: 'Paid' },
      { Employee: userObj, 'Total Salary': '$15,000', 'Days': '29', 'Leaves': '5', 'Overtime': '20', 'Loss Of Pay': '100', Earnings: '$6,000', Taxes: '$3000', Gross: '$9000', status: 'Pending' },
      { Employee: userObj, 'Total Salary': '$15,000', 'Days': '29', 'Leaves': '5', 'Overtime': '20', 'Loss Of Pay': '100', Earnings: '$6,000', Taxes: '$3000', Gross: '$9000', status: 'Pending' },
      { Employee: userObj, 'Total Salary': '$15,000', 'Days': '29', 'Leaves': '5', 'Overtime': '20', 'Loss Of Pay': '100', Earnings: '$6,000', Taxes: '$3000', Gross: '$9000', status: 'Pending' },
      { Employee: userObj, 'Total Salary': '$15,000', 'Days': '29', 'Leaves': '5', 'Overtime': '20', 'Loss Of Pay': '100', Earnings: '$6,000', Taxes: '$3000', Gross: '$9000', status: 'Pending' },
      { Employee: userObj, 'Total Salary': '$15,000', 'Days': '29', 'Leaves': '5', 'Overtime': '20', 'Loss Of Pay': '100', Earnings: '$6,000', Taxes: '$3000', Gross: '$9000', status: 'Pending' },
      { Employee: userObj, 'Total Salary': '$15,000', 'Days': '29', 'Leaves': '5', 'Overtime': '20', 'Loss Of Pay': '100', Earnings: '$6,000', Taxes: '$3000', Gross: '$9000', status: 'Pending' },
      { Employee: userObj, 'Total Salary': '$15,000', 'Days': '29', 'Leaves': '5', 'Overtime': '20', 'Loss Of Pay': '100', Earnings: '$6,000', Taxes: '$3000', Gross: '$9000', status: 'Pending' },
      { Employee: userObj, 'Total Salary': '$15,000', 'Days': '29', 'Leaves': '5', 'Overtime': '20', 'Loss Of Pay': '100', Earnings: '$6,000', Taxes: '$3000', Gross: '$9000', status: 'Pending' },
    ];

    this.dashboardItemsSalaryRevisions = [
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 1, rows: 1, y: 0, x: 0 },
        inputs: {
          title: '',
          cardRadius: 0,
          rowData: rowDataSalaryRevisions,
          columnDefs: columnDefsSalaryRevisions,
          columnFit: true,
          pagination: true,
          paginationAutoPageSize: true,
          viewAll: false,
        },
        flatItem: true,
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event'] }
        }
      }
    ];

    this.dashboardItemsIncomeTax = [
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 1, rows: 1, y: 0, x: 0 },
        inputs: {
          title: '',
          cardRadius: 0,
          rowData: rowDataIncomeTax,
          columnDefs: columnDefsIncomeTax,
          columnFit: true,
          pagination: true,
          paginationAutoPageSize: true,
          viewAll: false,
        },
        flatItem: true,
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event'] }
        }
      }
    ];

    this.dashboardItemsPayroll = [
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 1, rows: 1, y: 0, x: 0 },
        inputs: {
          title: '',
          cardRadius: 0,
          rowData: rowDataPayroll,
          columnDefs: columnDefsPayroll,
          columnFit: true,
          pagination: true,
          paginationAutoPageSize: true,
          viewAll: false,
          pinnedBottomRowData: this.totalRowData()
        },
        flatItem: true,
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event'] }
        }
      }
    ];

  }

  dynamicCompClickHandler(event: any) {
    //
  }

  totalRowData() {
    const result = [];
    result.push({
      Employee: 'Total 150',
      'Total Salary': '$55,000',
      Earnings: '$45,000',
      Taxes: '$5,000',
      Gross: '$50,000',
      Actions: 'Pay All',
    });
    return result;
  }

  onTabChanged(event: MatTabChangeEvent) {
    this.selectedIndex = event.index;
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { tab: this.selectedIndex }});
  }

}

