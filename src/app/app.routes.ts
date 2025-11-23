import { Routes } from '@angular/router';
import { MapComponent } from './map/map';
import { Home } from './home/home';
import { InsertUpdateProject } from './project/insert-update-project/insert-update-project';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'home', component: Home },
    { path: 'map', component: MapComponent },
    { path: 'projects', component: InsertUpdateProject },
    { path: '**', component: Home },
];
