import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'app/services/api.service';
import { AuthenticationService } from 'app/auth/service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  ChartComponent,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexLegend,
  ApexDataLabels,
  ApexFill
} from 'ng-apexcharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
    public location:Location,
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
        width: '90%',
        height: 600,
        fontFamily: '"Montserrat", Helvetica, Arial, sans-serif'
      },
      labels:['Registrado', 'En proceso', 'Finalizado', 'Rechazado'],
      
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
        opacity: 1,
        colors: ['#008FFB'/*azul*/, '#FEB019'/*amarillo*/, '#00E396'/*verde*/, '#FF4560'/*rojo*/]
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
    /* this.location.replaceState('/committee_dashboard'); */
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

    // Llamada a la API para obtener datos de la gráfica
    this._apiService.getdatosgrafica()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(response => {
        this.data = response;
        if (this.data) {
          this.chartOptions.series = this.data.count;
          this.chartOptions.labels = this.data.status;
      
          const colorMap: { [key: string]: string } = {
            'Registrado': '#008FFB',  // Azul
            'En proceso': '#FEB019',  // Amarillo
            'Finalizado': '#00E396',  // Verde
            'Rechazado': '#FF4560'    // Rojo
          };
      
          this.chartOptions.fill.colors = this.data.status.map((status: string) => colorMap[status] || '#999999'); // fallback color
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

  // Método para generar y descargar el archivo XLSX
  downloadExcel(): void {
    // Prepara los datos en formato Array of Arrays (AOA)
    const wsData = [
      ['Estatus', 'Cantidad']
    ];

    if (this.data && this.data.count && this.data.status) {
      for (let i = 0; i < this.data.count.length; i++) {
        wsData.push([this.data.status[i], this.data.count[i]]);
      }
    }

    // Agrega una fila para el total
    wsData.push(['Total', this.data?.total]);

    // Crea la hoja de trabajo (worksheet) a partir de los datos
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);

    // Crea un nuevo libro de trabajo (workbook)
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    // Agrega la hoja al libro de trabajo con el nombre "Estadísticas"
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estadísticas');

    // Escribe el libro en formato binario
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Convierte a Blob y dispara la descarga
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'estadisticas.xlsx');
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}