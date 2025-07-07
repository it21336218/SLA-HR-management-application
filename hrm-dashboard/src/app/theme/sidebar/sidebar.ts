// Modified sidebar.ts for HRM Layout
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';

import { Sidemenu } from '../sidemenu/sidemenu';
import { Branding } from '../widgets/branding';
import { UserPanel } from './user-panel';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule, // Add FormsModule for ngModel
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    Branding,
    Sidemenu,
    UserPanel,
  ],
})
export class Sidebar {
  @Input() showToggle = true;
  @Input() showUser = false; // Set to false for HRM layout
  @Input() showHeader = true;
  @Input() toggleChecked = false;
  @Input() hrmMode = true; // New input to enable HRM mode

  @Output() toggleCollapsed = new EventEmitter<void>();
  @Output() closeSidenav = new EventEmitter<void>();
  @Output() menuItemSelected = new EventEmitter<string>(); // New output for menu selection
  @Output() userManagementChanged = new EventEmitter<string>(); // New output
  @Output() userRoleChanged = new EventEmitter<string>(); // New output

  // HRM specific properties
  selectedUserManagement = 'user-management';
  selectedUserRole = 'user-roles';
  activeMenuItem = 'admin';

  // HRM menu methods
  onMenuItemClick(itemId: string): void {
    this.activeMenuItem = itemId;
    this.menuItemSelected.emit(itemId);

    console.log('Menu item clicked:', itemId);

    // You can add navigation logic here or emit to parent component
    switch(itemId) {
      case 'admin':
        // Handle admin menu click
        break;
      case 'templates':
        // Handle templates menu click
        break;
    }
  }

  onUserManagementChange(value: string): void {
    this.userManagementChanged.emit(value);
    console.log('User Management changed to:', value);
  }

  onUserRoleChange(value: string): void {
    this.userRoleChanged.emit(value);
    console.log('User Role changed to:', value);
  }
}
