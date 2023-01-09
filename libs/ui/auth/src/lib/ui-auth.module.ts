import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { UiSharedModule } from '@ihrms/shared';
import { RouterModule, Routes } from '@angular/router';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { ToastrModule } from 'ngx-toastr';
import { Safe } from './_helpers/auth.interceptor';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { ApolloModule } from 'apollo-angular';

const appRoutes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    CommonModule,
    UiSharedModule,
    RouterModule.forChild(appRoutes),
    NgxUsefulSwiperModule,
    ToastrModule,
    NgxUiLoaderModule,
    ApolloModule
  ],
  declarations: [
    LoginComponent,
    Safe
  ]
})
export class UiAuthModule {}
