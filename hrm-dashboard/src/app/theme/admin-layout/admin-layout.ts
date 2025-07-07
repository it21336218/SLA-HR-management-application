import { BidiModule } from '@angular/cdk/bidi';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgProgressbar } from 'ngx-progressbar';
import { NgProgressRouter } from 'ngx-progressbar/router';
import { Subscription, filter } from 'rxjs';

import { AppSettings, SettingsService } from '@core';
import { Customizer } from '../customizer/customizer';
import { Header } from '../header/header';
import { SidebarNotice } from '../sidebar-notice/sidebar-notice';
import { Sidebar } from '../sidebar/sidebar';
import { Topmenu } from '../topmenu/topmenu';

const MOBILE_MEDIAQUERY = 'screen and (max-width: 599px)';
const TABLET_MEDIAQUERY = 'screen and (min-width: 600px) and (max-width: 959px)';
const MONITOR_MEDIAQUERY = 'screen and (min-width: 960px)';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterOutlet,
    BidiModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    NgProgressbar,
    NgProgressRouter,
    Header,
    Topmenu,
    Sidebar,
    SidebarNotice,
    Customizer,
  ],
  host: {
    '[class.matero-content-width-fix]': 'contentWidthFix',
    '[class.matero-sidenav-collapsed-fix]': 'collapsedWidthFix',
  },
})
export class AdminLayout implements OnDestroy {
  @ViewChild('sidenav', { static: true }) sidenav!: MatSidenav;
  @ViewChild('content', { static: true }) content!: MatSidenavContent;

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly settings = inject(SettingsService);

  options = this.settings.options;

  // HRM Mode settings
  hrmMode = true; // Set to true to enable HRM layout
  hideHeaderInHrm = false; // Set to false to show header

  // HRM Sidebar state
  sidebarCollapsed = false;
  sidenavNoticeOpen = false;

  // HRM Menu state
  selectedUserManagement = 'user-management';
  selectedUserRole = 'user-roles';
  activeMenuItem = 'admin';

  get themeColor() {
    return this.settings.getThemeColor();
  }

  get isOver() {
    return this.isMobileScreen;
  }

  private isMobileScreen = false;
  private isContentWidthFixed = true;

  get contentWidthFix() {
    // Disable content width fix in HRM mode
    if (this.hrmMode) {
      return false;
    }
    return (
      this.isContentWidthFixed &&
      this.options.navPos === 'side' &&
      this.options.sidenavOpened &&
      !this.isOver
    );
  }

  get collapsedWidthFix() {
    // Disable collapsed width fix in HRM mode
    if (this.hrmMode) {
      return false;
    }
    return (
      this.isCollapsedWidthFixed &&
      (this.options.navPos === 'top' || (this.options.sidenavOpened && this.isOver))
    );
  }

  private isCollapsedWidthFixed = false;
  private layoutChangesSubscription = Subscription.EMPTY;

  constructor() {
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_MEDIAQUERY, TABLET_MEDIAQUERY, MONITOR_MEDIAQUERY])
      .subscribe(state => {
        // SidenavOpened must be reset true when layout changes
        this.options.sidenavOpened = true;

        this.isMobileScreen = state.breakpoints[MOBILE_MEDIAQUERY];

        // In HRM mode, handle mobile sidebar differently
        if (this.hrmMode && this.isMobileScreen) {
          this.sidebarCollapsed = true;
        } else if (!this.hrmMode) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_MEDIAQUERY];
        }

        this.isContentWidthFixed = state.breakpoints[MONITOR_MEDIAQUERY];
      });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(e => {
      if (this.isOver) {
        this.sidenav?.close();
      }
      this.content?.scrollTo({ top: 0 });
    });
  }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  // HRM Sidebar methods
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    console.log('Sidebar collapsed:', this.sidebarCollapsed);
  }

  toggleSidenavNotice(): void {
    this.sidenavNoticeOpen = !this.sidenavNoticeOpen;
    console.log('Sidebar notice open:', this.sidenavNoticeOpen);
  }

  closeSidenavNotice(): void {
    this.sidenavNoticeOpen = false;
  }

  // HRM Menu methods
  onMenuItemSelected(menuItem: string): void {
    this.activeMenuItem = menuItem;
    console.log('Menu item selected:', menuItem);

    // Handle menu navigation
    switch(menuItem) {
      case 'admin':
        this.router.navigate(['/dashboard']);
        break;
      case 'templates':
        this.router.navigate(['/templates']);
        break;
      default:
        console.log('Unknown menu item:', menuItem);
    }
  }

  onUserManagementChanged(value: string): void {
    console.log('User Management changed:', value);

    // Handle user management dropdown change
    switch(value) {
      case 'user-management':
        // Show user management view
        this.router.navigate(['/dashboard'], { queryParams: { view: 'users' } });
        break;
      case 'employee-management':
        // Show employee management view
        this.router.navigate(['/dashboard'], { queryParams: { view: 'employees' } });
        break;
      case 'department-management':
        // Show department management view
        this.router.navigate(['/dashboard'], { queryParams: { view: 'departments' } });
        break;
    }
  }

  onUserRoleChanged(value: string): void {
    console.log('User Role changed:', value);

    // Handle user role dropdown change
    switch(value) {
      case 'user-roles':
        // Show all user roles
        this.router.navigate(['/dashboard'], { queryParams: { filter: 'all' } });
        break;
      case 'admin':
        // Filter for admin roles only
        this.router.navigate(['/dashboard'], { queryParams: { filter: 'admin' } });
        break;
      case 'manager':
        // Filter for manager roles only
        this.router.navigate(['/dashboard'], { queryParams: { filter: 'manager' } });
        break;
      case 'employee':
        // Filter for employee roles only
        this.router.navigate(['/dashboard'], { queryParams: { filter: 'employee' } });
        break;
    }
  }

  // Standard ng-matero methods (keep for compatibility)
  toggleCollapsed() {
    if (this.hrmMode) {
      this.toggleSidebar();
      return;
    }

    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }

  resetCollapsedState(timer = 400) {
    setTimeout(() => {
      this.settings.setOptions(this.options);
    }, timer);
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
    this.settings.setOptions(this.options);
  }

  updateOptions(options: AppSettings) {
    this.options = options;
    this.settings.setOptions(options);
    this.settings.setDirection();
    this.settings.setTheme();
  }

  // Utility methods
  toggleHrmMode(): void {
    this.hrmMode = !this.hrmMode;
    if (this.hrmMode) {
      // Reset to default HRM state
      this.sidebarCollapsed = false;
      this.activeMenuItem = 'admin';
      this.selectedUserManagement = 'user-management';
      this.selectedUserRole = 'user-roles';
    } else {
      // Reset to ng-matero state
      this.options.sidenavOpened = true;
      this.options.sidenavCollapsed = false;
    }
    this.settings.setOptions(this.options);
  }

  toggleHeaderVisibility(): void {
    this.hideHeaderInHrm = !this.hideHeaderInHrm;
  }
}
