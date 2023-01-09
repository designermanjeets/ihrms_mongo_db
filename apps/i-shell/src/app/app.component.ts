import { AfterViewInit, ChangeDetectorRef, Component, Inject, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { notificationItems } from './_models';
import { CONSTANTS, SharedService } from '@ihrms/shared';
import { NavigationEnd, Router } from '@angular/router';
import { profileMenuItemsEmp, profileMenuItemsAdmin } from './_models/profileMenuItems';
import { ProfileMenuItems } from '@ihrms/ihrms-navbar';
import { NotificationConfig, NotificationItem } from '@ihrms/ihrms-components';
import { NavItem } from '@ihrms/ihrms-sidebar';
import { AuthService, Role } from '@ihrms/auth';
import { environment } from '../environments/environment';
import gql from 'graphql-tag';
import { map, Subscription } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { NgxUiLoaderService } from 'ngx-ui-loader';

const TOKEN_KEY = 'auth-token';

export const GQL_ROLES = gql`
  query result(
    $query: Pagination!
  ) {
    getRoles(
      query: $query
    ) {
      _id
      role_name
      status
      isDefault
      comments
      privileges {
        module {
          name
          iconName
          url
          sub_module {
            db
            name
            iconName
            isChild
            url
            actions {
              add
              edit
              show
              delete
              authorize
              cancel
              import
              export
            }
          }
        }
      }
      audit {
        created_at
      }
      
    }
  }
`;
@Component({
  selector: 'ihrms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements AfterViewInit{

  public viewLoaded = false;
  public opened = false; // Change isDocked too
  private isDocked = true;
  public openedNotification = false;
  public mode = 'push' as any;
  public dock = true;
  public isLoggedIn = false;

  sideBarWidth = 230;
  notificationBarWidth = 600;
  dockedSize = '85px'; // Change Dock value in app.component.scss too || translateX(85px)

  navItems!: NavItem[];
  notificationItems: NotificationItem[] = notificationItems;
  profileMenuItems!: ProfileMenuItems[];

  notificationConfig: NotificationConfig = {
    title: 'Company Notifications',
  };
  
  sub!: Subscription;

  constructor(
    translate: TranslateService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    @Optional() private authService: AuthService,
    private sharedService: SharedService,
    private apollo: Apollo,
    private ngxService: NgxUiLoaderService,
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');

    this.userSessionCheck();

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        if(val.url.includes(`${CONSTANTS.ADMIN_DASHBOARD}`)) {
          this.profileMenuItems = profileMenuItemsAdmin;
          this.sharedService.userrolepermission.subscribe((val: any) => {
            console.log(val);
            this.navItems = val?.NavItemsAdmin;
          });
        } else if(val.url.includes(`${CONSTANTS.EMP_DASHBOARD}`)) {
          this.sharedService.userrolepermission.subscribe((val: any) => {
            console.log(val);
            this.navItems = val?.NavItemsEmp;
          });
          this.profileMenuItems = profileMenuItemsEmp;
        }
        this.userSessionCheck();
      }
    });

    this.sharedService.environment = environment;

  }

  userSessionCheck() {
    if(sessionStorage.getItem(TOKEN_KEY)) {
      if(sessionStorage.getItem('tenantId')) {
        this.isLoggedIn = true;
        this.getUserPermissions(JSON.parse(sessionStorage.getItem('role') || '')._id);
      } else if(JSON.parse(sessionStorage.getItem('role') || '').role_name === Role.GONNGOD.toUpperCase()) {
        this.isLoggedIn = true;
      }
    } else {
      this.isLoggedIn = false;
      this.router.navigate(['/login']);
    }
  }

  getUserPermissions(role_id: any) {
    this.sub = this.apollo.watchQuery<any, any>({ query: GQL_ROLES, variables: { query: { limit: 100, id: role_id }}}).valueChanges
      .pipe(map((data: any) => data?.data?.getRoles))
      .subscribe(val => this.sharedService.userrolepermission = val);
  }

  ngAfterViewInit() {
    this.viewLoaded = true;
    this.cdRef.detectChanges();
  }

  enter() {
    if(this.isDocked) {
      this.opened = true;
      this.mode = 'over' as any;
    }
  }

  leave() {
    if(this.isDocked) {
      this.opened = false;
      this.mode = 'push' as any;
    }
  }

  toNumber(val: any) {
    return Number(val.replace('px', ''));
  }

  onNavItemClick(event: any) {
    // console.log(event);
  }

  toggleSidebar(event: any) {
    this.opened = !this.opened;
    this.isDocked = !this.isDocked;
    setTimeout( (_: any) => window.dispatchEvent(new Event('resize')), 300); // For Gridster to force Re-Adjust
  }

  toggleNotification() {
    this.openedNotification = !this.openedNotification;
  }

  profileClickEvent(event: any) {
    if(event.item.id === CONSTANTS.MY_PROFILE) {
      if(this.router.url.includes('admin-dashboard')) {
        this.router.navigateByUrl(`${CONSTANTS.ADMIN_DASHBOARD}/${CONSTANTS.MY_PROFILE}`);
      } else {
        this.router.navigateByUrl(`${CONSTANTS.EMP_DASHBOARD}/${CONSTANTS.MY_PROFILE}`);
      }
    }
    if(event.item.id === CONSTANTS.CREATE_POST) {
      this.router.navigateByUrl(`${CONSTANTS.EMP_DASHBOARD}/${CONSTANTS.CREATE_POST}`);
    }
    if(event.item.id === CONSTANTS.LOGOUT) {
      this.authService.logout();
      this.userSessionCheck();
    }
    if(event.item.id === CONSTANTS.ADMIN_DASHBOARD) {
      this.profileMenuItems = profileMenuItemsAdmin;
      this.router.navigateByUrl(`${CONSTANTS.ADMIN_DASHBOARD}`);
    }
    if(event.item.id === CONSTANTS.EMP_DASHBOARD) {
      this.profileMenuItems = profileMenuItemsEmp;
      this.router.navigateByUrl(`${CONSTANTS.EMP_DASHBOARD}`);
    }
  }

  orgClickEvent(event: any) {
    this.router.navigateByUrl(`${CONSTANTS.EMP_DASHBOARD}/${CONSTANTS.EMP_MY_ORG}`);
  }

  dashboardClickEvent(event: any) {
    this.router.navigateByUrl(`${CONSTANTS.ADMIN_DASHBOARD}/${CONSTANTS.DASHBOARD_ALL}`);
  }

}
