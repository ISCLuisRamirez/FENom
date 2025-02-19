import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'app/services/api.service';
import { AuthenticationService } from 'app/auth/service';
import { Router } from '@angular/router';
import {
  ChartComponent,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexLegend,
  ApexDataLabels,
  ApexFill
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: any;
  responsive: ApexResponsive[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
};


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit, OnDestroy {
  public data: any;
  public contentHeader: object;
  private _unsubscribeAll: Subject<any>;

  public chartOptions: Partial<ChartOptions>;

  constructor(
    private _apiService: ApiService,
    private _authenticationService: AuthenticationService,
    private _router: Router
  ) {
    this._unsubscribeAll = new Subject();

    // Configuración inicial de la gráfica Apex
    this.chartOptions = {
      series: [],
      chart: {
        type: 'pie',
        width: '100%',
        height: 600,
        // Asumiendo la fuente de Vuexy (puedes cambiarla a la tuya)
        fontFamily: '"Montserrat", Helvetica, Arial, sans-serif'
      },
      labels: [],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ],
      legend: {
        position: 'bottom'
      },
      dataLabels: {
        enabled: true,
        style: {
          fontFamily: '"Montserrat", Helvetica, Arial, sans-serif'
        }
      },
      fill: {
        opacity: 1
      }
    };
  }

  get isLoggedIn() {
    return this._authenticationService.currentUserValue != null;
  }

  get isComite() {
    return this._authenticationService.isComite;
  }

  get isCapturista() {
    return this._authenticationService.isCapturista;
  }

  ngOnInit(): void {
    // Verificar si el usuario está logueado
    if (!this.isLoggedIn) {
      this._router.navigate(['/pages/authentication/login-v1']);
      return;
    }

    // Verificar permisos
    if (!(this.isComite || this.isCapturista)) {
      this._router.navigate(['/']);
      return;
    }

    // Llamada a la API
    this._apiService.getdatosgrafica() // Debe devolver { total, count, status }
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(response => {
        console.log('Respuesta /api/requests/counter:', response);
        // Ejemplo: { total: 57, count: [54, 2, 1], status: ["En proceso", "Cerradas", "Abiertas"] }
        this.data = response;
        if (this.data) {
          // Asignar datos a la gráfica Apex
          this.chartOptions.series = this.data.count;
          this.chartOptions.labels = this.data.status;
        }
      });

    // Configuración del encabezado
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

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
