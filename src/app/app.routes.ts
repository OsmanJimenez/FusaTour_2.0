import { Routes } from '@angular/router';
import { ExplorerComponent } from './explorer.component';

export const routes: Routes = [
  { path: '', component: ExplorerComponent, pathMatch: 'full' },
  { path: 'categorias', component: ExplorerComponent },
  { path: 'categorias/:category', component: ExplorerComponent },
  { path: 'ranking', component: ExplorerComponent },
  { path: 'descubrir', component: ExplorerComponent },
  { path: 'actividades', component: ExplorerComponent },
  { path: 'actividades/:tag', component: ExplorerComponent },
  { path: 'blog/:slug', component: ExplorerComponent },
  { path: 'escaner', component: ExplorerComponent },
  { path: '**', redirectTo: '' },
];
