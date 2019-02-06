import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { PostsService } from '../posts/posts.service';
import { PageEvent } from '@angular/material';
import { PostListComponent } from '../posts/post-list/post-list.component';

@Component({
  providers: [PostListComponent],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false; // default is public
  pPPFromListComponent: number;

  private authListenerSubs: Subscription;


  constructor(public postsService: PostsService, private authService: AuthService, private listComponent: PostListComponent) {}

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuthenticated();
     // we're listening for updates ^^^, so this could execute before the header is loaded
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });
  }

  onLogout() {
    this.authService.logout();
  }

  navigateHome() {
    const postsToDisplay = this.listComponent.postsPerPage;
    // this.listComponent.postsPerPage = 3;
    this.authService.autoAuthUser();
    this.listComponent.updatePaginator();
        // this.postsService.navigateToMain();
  }

  // onRefresh(event: PageEvent) {
  //   console.log(event);
  //   console.log(this.listComponent.paginator);
  //   this.listComponent.ngOnInit();
  //   const postsPerPage = this.listComponent.setPostsPerPage(3);
  //   console.log(postsPerPage);
  //   this.postsService.getPosts(postsPerPage, 1);
  //   // console.log(this.listComponent);
  //   // get current value from items per page & set to postsPerPage on getPosts?
  //   // need to update mat-paginator value to get postsPerPage & currentPage from refresh
  // }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
}
