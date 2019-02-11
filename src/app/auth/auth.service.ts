import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + 'user';

@Injectable({ providedIn: 'root' }) // provided on a root level for the project, so it just needs injected (not imported)
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string; // could create a user model with id
  private authStatusListener = new Subject<boolean>(); // is user authenticated or not?

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  createUser(email: string, password: string) {
    // request to the post method path made in routes/user.js
    const authData: AuthData = {
      email: email,
      password: password
    };
    // make post() to backend with email & pass & subscribe for the response
    this.http
      .post(BACKEND_URL + '/signup', authData)
      .subscribe(
        () => {
          // subscribing to the response from the backend, if no error, then login
          this.login(email, password); // calls the login method on successful account create to automatically login user
        },
        error => { // if error received from back, push up "false" to the app with authStatusListener
          console.log(error.error.message);
          this.authStatusListener.next(false);
        }
      );
  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        BACKEND_URL + '/login',
        authData
      ) // configured post request to be aware of token
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          // if a token is received from the login api call
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          this.userId = response.userId; // need to add in the post <{}> to be aware of userId
          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + expiresInDuration * 1000
          );
          console.log(expirationDate);
          this.saveAuthData(token, expirationDate, this.userId);
          this.navigateToMain();
        }
      }, error => {
          this.authStatusListener.next(false);
          // this.router.navigate(['/login']);
        });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      // if it's > 0 = in future; if =< 0, time is now or in past
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000); // expiresIn is in milliseconds, /1000 to get seconds
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null; // clears token
    this.isAuthenticated = false;
    this.authStatusListener.next(false); // pushes a new value to those who are listening to authStatusListener
    this.navigateToMain();
    this.userId = null;
    clearTimeout(this.tokenTimer); // clearTimeout part of NodeJS
    this.clearAuthData();
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString()); // serialized version of data
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token'), localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expirationDate'); // keys in local storage
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    };
  }

  navigateToMain() {
    this.router.navigate(['/']);
  }
}
