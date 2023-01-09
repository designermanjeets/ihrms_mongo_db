import { Component } from '@angular/core';
import { CONSTANTS } from '@ihrms/shared';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'ihrms-grid-action',
  templateUrl: './grid-action.component.html',
  styleUrls: ['./grid-action.component.scss']
})
export class GridActionComponent implements ICellRendererAngularComp {

  public params: any;
  public paramsVal: any;
  public isDisabled: any = [];

  agInit(params: any): void {
    if(params.type === CONSTANTS.REQUEST_LEAVE || params.type === CONSTANTS.REQUEST_ATTENDANCE || params.type === CONSTANTS.REQUEST) {
      if(params.data.status === CONSTANTS.Approved || params.data.status === CONSTANTS.Rejected || params.data.status === CONSTANTS.Recalled) {
        params.value.actionBtn.forEach((_: any) => this.isDisabled.push(true) );
      } else {
        params.value.actionBtn.forEach((_: any) => this.isDisabled.push(false) );
      }
    }
    this.params = params;
    this.paramsVal = params.value;
  }

  btnAction(event: any, btnAction: string) {
    event.stopPropagation();
    this.params.action({ action: btnAction, params: this.params });
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }


}
