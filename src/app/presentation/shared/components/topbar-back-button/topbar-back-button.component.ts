import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar-back-button',
  standalone: true,
  template: `
    <button
      type="button"
      class="topbar-back-btn"
      aria-label="Back"
      title="Back"
      (click)="goBack()"
    >
      <span class="material-icons">arrow_back</span>
    </button>
  `,
})
export class TopbarBackButtonComponent {
  private readonly router = inject(Router);

  protected goBack(): void {
    void this.router.navigate(['/home']);
  }
}
