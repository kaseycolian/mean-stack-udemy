import { NgModule } from '@angular/core';
import { PostCreateComponent } from './post-create/post-create.component';
import { PostListComponent } from './post-list/post-list.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@NgModule ({
  declarations: [
    PostCreateComponent,
    PostListComponent
  ],
  imports: [
    AngularMaterialModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [

  ]
})


export class PostModule { }
