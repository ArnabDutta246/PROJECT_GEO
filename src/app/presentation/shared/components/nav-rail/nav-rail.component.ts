import { Component, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, IDefaultUser } from '../../../../services/auth/auth';
import { ProjectPermissionService } from '@domain/services/project-permission.service';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import {
  PROJECT_CREATE_CONTEXT_KEY,
  ProjectCreateContext,
  serializeProjectCreateContext,
} from '@domain/value-objects/project-create-context.vo';

interface AccountUserView {
  name: string;
  userId: string;
  role: string;
}

export type NavRailActiveItem = 'map' | 'measurement' | 'newProject';

export type NavRailCreateJurisdiction = Pick<
  ProjectCreateContext,
  'stateId' | 'districtId' | 'blockId'
>;

@Component({
  selector: 'app-nav-rail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-rail.component.html',
})
export class NavRailComponent {
  readonly activeItem = input<NavRailActiveItem>('map');
  readonly createJurisdiction = input<NavRailCreateJurisdiction | null>(null);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly projectPermission = new ProjectPermissionService();
  private readonly userProfile = signal<IDefaultUser | null>(null);

  protected readonly accountOpen = signal(false);
  protected readonly accountUser = signal<AccountUserView | null>(null);

  constructor() {
    const user = this.authService.getCurrentLoginUser();
    if (user) {
      this.userProfile.set(user);
    }
  }

  /** Re-evaluated each change-detection cycle so buttons appear after session loads. */
  protected canCreateProject(): boolean {
    const domainUser = this.getCurrentUser.execute();
    if (domainUser) {
      return this.projectPermission.canCreateProject(domainUser);
    }
    const legacy = this.authService.getCurrentLoginUser() ?? this.userProfile();
    return this.projectPermission.canCreateFromLegacyRole(legacy?.role, legacy?.permissions ?? []);
  }

  protected navigateToMap(): void {
    void this.router.navigate(['/home']);
  }

  protected navigateToMeasurement(): void {
    void this.router.navigate(['/measurement']);
  }

  protected navigateToCreateProject(): void {
    if (!this.canCreateProject()) {
      return;
    }
    const jurisdiction = this.createJurisdiction();
    sessionStorage.setItem(
      PROJECT_CREATE_CONTEXT_KEY,
      serializeProjectCreateContext({
        mode: 'create',
        stateId: jurisdiction?.stateId ?? null,
        districtId: jurisdiction?.districtId ?? null,
        blockId: jurisdiction?.blockId ?? null,
        projectId: null,
      })
    );
    void this.router.navigate(['/projects']);
  }

  protected toggleAccountMenu(event: Event): void {
    event.stopPropagation();
    const next = !this.accountOpen();
    this.accountOpen.set(next);
    if (next) {
      this.accountUser.set(this.readAccountUser());
    }
  }

  protected logout(): void {
    this.accountOpen.set(false);
    this.accountUser.set(null);
    this.userProfile.set(null);
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.accountOpen()) {
      return;
    }
    const accountEl = this.host.nativeElement.querySelector('.nav-rail-account');
    if (accountEl && !accountEl.contains(event.target as Node)) {
      this.accountOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.accountOpen()) {
      this.accountOpen.set(false);
    }
  }

  private readAccountUser(): AccountUserView | null {
    try {
      const user = this.getCurrentUser.execute();
      if (!user) {
        return null;
      }
      return {
        name: user.name,
        userId: user.userId,
        role: this.formatRole(user.role),
      };
    } catch {
      return null;
    }
  }

  private formatRole(role: string): string {
    return role
      .split('_')
      .filter((part) => part.length > 0)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}