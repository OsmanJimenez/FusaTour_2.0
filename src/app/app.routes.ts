import { Routes } from '@angular/router';
import { ActivitiesPage } from './activities/activities.page';
import { CategoriesPage } from './categories/categories.page';
import { DetailPage } from './detail/detail.page';
import { HomePage } from './home/home.page';
import { RankingPage } from './ranking/ranking.page';
import { ShellComponent } from './shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: HomePage, pathMatch: 'full' },
      { path: 'categorias', component: CategoriesPage },
      { path: 'categorias/:category', component: CategoriesPage },
      { path: 'ranking', component: RankingPage },
      { path: 'descubrir', component: RankingPage },
      { path: 'actividades', component: ActivitiesPage },
      { path: 'actividades/:tag', component: ActivitiesPage },
      { path: 'blog/:slug', component: DetailPage },
    ],
  },
  { path: '**', redirectTo: '' },
];
