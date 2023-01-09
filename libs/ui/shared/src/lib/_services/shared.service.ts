import { Injectable } from '@angular/core';
import { NavItem } from '@ihrms/ihrms-sidebar';
import { CONSTANTS } from '../constants/constants';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  NavItemsAdmin!: NavItem[];
  NavItemsEmp!: NavItem[];

  private _permission: any;
  private _environment: any;
  private _userrolepermission: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public get environment(): any {
    return this._environment;
  }

  public set environment(val: any) {
    if(val) {
      this._environment = val;
    }
  }

  public get userrolepermission(): any {
    return this._userrolepermission.asObservable();
  }

  public set userrolepermission(val: any) {
    if(val && val.length) {
      this.generateUserSpecificMenuItems(val[0].privileges);
    }
  }

  constructor(
    private router: Router,
  ) {}

  generateUserSpecificMenuItems(permissionVal: any) {

    this._userrolepermission.next(null);
    this._permission = [];
    this.NavItemsAdmin = [];
    this.NavItemsEmp = [];

    this.NavItemsAdmin.push({
      displayName: 'Home',
      iconName: 'grid_view',
      route: `${CONSTANTS.ADMIN_DASHBOARD}`,
    });

    this.NavItemsEmp.push({
      displayName: 'Home',
      iconName: 'grid_view',
      route: `${CONSTANTS.EMP_DASHBOARD}`,
    });

    const permission: any = JSON.parse(JSON.stringify(permissionVal));
    this._permission = permission;

    permission?.module?.forEach(async(u: any, idx: number) => {

      u.sub_module.forEach((k: any, idy: number) => {

        u.sub_module[idy]['displayName'] = k.name;
        u.sub_module[idy]['route'] = k.url;

        console.log(u.sub_module[idy]['route']); // admin-dashboard/
        if(k.actions.show == true){
          this.NavItemsEmp.push({
            displayName: k.name,
            iconName: k.iconName,
            route: k.url
          });
        }
      });

      if(u.sub_module[0]?.actions.show == true) {
        this.NavItemsAdmin.push({
          displayName: u.name,
          iconName: u.iconName,
          route: u.url,
          children: u.sub_module.filter((sub: any) => sub.isChild)
        });
      }
        });

    this._userrolepermission.next({ NavItemsAdmin: this.NavItemsAdmin, NavItemsEmp: this.NavItemsEmp });

  }
  

  checkuserPermission(moduleDisplayName: any, sub_moduleDisplayName: any, action: any) {

    let allow = false

    this._permission?.module?.forEach(async(u: any, idx: number) => {

        // if(u.name ===module && u.action[action].toLowerCase() == true){
        //   allow = true
        // }
        u.sub_module?.some((u: any, idy: number) => {
          if(u.name === sub_moduleDisplayName && u.actions[action] == true) {
            allow = true;
          }
        });

      });

    return allow;
  }

}
