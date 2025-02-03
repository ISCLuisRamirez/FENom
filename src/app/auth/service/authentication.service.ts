import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { User, Role } from 'app/auth/models';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  // public observable
  public currentUser: Observable<User>;

  // private subject
  private currentUserSubject: BehaviorSubject<User>;

  constructor(private _http: HttpClient, private _toastrService: ToastrService) {
    // Si no existe 'currentUser' en localStorage, inicializa con un objeto vacío
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUserSubject = new BehaviorSubject<User>(storedUser ? storedUser : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // getter: currentUserValue
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   * Confirms if user is admin
   */
  get isComite() {
    const user = this.currentUserValue; // Obtener el valor actual de currentUser
    return user && user.role === Role.Comite;
  }

  get isAdmin() {
    const user = this.currentUserValue; // Obtener el valor actual de currentUser
    return user && user.role === Role.Admin;
  }

  /**
   * Confirms if user is client
   */
  get isCapturista() {
    const user = this.currentUserValue; // Obtener el valor actual de currentUser
    return user && user.role === Role.Capturista;
  }

  /**
   * User login
   * 
   * @param employeenumber
   * @param password
   * @returns user
   */
  login(employeenumber: number, password: string) {
    return this._http
      .post<any>(`${environment.apiUrl}/users/authenticate`, { employeenumber, password })
      .pipe(
        map(user => {
          // login successful if there's a jwt token in the response
          if (user && user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Display welcome toast
            setTimeout(() => {
              this._toastrService.success(
                'Inicio de sesión exitoso bienvenid@ ' +
                  user.role +
                  ' puedes comenzar a explorar la página 🎉',
                '👋 Bienvenid@ , ' + user.firstName + '!',
                { toastClass: 'toast ngx-toastr', closeButton: true }
              );
            }, 2500);

            // notify
            this.currentUserSubject.next(user);
          }

          return user;
        })
      );
  }

  /**
   * User logout
   */
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    // notify
    this.currentUserSubject.next(null);
  }
}
