import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProfileService } from 'app/main/pages/profile/profile.service';
import { AuthenticationService } from 'app/auth/service';  // Importar servicio de autenticación
import { Router } from '@angular/router';  // Importar Router para redirección

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit, OnDestroy {
  // public
  public contentHeader: object;
  public data: any;
  public toggleMenu = true;
  public Monthly = false;
  public toggleNavbarRef = false;
  public loadMoreRef = false;

  // private
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _pricingService: ProfileService, 
    private sanitizer: DomSanitizer, 
    private _authenticationService: AuthenticationService, // Inyectar el servicio de autenticación
    private _router: Router // Inyectar el servicio Router
  ) {
    this._unsubscribeAll = new Subject();
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Load More
   */
  loadMore() {
    this.loadMoreRef = !this.loadMoreRef;
    setTimeout(() => {
      this.loadMoreRef = !this.loadMoreRef;
    }, 2000);
  }

  // Getter para determinar si el usuario está logueado y si es Admin o Client
  get isLoggedIn() {
    return this._authenticationService.currentUserValue != null;
  }

  get isAdmin() {
    return this._authenticationService.isAdmin;
  }

  get isClient() {
    return this._authenticationService.isClient;
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Verificamos si el usuario está logueado, si no lo redirigimos al login
    if (!this.isLoggedIn) {
      this._router.navigate(['/pages/authentication/login-v1']);
      return;
    }

    // Verificamos si el usuario tiene los permisos adecuados para ver la página
    if (!(this.isAdmin || this.isClient)) {
      this._router.navigate(['/']); // Redirigir a la página principal si no es admin ni client
      return;
    }

    // Suscribimos a los cambios del servicio de perfil
    this._pricingService.onPricingChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      this.data = response;
    });

    // Configuración del encabezado de la página
    this.contentHeader = {
      headerTitle: 'Profile',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          { name: 'Home', isLink: true, link: '/' },
          { name: 'Pages', isLink: true, link: '/' },
          { name: 'Profile', isLink: false }
        ]
      }
    };
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
