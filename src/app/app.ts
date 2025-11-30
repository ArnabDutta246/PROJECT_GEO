import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './theme.service';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle';
import { Header } from "./header/header";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggleComponent, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('ProjectGeo');
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    // Theme service will automatically initialize and apply theme
    // This injection ensures the service is instantiated
  }
}
