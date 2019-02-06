import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ErrorComponent } from './error/error.component';

@Injectable() // injecting a service, must have this annotation
export class ErrorInterceptor implements HttpInterceptor {
  constructor (private dialog: MatDialog ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) { // req to intercept(and type (get, post...), or any)
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        let errorMessage = 'An unknown error has occurred!';

        if (error.error.message) {
          errorMessage = error.error.message;
        }
        this.dialog.open(ErrorComponent, {data: {message: errorMessage}});
        return throwError(error);
      })
    );
  }
}
