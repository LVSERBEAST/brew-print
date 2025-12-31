import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'brew-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <!-- Desktop Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <a routerLink="/" class="logo">
            <span class="logo-icon">☕</span>
            <span class="logo-text">BrewPrint</span>
          </a>
        </div>
        
        <nav class="nav">
          @for (item of navItems; track item.path) {
            <a 
              [routerLink]="item.path" 
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
              class="nav-item"
            >
              <span class="nav-icon" [innerHTML]="item.icon"></span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>
        
        <div class="sidebar-footer">
          <a routerLink="/profile" routerLinkActive="active" class="nav-item profile-item">
            <span class="avatar">
              @if (user()?.photoURL) {
                <img [src]="user()!.photoURL" [alt]="user()!.displayName" />
              } @else {
                {{ userInitials() }}
              }
            </span>
            <span class="nav-label">{{ user()?.displayName }}</span>
          </a>
          
          <button class="nav-item logout-btn" (click)="logout()">
            <span class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span class="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="main">
        <ng-content />
      </main>
      
      <!-- Mobile Bottom Nav -->
      <nav class="mobile-nav">
        <div class="mobile-nav-dock">
          @for (item of mobileNavItems; track item.path) {
            <a 
              [routerLink]="item.path" 
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
              class="mobile-nav-item"
            >
              <span class="mobile-nav-icon" [innerHTML]="item.icon"></span>
              <span class="mobile-nav-label">{{ item.label }}</span>
            </a>
          }
        </div>
      </nav>
    </div>
  `,
  styles: `
    .shell {
      display: flex;
      min-height: 100dvh;
    }
    
    // =========================================================================
    // DESKTOP SIDEBAR
    // =========================================================================
    
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: var(--surface-card);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      padding: var(--space-4);
      z-index: var(--z-sticky);
      
      @media (max-width: 768px) {
        display: none;
      }
    }
    
    .sidebar-header {
      padding: var(--space-2) var(--space-3);
      margin-bottom: var(--space-6);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      text-decoration: none;
      color: var(--text-primary);
    }
    
    .logo-icon {
      font-size: 1.75rem;
    }
    
    .logo-text {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--weight-semibold);
      letter-spacing: var(--tracking-tight);
    }
    
    .nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      flex: 1;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: var(--weight-medium);
      font-size: var(--text-sm);
      transition: 
        background var(--duration-fast) var(--ease-default),
        color var(--duration-fast) var(--ease-default);
      
      &:hover {
        background: var(--surface-subtle);
        color: var(--text-primary);
      }
      
      &.active {
        background: var(--color-copper-100);
        color: var(--color-copper-700);
        
        .nav-icon {
          color: var(--color-copper-500);
        }
      }
    }
    
    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--text-muted);
      transition: color var(--duration-fast) var(--ease-default);
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
    
    .sidebar-footer {
      border-top: 1px solid var(--border-subtle);
      padding-top: var(--space-4);
      margin-top: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
    
    .profile-item {
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--color-copper-400), var(--color-copper-500));
        color: var(--color-white);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xs);
        font-weight: var(--weight-semibold);
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    
    .logout-btn {
      width: 100%;
      cursor: pointer;
      
      &:hover {
        background: var(--color-error-light);
        color: var(--color-error);
        
        .nav-icon {
          color: var(--color-error);
        }
      }
    }
    
    // =========================================================================
    // MAIN CONTENT
    // =========================================================================
    
    .main {
      flex: 1;
      margin-left: var(--sidebar-width);
      min-height: 100dvh;
      padding: var(--space-6);
      
      @media (max-width: 768px) {
        margin-left: 0;
        padding: var(--space-4);
        padding-bottom: calc(100px + var(--space-4));
      }
    }
    
    // =========================================================================
    // MOBILE BOTTOM NAV
    // =========================================================================
    
    .mobile-nav {
      display: none;
      position: fixed;
      bottom: var(--space-4);
      left: var(--space-4);
      right: var(--space-4);
      z-index: var(--z-sticky);
      
      @media (max-width: 768px) {
        display: flex;
      }
    }
    
    .mobile-nav-dock {
      flex: 1;
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 64px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: var(--radius-2xl);
      box-shadow: 0 4px 24px rgba(42, 39, 36, 0.15), 0 0 0 1px rgba(42, 39, 36, 0.05);
      padding: 0 var(--space-2);
    }
    
    .mobile-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: var(--space-2);
      border-radius: var(--radius-lg);
      color: var(--text-tertiary);
      text-decoration: none;
      transition: color var(--duration-fast) var(--ease-default);
      min-width: 64px;
      
      &.active {
        color: var(--color-copper-600);
      }
    }
    
    .mobile-nav-icon {
      display: flex;
      
      svg {
        width: 22px;
        height: 22px;
      }
    }
    
    .mobile-nav-label {
      font-size: 11px;
      font-weight: var(--weight-semibold);
      letter-spacing: 0.02em;
    }
  `
})
export class Shell {
  private authService = inject(AuthService);
  
  user = this.authService.currentUser;
  
  userInitials = computed(() => {
    const name = this.user()?.displayName || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  });
  
  navItems: NavItem[] = [
    {
      path: '/',
      label: 'Dashboard',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`
    },
    {
      path: '/brews',
      label: 'Brews',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`
    },
    {
      path: '/beans',
      label: 'Beans',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>`
    },
    {
      path: '/equipment',
      label: 'Gear',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
    }
  ];
  
  mobileNavItems: NavItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
    },
    {
      path: '/brews',
      label: 'Brews',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`
    },
    {
      path: '/beans',
      label: 'Beans',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>`
    },
    {
      path: '/equipment',
      label: 'Gear',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
    }
  ];
  
  logout(): void {
    this.authService.signOut();
  }
}
