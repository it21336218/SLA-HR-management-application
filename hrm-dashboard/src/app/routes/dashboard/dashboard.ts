// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  avatar?: string;
  lastLogin: Date;
  createdAt: Date;
  phoneNumber?: string;
  address?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  // HRM Dropdown selections
  selectedUserManagement = 'user-management';
  selectedUserRole = 'user-roles';

  // Table configuration
  displayedColumns: string[] = ['id', 'avatar', 'name', 'email', 'role', 'department', 'lastLogin', 'actions'];

  // Search and filter
  searchTerm = '';
  selectedRoleFilter = '';

  // Pagination
  pageSize = 10;
  totalUsers = 0;
  currentPage = 0;

  // Edit dialog properties
  showEditDialog = false;
  editUserForm!: FormGroup;
  selectedUser: User | null = null;

  // Sample user data
  allUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'Admin',
      department: 'IT',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastLogin: new Date('2024-01-15T10:30:00'),
      createdAt: new Date('2023-06-01'),
      phoneNumber: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@company.com',
      role: 'Employee',
      department: 'Sales',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastLogin: new Date('2024-01-13T09:15:00'),
      createdAt: new Date('2023-08-20'),
      phoneNumber: '+1 (555) 234-5678',
      address: '456 Oak Ave, City, State 12345'
    },
    {
      id: 4,
      name: 'Alice Wilson',
      email: 'alice.wilson@company.com',
      role: 'Manager',
      department: 'Marketing',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      lastLogin: new Date('2024-01-12T14:20:00'),
      createdAt: new Date('2023-09-10'),
      phoneNumber: '+1 (555) 345-6789',
      address: '789 Pine St, City, State 12345'
    },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie.brown@company.com',
      role: 'Employee',
      department: 'Finance',
      status: 'Inactive',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      lastLogin: new Date('2024-01-10T11:30:00'),
      createdAt: new Date('2023-10-05'),
      phoneNumber: '+1 (555) 456-7890',
      address: '321 Elm St, City, State 12345'
    },
    {
      id: 6,
      name: 'Diana Prince',
      email: 'diana.prince@company.com',
      role: 'Admin',
      department: 'Operations',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      lastLogin: new Date('2024-01-11T16:45:00'),
      createdAt: new Date('2023-11-12'),
      phoneNumber: '+1 (555) 567-8901',
      address: '654 Maple Dr, City, State 12345'
    }
  ];

  filteredUsers: User[] = [];

  constructor(private fb: FormBuilder) {
    this.initializeEditForm();
  }

  ngOnInit(): void {
    this.filterUsers();
  }

  // Initialize the edit form
  initializeEditForm(): void {
    this.editUserForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      department: ['', Validators.required],
      status: ['Active'],
      phoneNumber: [''],
      address: ['']
    });
  }

  // HRM Dropdown handlers
  onUserManagementChange(): void {
    console.log('User Management changed to:', this.selectedUserManagement);
    // Handle user management dropdown change
    switch(this.selectedUserManagement) {
      case 'user-management':
        // Show user management view
        this.filterUsers();
        break;
      case 'employee-management':
        // Filter for employees only
        this.selectedRoleFilter = 'Employee';
        this.filterUsers();
        break;
      case 'department-management':
        // Show department view
        break;
    }
  }

  onUserRoleChange(): void {
    console.log('User Role changed to:', this.selectedUserRole);
    // Handle user role dropdown change
    switch(this.selectedUserRole) {
      case 'user-roles':
        this.selectedRoleFilter = '';
        break;
      case 'admin':
        this.selectedRoleFilter = 'Admin';
        break;
      case 'manager':
        this.selectedRoleFilter = 'Manager';
        break;
      case 'employee':
        this.selectedRoleFilter = 'Employee';
        break;
    }
    this.filterUsers();
  }

  // Filter and search functionality
  filterUsers(): void {
    let filtered = [...this.allUsers];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term)
      );
    }

    // Apply role filter
    if (this.selectedRoleFilter) {
      filtered = filtered.filter(user => user.role === this.selectedRoleFilter);
    }

    this.totalUsers = filtered.length;

    // Apply pagination
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredUsers = filtered.slice(startIndex, endIndex);
  }

  // Pagination handler
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.filterUsers();
  }

  // User actions
  addUser(): void {
    console.log('Add user clicked');
    // TODO: Open add user dialog or navigate to add user page
    // For now, add a sample user
    const newUser: User = {
      id: this.allUsers.length + 1,
      name: 'New User',
      email: 'new.user@company.com',
      role: 'Employee',
      department: 'General',
      status: 'Active',
      lastLogin: new Date(),
      createdAt: new Date()
    };

    this.allUsers.unshift(newUser);
    this.filterUsers();
  }

  viewUser(userId: number): void {
    console.log('View user:', userId);
    const user = this.allUsers.find(u => u.id === userId);
    if (user) {
      // TODO: Open user details dialog or navigate to user details page
      alert(`Viewing user: ${user.name}`);
    }
  }

  // Edit user method - opens the dialog
  editUser(userId: number): void {
    console.log('Edit user:', userId);
    this.selectedUser = this.allUsers.find(u => u.id === userId) || null;

    if (this.selectedUser) {
      // Split the name into first and last name
      const nameParts = this.selectedUser.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Populate the form with user data
      this.editUserForm.patchValue({
        firstName: firstName,
        lastName: lastName,
        email: this.selectedUser.email,
        role: this.selectedUser.role,
        department: this.selectedUser.department,
        status: this.selectedUser.status,
        phoneNumber: this.selectedUser.phoneNumber || '',
        address: this.selectedUser.address || ''
      });

      // Show the dialog
      this.showEditDialog = true;
    }
  }

  // Close edit dialog
  closeEditDialog(): void {
    this.showEditDialog = false;
    this.selectedUser = null;
    this.editUserForm.reset();
  }

  // Update user method
  updateUser(): void {
    if (this.editUserForm.valid && this.selectedUser) {
      const formValue = this.editUserForm.value;

      // Update the user object
      this.selectedUser.name = `${formValue.firstName} ${formValue.lastName}`.trim();
      this.selectedUser.email = formValue.email;
      this.selectedUser.role = formValue.role;
      this.selectedUser.department = formValue.department;
      this.selectedUser.status = formValue.status;
      this.selectedUser.phoneNumber = formValue.phoneNumber;
      this.selectedUser.address = formValue.address;

      // Update the user in your main users array
      const userIndex = this.allUsers.findIndex(user => user.id === this.selectedUser!.id);
      if (userIndex !== -1) {
        this.allUsers[userIndex] = { ...this.selectedUser };
      }

      // Refresh the filtered users
      this.filterUsers();

      // Close the dialog
      this.closeEditDialog();

      // Show success message
      this.showSuccessMessage('User updated successfully!');
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.editUserForm.controls).forEach(key => {
        this.editUserForm.get(key)?.markAsTouched();
      });
    }
  }

  deleteUser(userId: number): void {
    console.log('Delete user:', userId);
    const user = this.allUsers.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.allUsers = this.allUsers.filter(u => u.id !== userId);
      this.filterUsers();
    }
  }

  // Success message method
  showSuccessMessage(message: string): void {
    // You can implement your preferred notification method here
    // For example, using a toast notification or snackbar
    console.log(message);
    alert(message); // Temporary - replace with proper notification
  }

  // Utility methods
  getUserStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getRoleBadgeClass(role: string): string {
    return `role-${role.toLowerCase()}`;
  }
}
