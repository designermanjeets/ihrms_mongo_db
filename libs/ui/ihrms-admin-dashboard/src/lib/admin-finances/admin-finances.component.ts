import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { BehaviorSubject } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { MultiChartsComponent } from '@ihrms/ihrms-components';
import { CONSTANTS } from '@ihrms/shared';
import { AdminFinancesService } from './_services/admin-finances.service';
import { IhrmsChartComponent } from '@ihrms/ihrms-highcharts';

@Component({
  selector: 'ihrms-admin-finances',
  templateUrl: './admin-finances.component.html',
  styleUrls: ['./admin-finances.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminFinancesComponent implements OnInit {

  gridsterOptions: GridsterConfig;
  cardSize = 300;
  gridLoaded = false;
  dashboardItems: Array<GridsterItem> | any;
  gridResize: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  multiChartData: any | undefined;

  constructor(
    private _afs: AdminFinancesService,
    private router: Router
  ) {
    this.gridsterOptions = this._afs.getGridsterOptions(this.cardSize, this);
  }

  ngOnInit(): void {

    this.multiChartData = [
      {
        title: 'Payout Details',
        series: {
          config: {
            innerSize: 80,
            depth: 0,
            alpha: 0,
            tooltipAffix: 'K'
          },
          name: 'Amount',
          type: 'pie',
          data: [
            ['Deductions', 35],
            ['Bonus', 10],
            ['Earnings', 60],
          ]
        },
        flex: 32,
        height: 95
      },
      {
        title: 'Employee Details',
        series: {
          config: {
            alpha: 0,
            beta: 0,
            depth: 0
          },
          name: 'Employees',
          type: 'bar',
          data: [ [40], [45] ]
        },
        xAxisCategories: ['Previous', 'Addition'],
        flex: 32,
        height: 95
      },
      {
        title: "Payroll Inputs",
        columnFit: true,
        gridData: {
          columnDefs: [
            { field: 'Input', sortable: true, filter: true },
            { field: 'Action', width: 100, cellRenderer: 'GridActionComponent',
              cellRendererParams: {
                action: this.outputActions.bind(this),
                value: { type: 'switch', options: [ 'Release', 'Lock'  ] }
              }},
          ],
          rowData: [
            { Input: 'Payroll Inputs' },
            { Input: 'Employee View Release' },
            { Input: 'Statement View' },
            { Input: 'Payroll' },
          ]
        },
        flex: 32,
        height: 95
      },
    ]

    this.setupDashboardItems();

  }

  setupDashboardItems() {

    this.dashboardItems = [
      {
        dynamicComponent: MultiChartsComponent,
        gridsterItem: { cols: 3, rows: 4, y: 0, x: 0 },
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
        dynamicComponent: IhrmsChartComponent,
        gridsterItem: { cols: 1, rows: 3, y: 4, x: 0 },
        inputs: {
          charTitle: 'Salary On Hold',
          series: {
            config: {
              innerSize: 50,
              depth: 0,
              alpha: 0,
              tooltipAffix: 'K'
            },
            name: 'Amount',
            type: 'pie',
            data: [
              ['On Hold', 35]
            ]
          },
          xAxisCategories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        }
      },
      {
        dynamicComponent: IhrmsChartComponent,
        gridsterItem: { cols: 1, rows: 3, y: 4, x: 1 },
        inputs: {
          charTitle: 'Salary Released',
          series: {
            config: {
              innerSize: 50,
              depth: 0,
              alpha: 0,
              tooltipAffix: 'K'
            },
            name: 'Amount',
            type: 'pie',
            data: [
              ['Released', 35],
            ]
          },
        }
      },
      {
        dynamicComponent: IhrmsChartComponent,
        gridsterItem: { cols: 1, rows: 3, y: 4, x: 1 },
        inputs: {
          charTitle: 'Overtime',
          series: {
            config: {
              beta: 0,
              depth: 0,
              alpha: 0
            },
            name: 'Overtime hours',
            type: 'column',
            data: [
              [13],
              [25],
              [22],
              [22]
            ]
          },
          xAxisCategories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
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
        if(event.component?.title === CONSTANTS.TITLES.PayrollInputs) {
          const navExtras: NavigationExtras = { queryParams: { tab: 2 } };
          this.router.navigate([`${CONSTANTS.ADMIN_DASHBOARD}/${CONSTANTS.ADMIN_FINANCES_DETAILS}`], navExtras)
        }
      }
    }
  }

  outputActions(event: any) {
    console.log(event);
  }

}
