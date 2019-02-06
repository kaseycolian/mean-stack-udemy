import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

// to inject service into other services, it needs to have @Injectable()
//  service that receives injected service needs @Injectable() annotation
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

 constructor(private authService: AuthService) {}

  // this handles outgoing requests instead incoming requests
  // can't configure resp since it's outgoing
  // next allows us to leave interceptor & allow other parts of the app to handle the request
  intercept(req: HttpRequest<any>, next: HttpHandler) { // req to intercept(and type (get, post...), or any)
    const authToken = this.authService.getToken();
    const authRequest = req.clone({  // avoids breaking original req
      headers: req.headers.set('Authorization', 'Bearer ' + authToken)
    });
    return next.handle(authRequest); // this lets request continue on
  }
}
