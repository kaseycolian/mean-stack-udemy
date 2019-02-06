import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSub: Subscription;

  // injecting authService into the component
  constructor(public authService: AuthService) {}

  ngOnInit() {
    // this.authStatusSub stores the subscription returned from the Listener
    this.authStatusSub =  this.authService.getAuthStatusListener().subscribe( authStatus => {
        console.log(authStatus);
        this.isLoading = false;
      });
  }

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    // we get back the observable, so we can subscribe to it
    this.authService.createUser(form.value.email, form.value.password);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
