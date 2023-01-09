import { ColumnApi } from '@ag-grid-community/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GridApi, ICellRendererParams } from 'ag-grid-community';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, delay, map, Observable, of, Subject, Subscription, switchMap } from 'rxjs';
import { GQL_EMPLOYEE_PAY_CALCULATE, GQL_PAYSTRUCTURE, SalarySettingsService } from '../_services/salary-settings.service';
import * as _ from 'lodash';
import { CONSTANTS } from '@ihrms/shared';
import { ControlBase } from '@ihrms/ihrms-dynamic-forms';
import { GQL_DEPARTMENTS } from '../../../admin-departments/_services/admin-departments.service';
import { GQL_EMPLOYEES } from '@ihrms/ihrms-components';
import { IhrmsAdminDashboardService } from '../../../_services/ihrms-admin-dashboard.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
const excel_formula = require('excel-formula');

@Component({
  selector: 'ihrms-employee-pay',
  templateUrl: './employee-pay.component.html',
  styleUrls: ['./employee-pay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeePayComponent implements OnInit {

  formulaChartData: any | undefined;
  formulaBtnText = 'Add Formula';
  formulaGridApi!: GridApi;
  formulaGridColumnApi!: ColumnApi;
  formFormula!: FormGroup;

  form!: FormGroup;
  controls$!: Observable<ControlBase<any>[]>;
  controlsObj!: ControlBase<any>[];
  formSubmit$: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  @Output() dialogEventEmitter: EventEmitter<any> = new EventEmitter<any>();

  userRowCurrentSelected!: number;
  userRowIndexOrID: Subject<any> = new Subject();

  sub!: Subscription;
  salaryStrucOptions: any;
  generateColumns = false;

  trackAllColumns: any = [];
  isCalculationDone = true;

  constructor(
    private cdRef: ChangeDetectorRef,
    private _sls: SalarySettingsService,
    private apollo: Apollo,
    private toastrService: ToastrService,
    private _ihrmsadss: IhrmsAdminDashboardService,
    private ngxService: NgxUiLoaderService
  ) { }

  ngOnInit(): void {

    this.controls$ = this._sls.getPayEmployeeSalarySettingControls();
    this.controls$.subscribe(val => this.controlsObj = val);

    this.formulaChartData = {
      title: '',
      columnFit: true,
      pagination: true,
      paginationPageSize: 10,
      gridData: {
        columnDefs: [
          { field: '_id', hide: true, filter: false },
          { field: 'username', headerName: 'Username', filter: false },
          // { 
          //   field: 'salaryStructure', 
          //   headerName: 'Salary Structure',
          //   editable: true,
          //   filter: false,
          //   cellClassRules: { "cell-editable-ms": (params: any) => true },
          //   cellEditor: 'agRichSelectCellEditor',
          //   cellRenderer: this.getSelectedValue.bind(this),
          //   cellEditorPopup: false,
          //   cellEditorParams: {
          //     values: [], //this.extractValues(this.salaryStrucOptions)
          //     refData: this.salaryStrucOptions,
          //     cellHeight: 20,
          //     formatValue: (value: any) => value,
          //     searchDebounceDelay: 500
          //   }
          // },
        ],
        rowData: [],
        updateGridFromOutside: this.userRowIndexOrID,
      },
      flex: 100
    };

    this.getDepartments();
    
    this.getPayStructures();

  }

  onCellValueChangedOut(event: any) {
    this.ngxService.startLoader('global_loader');
    this.calculateSalary(event.event);
  }

  private calculateSalary(paramsz: ICellRendererParams ) {

    let params = _.cloneDeep(paramsz);
    const colID: any = params.column?.getColId();
    params.data[colID] = params.value;

    const ifExists = this.trackAllColumns.filter((colId: any) => Object.keys(colId)[0] === colID)[0];
    if(ifExists && params.value !== undefined && params.value !== null) {
      ifExists[colID] = params.value;
    } else {
      params.value !== undefined && params.value !== null && this.trackAllColumns.push({ [colID]: params.value });
    }

    const payHeadsToSend: any = [];
    this.trackAllColumns.forEach((col: any, idx: number) => {
      payHeadsToSend.push({
        name: Object.keys(col)[0],
        value: col[Object.keys(col)[0]],
      });
    })

    const payload = {
      username: params.data?.username,
      salaryStructure: this.form?.value?.salary_structure,
      payHeads: payHeadsToSend.filter((ph: any) => ph.name !== 'username') // Remove Non Pay Head Columns
    };

    if(colID !== 'username' && payload.payHeads.length) {
      this.isCalculationDone = false;
      this.calculatePayStructures(payload, paramsz.rowIndex);
    }

  }

  private calculateEditableColumns(selected_structurez: any, colDefs: any) {

    const all_tokens: any = [];
    let selected_structure = _.cloneDeep(selected_structurez);
    let combineFormula: any = []

    selected_structure.payHeads.forEach((payhead: any) => {
      payhead.computedFormula?.formula && all_tokens.push(...excel_formula.getTokens(payhead.computedFormula.formula));
      payhead.computedFormula?.formula && combineFormula.push(excel_formula.toJavaScript(payhead.computedFormula.formula))
    });

    combineFormula = combineFormula.join('+');

    const filter_only_heads = _.uniqBy(_.filter(all_tokens, (tok) => _.some(selected_structure.payHeads, (ph) => tok.value === ph.name && ph.computedFormula)), 'value');
    const left_out_heads = _.filter(selected_structure.payHeads, (ph) => !_.some(filter_only_heads, (filter_head) => ph.name === filter_head.value));


    // console.log(all_tokens);
    // console.log(selected_structure.payHeads);
    // console.log(combineFormula);
    // console.log(filter_only_heads);
    // console.log(left_out_heads);

    const cellClassRules = {
      "cell-editable-ms": (params: any) => true
    };

    _.forEach(colDefs, (col: any) => {
      const filtered = left_out_heads.filter(lftCol => lftCol.name === col.colId)[0];
      if(true) { // filtered,, If we want only non formula fields editable
        col.editable = col.colId !== 'username';
        // col.cellRenderer = this.calculateSalary.bind(this, selected_structure.payHeads, combineFormula);
        col['extra_structure_data'] = { payHeads: selected_structure.payHeads, combineFormula };
        col.cellClassRules = col.colId !== 'username' && cellClassRules
      }
    });
    this.formulaGridApi.setColumnDefs(colDefs || []);
    this.formulaGridApi.sizeColumnsToFit();

  }
  
  private generateDynamicPayHeadCols(formData: any, usersz: any) {

    let users = _.cloneDeep(usersz);
    const selected_structure = this.salaryStrucOptions.filter((struc: any) => struc._id === formData.salary_structure)[0];

    if(selected_structure) {

      let colDefs = _.cloneDeep(this.formulaGridApi.getColumnDefs());
      colDefs = colDefs?.slice(0, 2);

      const cellClassRules = {
        "cell-editable-ms": (params: any) => params.column.colId === 'Basic'
      };

      _.forEach(selected_structure.payHeads, (str: any, idx: number) => {
        if(colDefs?.length) {
          colDefs.push({
            field : str.name,
            filter: false,
            editable: str.name === 'Basic',
            cellClassRules: cellClassRules
          });
        }
      });

      _.forEach(users, u => _.forEach(selected_structure.payHeads, ph => u[ph.name] = '0'));

      this.formulaGridApi.setRowData(users);
      this.formulaGridApi.setColumnDefs(colDefs || []);
      this.formulaGridApi.sizeColumnsToFit();
      // this.calculateEditableColumns(selected_structure, colDefs);
    }
  }

  extractValues(options: any) {
    console.log(options);
    const newOpts: any = []; _.forEach(_.cloneDeep(options), payStru => newOpts.push(payStru.salaryStructure));
    return newOpts;
  }

  onDataChangeHandler(event: any) {
    console.log(event);
  }

  formulaCtrlChange(string: any) {
    //
  }
 
  getDepartments() {
    this.sub = this.apollo.watchQuery<any, any>({ query: GQL_DEPARTMENTS, variables: { query: { limit: 100 }}}).valueChanges
      .pipe(map((data: any) => data?.data?.getDepartments))
      .subscribe(val => {
        this._ihrmsadss.getSelectOptions(this.controlsObj, val, 'department', '_id');
      });
  }

  getUserByDepartmentID(formData: any) {
    return this.apollo.watchQuery<any, any>({ query: GQL_EMPLOYEES, variables: { query: { limit: 100, departmentId: formData.department }}}).valueChanges
      .pipe(delay(100), map((data: any) => data?.data?.getUsers))
      .subscribe(val => this.generateDynamicPayHeadCols(formData, val));
  }

  getUserByID(userID: string) {
    return this.apollo.watchQuery<any, any>({ query: GQL_EMPLOYEES, variables: { query: { limit: 100, id: userID }}}).valueChanges
      .pipe(map((data: any) => data?.data?.getUsers))
      .subscribe(val => {
        // 
      });
  }

  getPayStructures() {
    this.sub = this.apollo.watchQuery<any, any>({ query: GQL_PAYSTRUCTURE, variables: { query: { limit: 100 }}}).valueChanges
      .pipe(map((data: any) => data?.data?.getPayStructures))
      .subscribe(val => {
        this.salaryStrucOptions = val;
        this._ihrmsadss.getSelectOptions(this.controlsObj, this.salaryStrucOptions, 'salary_structure', '_id', 'printName');
      });
  }

  calculatePayStructures(payload: any, rowIndex: number) {
    this.apollo.mutate({ mutation: GQL_EMPLOYEE_PAY_CALCULATE, variables: { input: payload} })
    .pipe(map((res: any) => res?.data.calculatePayStructure))
    .subscribe((val: any) => {
      if(val) {
        const convertToGridRows: any = [];
        val.calculatedPayHeads.forEach((r: any) => convertToGridRows.push({ [r.name]: r.calculatedValue }));
        const gridObj = Object.assign({}, val, ...convertToGridRows);
        delete gridObj.calculatedPayHeads;
        this.userRowIndexOrID.next({rowIndex, rowData: gridObj, action: CONSTANTS.EDIT})
        this.toastrService.success( `Success`, `Data Calculated Successfully!`, { } );
        this.isCalculationDone = true;
        this.ngxService.stopLoader('global_loader');
      }
    }, err=> {
      this.isCalculationDone = true;
      this.ngxService.stopLoader('global_loader');
    });
  }
 
  formObjectEvent(form: FormGroup) {
    this.form = form;
    this.form.get('salary_structure')?.disable();
    this.form.get('department')?.valueChanges
    // .pipe(
    //   switchMap(id => id ? this.getUser(id) : of([])),
    // )
    .subscribe(val => {
      if(val) {
        this.form.get('salary_structure')?.enable();
      } else {
        this.form.get('salary_structure')?.disable();
      }
    });
  }

  formSubmitEvent(event: any) {
    this.formulaGridApi.setRowData([]);
    this.getUserByDepartmentID(event);
  }

  onSelect(event: any) {
    this.formSubmit$.next(true);
  }

  onFormulaGridReady(event: any) {
    this.formulaGridApi = event.gridApi;
    this.formulaGridColumnApi = event.gridColumnApi;
  }

  outputFormulaActions(event: any) {
    if (event.action === CONSTANTS.EDIT) {
      // Form Patch
      this.formulaBtnText = 'Edit Formula';
      this.userRowCurrentSelected = event.params.rowIndex;
    }
    if (event.action === CONSTANTS.CANCEL) {
      // this.salaryStructureGridApi.applyTransaction({ remove: [event.params.data] });
    }
  }

}
