/* import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { User, Role } from 'app/auth/models';

// Users with role
const users: User[] = [
  {
    id: 1,
    employeenumber: 100001, // Cambiado a 6 dígitos
    email: 'admin@demo.com', // Añadido email
    password: 'admin',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'avatar-s-11.jpg',
    role: Role.Admin
  },
  {
    id: 2,
    employeenumber: 100002, // Cambiado a 6 dígitos
    email: 'client@demo.com', // Añadido email
    password: 'client',
    firstName: 'Nataly',
    lastName: 'Doe',
    avatar: 'avatar-s-2.jpg',
    role: Role.Client
  },
  {
    id: 3,
    employeenumber: 100003, // Cambiado a 6 dígitos
    email: 'user@demo.com', // Añadido email
    password: 'user',
    firstName: 'Rose',
    lastName: 'Doe',
    avatar: 'avatar-s-3.jpg',
    role: Role.User
  }
];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    // wrap in delayed observable to simulate server api call
    return of(null).pipe(mergeMap(handleRoute));

    function handleRoute() {
      switch (true) {
        case url.endsWith('/users/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/users') && method === 'GET':
          return getUsers();
        case url.match(/\/users\/\d+$/) && method === 'GET':
          return getUserById();
        default:
          // pass through any requests not handled above
          return next.handle(request);
      }
    }

    // route functions

    function authenticate() {
      const { employeenumber, email, password } = body;

      // Find user by either employeenumber or email
      const user = users.find(x => 
        (x.employeenumber === employeenumber || x.email === email) && x.password === password
      );

      if (!user) return error('Employee number or email or password is incorrect');
      return ok({
        id: user.id,
        employeenumber: user.employeenumber,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        token: `fake-jwt-token.${user.id}`
      });
    }

    function getUsers() {
      if (!isComite()) return unauthorized();
      return ok(users);
    }

    function getUserById() {
      if (!isLoggedIn()) return unauthorized();

      // only admins can access other user records
      if (!isComite() && currentUser().id !== idFromUrl()) return unauthorized();

      const user = users.find(x => x.id === idFromUrl());
      return ok(user);
    }

    // helper functions

    function ok(body) {
      return of(new HttpResponse({ status: 200, body }));
    }

    function unauthorized() {
      return throwError({ status: 401, error: { message: 'unauthorized' } });
    }

    function error(message) {
      return throwError({ status: 400, error: { message } });
    }

    function isLoggedIn() {
      const authHeader = headers.get('Authorization') || '';
      return authHeader.startsWith('Bearer fake-jwt-token');
    }

    function isComite() {
      return isLoggedIn() && currentUser().role === Role.Admin;
    }

    function currentUser() {
      if (!isLoggedIn()) return;
      const id = parseInt(headers.get('Authorization').split('.')[1]);
      return users.find(x => x.id === id);
    }

    function idFromUrl() {
      const urlParts = url.split('/');
      return parseInt(urlParts[urlParts.length - 1]);
    }
  }
}

export const fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
 */