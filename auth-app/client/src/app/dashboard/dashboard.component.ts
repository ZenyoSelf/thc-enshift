import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '@app/core/interfaces/auth.interface';
import { AuthService } from '@app/core/services/auth.service';
import { Observable } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Menubar } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,
    MatMenuModule,
    MatIconModule,
    RouterModule, Menubar, AvatarModule, Menu],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  currentUser$: Observable<User | null>;
  items: MenuItem[] | undefined;
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    //This is not a needed way for now, as there's no real state to check.
    //However, it shows a path to build layer on top of.
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Profile',
        items: [
          {
            label: 'Sign out',
            icon: 'pi pi-sign-out',
            command: () => {
              this.logout()
            }
          }

        ]
      }
    ];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
