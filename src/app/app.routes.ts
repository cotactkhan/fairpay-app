import { Routes } from '@angular/router';
import { ListComponent } from './components/list/list.component';
import { CreateComponent } from './components/create/create.component';
import { DetailsComponent } from './components/details/details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/list', pathMatch: 'full' },
  { path: 'list', component: ListComponent },
  { path: 'create', component: CreateComponent },
  { path: 'details/:id', component: DetailsComponent },
  { path: '**', redirectTo: '/list' }
];

// import { NegotiationListComponent } from './components/negotiation-list/negotiation-list.component';
// import { CreateNegotiationComponent } from './components/create-negotiation/create-negotiation.component';
// import { NegotiationDetailsComponent } from './components/negotiation-details/negotiation-details.component';

// export const routes: Routes = [
//   {
//     path: '',
//     redirectTo: '/my-negotiations',
//     pathMatch: 'full'
//   },
//   {
//     path: 'my-negotiations',
//     component: NegotiationListComponent
//   },
//   {
//     path: 'create',
//     component: CreateNegotiationComponent
//   },
//   {
//     path: 'negotiation/:id',
//     component: NegotiationDetailsComponent
//   },
//   {
//     path: '**',
//     redirectTo: '/my-negotiations'
//   }
// ];