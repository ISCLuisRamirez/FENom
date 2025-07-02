import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { User } from 'app/auth/models';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  // Observable público para el usuario actual
  public currentUser$: Observable<User | null>;

  // BehaviorSubject privado para manejar el usuario autenticado
  private currentUserSubject: BehaviorSubject<User | null>;

  constructor(private _http: HttpClient, private _toastrService: ToastrService) {
    // Obtener usuario almacenado en localStorage
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Getter: obtiene el usuario autenticado actual
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  

  // Validaciones de roles
  // Validaciones de roles
  get isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  get isCapturista(): boolean {
    return this.currentUserValue !== null && this.currentUserValue.role === 'Capturista';
  }

  get isComite(): boolean {
    return this.currentUserValue !== null && this.currentUserValue.role === 'Comite';
  }

  get isAdmin(): boolean {
    return this.currentUserValue.role === 'Admin';
  }

  /**
   * Método de Login
   */
  login(employee_number: string, password: string) {
    return this._http
      .post<any>(`${environment.apiUrl}/login`, { employee_number, password })
      .pipe(
        map(user => {
          if (user && user.token) {
          
            user.role = user.role || user.role || 'Usuario Desconocido';

            // Guardar usuario en localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Notificación de bienvenida
            setTimeout(() => {
              this._toastrService.success(
                `Inicio de sesión exitoso. Bienvenido ${this.currentUserValue.role}!`,
                '👋 Bienvenid@, ' + (user.employee_number) + '!',
                { toastClass: 'toast ngx-toastr', closeButton: true }
              );
            }, 2500);

            // Actualizar el BehaviorSubject con el usuario autenticado
            this.currentUserSubject.next(user);
          }

          return user;
        })
      );
  }

  /**
   * Método de Logout
   */
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
