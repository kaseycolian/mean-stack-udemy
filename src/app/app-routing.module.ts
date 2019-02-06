import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', component: PostListComponent }, // path: localhost:4200
  { path: 'create', component: PostCreateComponent, canActivate: [AuthGuard]}, // path: localhost:4200/create
  { path: 'edit/:post_id', component: PostCreateComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: ':post_id', component: PostListComponent }
];

@NgModule({
  // this makes the angular router module aware of our routes
  // importing routermodule into angular module
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})

export class AppRoutingModule {}
