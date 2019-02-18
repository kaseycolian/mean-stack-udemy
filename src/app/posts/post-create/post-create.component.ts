import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
// routing will take you here if create or edit path
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  submitAttempt = false;
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string;
  private authStatusSub: Subscription;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    public authService: AuthService
  ) {}
  // this will render with existing post if the subscription has an id - if none, it'll be placeholder
  ngOnInit() {
    this.authStatusSub =  this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );

    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      // null is the intiial value (editting post value is addressed elsewhere)
      content: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType] // not binding to HTML element - this will only be managed by TS & not HTML
      })
    });

    // this lets us listen to changes in the URL (componenent stays the same, but will display diff ID)
    // will listen to changes and update component with change
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('post_id')) {
        // this is post_id reference from the route path
        this.mode = 'edit';
        this.postId = paramMap.get('post_id');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creatorId: postData.creatorId,
            creatorEmail: postData.creatorEmail
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
        }); // coming from front end
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    // casting event as HTMLInputElement type so TS knows what type of event it is
    // files is a property on HTMLInputElement type
    // files is array -> selecting 1st which is what user selected
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file }); // targets single control (setValue sets all inputs/controls)
    this.form.get('image').updateValueAndValidity(); // gets image from form, updates value, stores value, & rechecks validity
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = <string>reader.result;
    };
    reader.readAsDataURL(file);
  }

  submitAttempted(attempt: boolean) {
    this.submitAttempt = attempt;
    if (document.getElementById('image-error')) {
      console.log('here now');
      const elemId = document.getElementById('image-error');
      elemId.id = 'emphasize';
      if (document.getElementById('emphasize')) {
        console.log('emphasssssss');
        console.log('emphasize is here');
        document.getElementById('image-error').removeAttribute('emphasize');
      }
    }
  }

  focused(event: Event) {
    console.log(event);

  }

  // this will update post if the mode from ngOnInit = edit or addPost if mode=create
  onSavePost() {
    if (this.form.invalid) {
      console.log('invalid');
      return;
    }
    this.isLoading = true; // don't set back to false as add/update will navigate away from page & this page defaults to isLoading=false
    if (this.mode === 'create') {
       this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
      this.form.reset();
    } else {
      // this will happen if ngOnInit returns an id
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
      this.isLoading = false;
      // set back to false for error handling in case user can figure out how to try to edit a post that's not their own
      // it will remove the spinner
    }
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
