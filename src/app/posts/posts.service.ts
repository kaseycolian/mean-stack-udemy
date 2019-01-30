import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { Router } from '@angular/router';

// const port = require('../../../server.js');

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  // injecting this into post-service
  constructor(private http: HttpClient, private router: Router) {}

  getPosts() {
    this.http
      .get<{ message: string, posts: any }>('http://localhost:3000/api/posts')
      // 'any' as posts type makes it possible to have conflicts from backend & frontend data ie: id & _id
      .pipe(map((postData) => {
        return postData.posts.map(post => {// this will convert every object in array to the return structure below
          return {
            title: post.title,
            content: post.content,
            id: post._id
          };
        });
      })) // pipe needs to be before subscribe; let's us add in multiple operators (this is like stream in java)
      .subscribe((pipedData) => {
        this.posts = pipedData;
        this.postsUpdated.next([...this.posts]);
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
    return this.http.get<{_id: string, title: string, content: string}>('http://localhost:3000/api/posts/' + id);
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title: title, content: content};
    this.http.post<{ message: string, postId: string }>('http://localhost:3000/api/posts', post)
      .subscribe(responseData => {
        // console.log(port);
        console.log(responseData.message);
        const new_id = responseData.postId;
        post.id = new_id;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.navigateToMain();
   });
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = { id: id, title: title, content: content };
    this.http.put('http://localhost:3000/api/posts/' + id, post)
    .subscribe(response => {
      const updatedPosts = [...this.posts];
      const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
      updatedPosts[oldPostIndex] = post;
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
      this.navigateToMain();
    });
  }

  deletePost(postId: string) {
    this.http.delete('http://localhost:3000/api/posts/' + postId)
    .subscribe(() => {
      console.log(`Deleted post: ${postId}`);
      const updatedPost = this.posts.filter(post => post.id !== postId);
      this.posts = updatedPost;
      this.postsUpdated.next([...this.posts]);
    });
  }

  navigateToMain() {
    this.router.navigate(['/']);
  }
}
