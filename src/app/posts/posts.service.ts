import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { createProviderInstance } from '@angular/core/src/view/provider';

// sending post data from post-create.component to backend

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  // injecting this into post-service
  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        'http://localhost:3000/api/posts' + queryParams
      )
      // 'any' as posts type makes it possible to have conflicts from backend & frontend data ie: id & _id
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              // this will convert every object in array to the return structure below
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creatorId: post.creatorId,
                creatorEmail: post.creatorEmail
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      ) // pipe needs to be before subscribe; let's us add in multiple operators (this is like stream in java)
      .subscribe(pipedPostsData => {
        this.posts = pipedPostsData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: pipedPostsData.maxPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    // spread operator - pulling out all props of obj & add to new obj *prevent corrupting original data*
    // fetches obj from post array in post service using find
    // find will execute on every object in array
    // this will be added to a new obj.
    // return { ...this.posts.find(p => p.id === id) };

    // the above code will not work anymore as there is an http call using getPost
    // this will now need to wait until that call is finished returning data
    // now: return the observable from the http client to subscribe in the componenet to that data
    // we will subscribe to this in the post-create.componenent
    // get is generic & we need to let ts know which types could be retrieved in this method
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creatorId: string;
      creatorEmail: string;
    }>('http://localhost:3000/api/posts/' + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData(); // allows us to combine text values & blob(file) values
    postData.append('title', title);
    postData.append('content', content);
    // this 'image' is the prop trying to be accessed in backend posts.js
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>('http://localhost:3000/api/posts', postData) // this is the post we get back
      .subscribe(responseData => {
        console.log(responseData.message);
        this.navigateToMain();
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      // a file will be an object, a string will be a string
      postData = new FormData();
      console.log(`Should be sending new file: ${image}`);
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      // when image is a string
      console.log(`This should be a string URL: ${image}`);
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creatorId: null,
        creatorEmail: null
      };
    }
    this.http
      .put('http://localhost:3000/api/posts/' + id, postData)
      .subscribe(response => {
        this.navigateToMain();
      });
  }

  deletePost(postId: string) {
   return this.http
      .delete('http://localhost:3000/api/posts/' + postId);
  }

  navigateToMain() {
    this.getPosts(10, 1);
  }

}
