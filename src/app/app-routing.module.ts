import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';

const routes: Routes = [
  { path: '', component: PostListComponent }, // path: localhost:4200
  { path: 'create', component: PostCreateComponent}, // path: localhost:4200/create
  { path: 'edit/:post_id', component: PostCreateComponent}
];

@NgModule({
  // this makes the angular router module aware of our routes
  // importing routermodule into angular module
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}
