import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { LoginPage } from '@presentation/features/login/login.page';
import { HomePage } from '@presentation/features/home/home.page';
import { MapComponent } from './map/map';
import { InsertUpdateProject } from './project/insert-update-project/insert-update-project';

export const routes: Routes = [
  { path: '', component: LoginPage },
  { path: 'login', component: LoginPage },
  { path: 'home', component: HomePage, canActivate: [authGuard] },
  { path: 'map', component: MapComponent, canActivate: [authGuard] },
  { path: 'projects', component: InsertUpdateProject, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
