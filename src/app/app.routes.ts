import { Routes } from '@angular/router';
import { MapComponent } from './map/map';
import { Home } from './home/home';
import { InsertUpdateProject } from './project/insert-update-project/insert-update-project';
import { Login } from './login/login';

export const routes: Routes = [
    { path: '', component: Login },
    { path: 'home', component: Home },
    { path: 'login', component: Login },
    { path: 'map', component: MapComponent },
    { path: 'projects', component: InsertUpdateProject },
    { path: '**', component: Login },
];
