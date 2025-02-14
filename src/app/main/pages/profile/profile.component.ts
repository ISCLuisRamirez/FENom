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

  // Opciones de la gráfica de estadísticas
  public estadisticasChartOptions: any = {
    chart: {
      type: 'donut',
      width: '100%',
      height: 350,
      toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    legend: { show: true, position: 'bottom' },
    stroke: { width: 2 },
    colors: ['#7367F0', '#28C76F', '#EA5455'],
    series: [], // Se llenará con los datos del endpoint
    labels: [], // Se llenará con los datos del endpoint
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: '#6E6B7B'
            }
          }
        }
      }
    }
  };
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

  get isComite() {
    return this._authenticationService.isComite;
  }

  get isCapturista() {
    return this._authenticationService.isCapturista;
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
    if (!(this.isComite || this.isCapturista)) {
      this._router.navigate(['/']); // Redirigir a la página principal si no es admin ni client
      return;
    }

    // Suscribimos a los cambios del servicio de perfil
    // Obtener datos del servicio
    this._pricingService.onPricingChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      this.data = response;

      // Asignar datos a la gráfica de estadísticas
      if (this.data?.estadisticas) {
        this.estadisticasChartOptions.series = this.data.estadisticas.series;
        this.estadisticasChartOptions.labels = this.data.estadisticas.labels;
      }
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
