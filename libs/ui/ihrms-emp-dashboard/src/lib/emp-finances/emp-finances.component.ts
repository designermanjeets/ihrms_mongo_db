import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { BehaviorSubject } from 'rxjs';
import { EmpFinancesService } from './_services/emp-finances.service';
import * as moment from 'moment';
import { IhrmsGridComponent } from '@ihrms/ihrms-grid';
import { MultiChartsComponent } from '@ihrms/ihrms-components';
import { CONSTANTS } from '@ihrms/shared';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'ihrms-emp-finances',
  templateUrl: './emp-finances.component.html',
  styleUrls: ['./emp-finances.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpFinancesComponent implements OnInit {

  gridsterOptions: GridsterConfig;
  cardSize = 500;
  gridLoaded = false;
  dashboardItems: Array<GridsterItem> | any;
  gridResize: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  multiChartData: any | undefined;

  constructor(
    private _efs: EmpFinancesService,
    private router: Router
  ) {
    this.gridsterOptions = this._efs.getGridsterOptions(this.cardSize, this);
  }

  ngOnInit(): void {

    this.multiChartData = [
      {
        title: 'My Pay',
        series: {
          config: {
            innerSize: 80,
            depth: 45,
            alpha: 45
          },
          name: 'Percentage',
          type: 'pie',
          data: [
            ['Deductions', 35],
            ['Bonus', 10],
            ['Earnings', 60],
          ]
        },
        flex: 100,
        height: 47
      },
      {
        title: CONSTANTS.TITLES.PayrollHistoric,
        columnFit: true,
        gridData: {
          columnDefs: [
            { field: 'Date', sortable: true, filter: true },
            { field: 'Salary', sortable: true, filter: true, type: 'rightAligned' },
            { field: 'Action', width: 70, cellClass: "grid-cell-centered", cellRenderer: 'GridActionComponent',
              cellRendererParams: {
                action: this.outputActions.bind(this),
                value: { actionBtn: [ 'print', 'download' ] }
              }
            },
          ],
          rowData: [
            { Date: moment('2021-06-24 22:57:36').format("YYYY-MM-DD"), Salary: '$12,000' },
            { Date: moment('2021-05-24 22:57:36').format("YYYY-MM-DD"), Salary: '$11,900' },
            { Date: moment('2011-04-24 22:57:36').format("YYYY-MM-DD"), Salary: '$12,100' }
          ]
        },
        flex: 100,
        height: 47
      },
    ]

    this.setupDashboardItems();

  }

  setupDashboardItems() {

    const columnDefs = [
      { field: 'Component', sortable: true, filter: true },
      { field: 'Amount', sortable: true, filter: true, type: 'rightAligned' },
    ];

    const rowData = [
      { Component: 'Full Basic', Amount: '16,667' },
      { Component: 'Full DA', Amount: '0' },
      { Component: 'Full HRA', Amount: '6,677' },
      { Component: 'Full Conveyance', Amount: '1,600' },
      { Component: 'Special Allowance', Amount: '1,000' },
      // { Component: 'Annual CTC', Amount: '31,000' },
    ]

    const columnDefsSalaryRevisions = [
      { field: 'Effective-Date', sortable: true, filter: true },
      { field: 'Annual-CTC', sortable: true, filter: true, cellRenderer: function(params: any) {
          return '<span><i class="material-icons text-primary bold cell-icon" ihrmsUtil fontSize="12">north</i>' + params.value + '</span>'
        }  },
      { field: 'Designation', sortable: true, filter: true },
      { field: 'Department', sortable: true, filter: true },
      { field: 'Action', width: 70, cellClass: "grid-cell-centered", cellRenderer: 'GridActionComponent',
        cellRendererParams: {
          action: this.outputActions.bind(this),
          value: { actionBtn: [ 'print', 'download' ] }
        }
      },
    ];

    const rowDataSalaryRevisions = [
      {
        'Effective-Date': moment('2021-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual-CTC': '$9500',
        Designation: 'Engineer',
        Department: 'IT'
      },
      {
        'Effective-Date': moment('2020-06-24 22:57:36').format("YYYY-MM-DD"),
        'Annual-CTC': '$9500',
        Designation: 'Engineer',
        Department: 'IT'
      },
    ]

    this.dashboardItems = [
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 2, rows: 1, y: 0, x: 0 },
        inputs: {
          title: CONSTANTS.TITLES.Salary,
          cardRadius: 0,
          rowData: rowData,
          columnDefs: columnDefs,
          flatItem: false,
          columnFit: true,
          pinnedBottomRowData: this.totalRowData()
        },
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event'] }
        }
      },
      {
        dynamicComponent: MultiChartsComponent,
        gridsterItem: { cols: 2, rows: 2, y: 0, x: 2 },
        inputs: {
          cardRadius: 20,
          title: CONSTANTS.TITLES.Overview,
          compData: this.multiChartData,
          filters: false,
        },
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event'] }
        }
      },
      {
        dynamicComponent: IhrmsGridComponent,
        gridsterItem: { cols: 2, rows: 1, y: 1, x: 0 },
        inputs: {
          title: CONSTANTS.TITLES.SalaryRevisions,
          cardRadius: 0,
          rowData: rowDataSalaryRevisions,
          columnDefs: columnDefsSalaryRevisions,
          flatItem: false,
          viewAll: false,
        },
        gridComponentFullHeight: true,
        outputs: {
          onClickHandler: { handler: this.dynamicCompClickHandler.bind(this), args: ['$event'] }
        }
      },
    ];
  }

  totalRowData() {
    const result = [];
    result.push({
      Component: ' Annual CTC ',
      Amount: '$31,000',
    });
    return result;
  }

  dynamicCompClickHandler(event: any) {
    if(event.component && event.comp_name === CONSTANTS.IHRMS_GRID_COMPONENT) {
      if(event.action === CONSTANTS.VIEW_ALL) {
        if(event.component?.title === CONSTANTS.TITLES.PayrollHistoric) {
          const navExtras: NavigationExtras = { queryParams: { tab: 1 } };
          this.router.navigate([`${CONSTANTS.EMP_DASHBOARD}/${CONSTANTS.EMP_FINANCES_DETAILS}`], navExtras)
        }
        if(event.component?.title === CONSTANTS.TITLES.Salary) {
          this.router.navigate([`${CONSTANTS.EMP_DASHBOARD}/${CONSTANTS.EMP_FINANCES_DETAILS}`])
        }
      }
    }
  }

  outputActions(event: any) {
    console.log(event);
  }

}
