import { Injectable } from '@angular/core';
import { CompactType, DisplayGrid, GridsterItem, GridType } from 'angular-gridster2';

@Injectable({
  providedIn: 'root'
})
export class EmpFinancesService {

  getGridsterOptions(cardSize: number, _this: any, gridType?: any) {
    return {
      fixedRowHeight: cardSize,
      gridType: gridType !== 'scroll'? GridType.Fit: GridType.VerticalFixed,
      compactType: CompactType.CompactUp,
      draggable: { enabled: false },
      resizable: {
        enabled: true
      },
      swap: false,
      pushItems: true,
      disablePushOnDrag: false,
      disablePushOnResize: false,
      useTransformPositioning: true,
      displayGrid: DisplayGrid.None,
      itemChangeCallback: (item: GridsterItem) => {
        // update DB with new size
      },
      itemResizeCallback: (item: GridsterItem) => {
        // update DB with new size
      },
      initCallback: (GridsterComponent: any) => {
        setTimeout( (_: any) => _this.gridResize.next(true), 500); // Sometimes Buggy
      }
    };
  }

}
