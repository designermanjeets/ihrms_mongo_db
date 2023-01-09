import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GeneralSettingsComponent } from '../admin-settings/general-settings/general-settings.component';
import { OtherMastersComponent } from '../other-masters/other-masters.component';
import { ActivatedRoute, Router, RouterLinkActive, Routes } from '@angular/router';
import { SharedService } from '@ihrms/shared';
import { CONSTANTS } from '@ihrms/shared';

@Component({
  selector: 'ihrms-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSettingsComponent implements AfterViewInit, OnInit {
  isViewInitialized = false;

  navLinks = [] as any;

  headerbar = [] as any;
  headerbardata = [] as any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private sharedService: SharedService
  ) {}

  
  ngOnInit() {
     this.sharedService.userrolepermission?.subscribe((val: any) => {
      console.log(val);
      this.headerbar = val?.NavItemsAdmin;
    });
    console.log('kkkk',this.headerbar);
    console.log('sssss',this.route?.routeConfig?.children);
    
    this.route?.routeConfig?.children?.forEach(async(m: any,) => {
    this.headerbar?.forEach(async(u: any,) => {
      if(u.displayName=='Settings'){
        u.children.forEach(async(k: any) => {
        if(m.path==k.name){
        this.headerbardata.push({
          path: m.path,
          component:m.component,
          data: m.data
        });
      }
      })
      }
    })  
    })
    // this.navLinks = (
    //   this.route.routeConfig && this.route.routeConfig.children ?
    //     this.buildNavItems(this.route.routeConfig.children) :[]
    // );
      this.navLinks = (
      this.route.routeConfig && this.route.routeConfig.children ?
        this.buildNavItems(this.headerbardata) :[]
    );
  
  }

  ngAfterViewInit() {
    this.isViewInitialized = true;
    this.changeDetector.detectChanges();
  }

  buildNavItems(routes: Routes) {
    return (routes)
      .filter(route => route.data)
      .map(({ path = '', data }) => ({
        path: path,
        label: data?.label,
        icon: data?.icon
      }));
  }
}
