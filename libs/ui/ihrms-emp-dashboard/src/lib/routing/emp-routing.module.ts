import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CONSTANTS } from '@ihrms/shared';
import { CreateEmpPostComponent, EmpDashboardComponent, MyProfileWrapComponent } from '@ihrms/emp-dashboard';
import { EmpAttendanceComponent } from '../emp-attendance/emp-attendance.component';
import { EmpAttendanceDetailsComponent } from '../emp-attendance/emp-attendance-details/emp-attendance-details.component';
import { EmpFinancesComponent } from '../emp-finances/emp-finances.component';
import { EmpFinancesDetailsComponent } from '../emp-finances/emp-finances-details/emp-finances-details.component';
import { EmpLeavesComponent } from '../emp-leaves/emp-leaves.component';
import { EmpLeavesDetailsComponent } from '../emp-leaves/emp-leaves-details/emp-leaves-details.component';
import { EmpExpClaimComponent } from '../emp-exp-claim/emp-exp-claim.component';
import { EmpExpClaimDetailsComponent } from '../emp-exp-claim/emp-exp-claim-details/emp-exp-claim-details.component';

const empRoutes: Routes = [
  {
    path: CONSTANTS.EMPTY,
    component: EmpDashboardComponent
  },
  {
    path: CONSTANTS.MY_PROFILE,
    component: MyProfileWrapComponent
  },
  {
    path: CONSTANTS.CREATE_POST,
    component: CreateEmpPostComponent
  },
  {
    path: CONSTANTS.EMP_ATTENDANCE,
    component: EmpAttendanceComponent
  },
  {
    path: CONSTANTS.EMP_ATTENDANCE_DETAILS,
    component: EmpAttendanceDetailsComponent
  },
  {
    path: CONSTANTS.EMP_FINANCES,
    component: EmpFinancesComponent
  },
  {
    path: CONSTANTS.EMP_FINANCES_DETAILS,
    component: EmpFinancesDetailsComponent
  },
  {
    path: CONSTANTS.EMP_LEAVES,
    component: EmpLeavesComponent
  },
  {
    path: CONSTANTS.EMP_LEAVES_DETAILS,
    component: EmpLeavesDetailsComponent
  },
  {
    path: CONSTANTS.EMP_EXPENSE_CLAIM,
    component: EmpExpClaimComponent
  },
  {
    path: CONSTANTS.EMP_EXPENSE_CLAIM_DETAILS,
    component: EmpExpClaimDetailsComponent
  },
  {
    path: CONSTANTS.EMPTY,
    redirectTo: CONSTANTS.EMPTY,
    pathMatch: CONSTANTS.FULL
  }
];

@NgModule({
  imports: [RouterModule.forChild(empRoutes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
