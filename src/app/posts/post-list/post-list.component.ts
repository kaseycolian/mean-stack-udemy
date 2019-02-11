import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { PageEvent, MatPaginatorIntl } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';
// import { HeaderComponent } from 'src/app/header/header.component';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts: number;
  postsPerPage = 3;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  globalPageData: any;
  userId: string;
  updatedCurrentPage: number;
  private authStatusSubs: Subscription;
  private postsSub: Subscription;
  paginator = new MatPaginatorIntl();

  constructor(
    public postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[]; postCount: number }) => { // this is subscribing to postsUpdated
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
      });
    this.userIsAuthenticated = this.authService.getIsAuthenticated();

    // this will be needed for logout button
    this.authStatusSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId(); // would fetch null if user is logging out
      });
  }
  // event attached to listener in page-list.component.html's pagination
  // gives us access to any event happening in the mat-paginator div
  onChangedPage(pageData: PageEvent) {
    this.globalPageData = pageData.pageIndex;
    console.log(this.globalPageData);
    console.log(pageData);
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  updatePaginator() {
    this.isLoading = true;
    // this.currentPage = 1;
    // this.postsPerPage = 3;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);

    // bind the click in header.html to paginator in post-list.html
    // binding will cause the paginator to update with the click from header
    // will need to set values in method for paginator to update w/ (or just use default)
  }

  getPostsPerPage() {
    return this.postsPerPage;
  }

  onDelete(postId: string) {
    this.isLoading = true;

    this.currentPage = Math.ceil((this.totalPosts - 1) / this.postsPerPage);

    this.postsService.deletePost(postId).subscribe(
      () => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSubs.unsubscribe();
  }
}
