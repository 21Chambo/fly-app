import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token from storage (implement your token storage logic)
    const token = this.getAuthToken();

    if (token) {
      // Clone the request and add authorization header
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authRequest);
    }

    return next.handle(request);
  }

  private getAuthToken(): string | null {
    // Implement your token retrieval logic
    // This could be from localStorage, sessionStorage, or a service
    return localStorage.getItem('auth_token');
  }
}