import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoginPresenter } from './login.presenter';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  providers: [LoginPresenter],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage implements OnInit {
  protected readonly presenter = inject(LoginPresenter);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const message = this.route.snapshot.queryParamMap.get('message');
    this.presenter.initialize(message);
  }

  onSubmit(): void {
    void this.presenter.submit();
  }

  togglePasswordVisibility(): void {
    this.presenter.togglePasswordVisibility();
  }
}
