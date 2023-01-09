import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { IhrmsGridComponent } from '@ihrms/ihrms-grid';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EmpFinancesService } from '../_services/emp-finances.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ihrms-emp-finances-details',
  templateUrl: './emp-finances-details.component.html',
  styleUrls: ['./emp-finances-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpFinancesDetailsComponent implements OnInit {

  gridsterOptions: GridsterConfig;
  cardSize = 700;
  gridLoaded = false;
  dashboardItemsIncome: Array<GridsterItem> | any;
  dashboardItemsPayroll: Array<GridsterItem> | any;
  gridResize: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  selectedIndex! : number;
  
  filterConfig: any;

  constructor(
    private _efs: EmpFinancesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.gridsterOptions = this._efs.getGridsterOptions(this.cardSize, this );
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

    const columnDefs = [
      { field: 'Date', sortable: true, filter: true },
      { field: 'Salary', sortable: true, filter: true },
      { field: 'Earnings', sortable: true, filter: true},
      { field: 'Taxes', sortable: true, filter: true},
      { field: 'Gross', sortable: true, filter: true},
      { field: 'Status', sortable: true, filter: true, cellRenderer: 'GridStatusComponent' }
    ];

    const rowData = [
      {
        Date: moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Pending'
      },
      {
        Date: moment('2020-05-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Paid'
      },
      {
        Date: moment('2020-04-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Paid'
      },
      {
        Date: moment('2020-03-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Paid'
      },
      {
        Date: moment('2020-03-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Paid'
      },
      {
        Date: moment('2020-03-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Paid'
      },
      {
        Date: moment('2020-03-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Paid'
      },
      {
        Date: moment('2020-03-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Paid'
      },
      {
        Date: moment('2020-03-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Paid'
      },
      {
        Date: moment('2020-03-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Paid'
      },
      {
        Date: moment('2020-03-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Paid'
      },
      {
        Date: moment('2020-03-24 22:57:36').format("YYYY-MM-DD"),
        Salary: '$45,000',
        Earnings: '$30,000',
        Taxes: '$3,000',
        Gross: '$43,000',
        Status: 'Paid'
      }
    ]

    const columnDefsPayroll = [
      { field: 'null', sortable: true, filter: true },
      { field: 'Total', sortable: true, filter: true },
      { field: 'Jan', sortable: true, filter: true },
      { field: 'Feb', sortable: true, filter: true },
      { field: 'Mar', sortable: true, filter: true },
      { field: 'Apr', sortable: true, filter: true },
      { field: 'May', sortable: true, filter: true },
      { field: 'Jun', sortable: true, filter: true },
      { field: 'Jul', sortable: true, filter: true },
      { field: 'Aug', sortable: true, filter: true },
      { field: 'Sep', sortable: true, filter: true },
      { field: 'Oct', sortable: true, filter: true },
      { field: 'Nov', sortable: true, filter: true },
      { field: 'Dec', sortable: true, filter: true },
    ];
    const rowDataPayroll = [
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

    this.dashboardItemsIncome = [
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 1, rows: 1, y: 0, x: 0 },
        inputs: {
          title: '',
          cardRadius: 0,
          rowData: rowData,
          columnDefs: columnDefs,
          pagination: true,
          paginationAutoPageSize: true,
          columnFit: true,
          viewAll: false
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
          pagination: true,
          paginationAutoPageSize: true,
          columnFit: true,
          viewAll: false
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

  onTabChanged(event: MatTabChangeEvent) {
    this.selectedIndex = event.index;
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { tab: this.selectedIndex }});
  }

}
