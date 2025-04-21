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
        colors: ['#008FFB', '#FEB019', '#00E396', '#FF4560']
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
    if (!this.isLoggedIn) {
      this._router.navigate(['/pages/authentication/login-v1']);
      return;
    }

    if (!(this.isComite || this.isCapturista)) {
      this._router.navigate(['/']);
      return;
    }

    this._apiService.getdatosgrafica()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(response => {
        this.data = response;
        if (this.data) {
          this.chartOptions.series = this.data.count;
          this.chartOptions.labels = this.data.status;
      
          const colorMap: { [key: string]: string } = {
            'Registrado': '#008FFB',  
            'En proceso': '#FEB019',  
            'Finalizado': '#00E396',  
            'Rechazado': '#FF4560'    
          };
      
          this.chartOptions.fill.colors = this.data.status.map((status: string) => colorMap[status] || '#999999'); 
        }
      });

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

  generateExcelFromBackend(): void {
    this._apiService.getExcelData().subscribe({
      next: (response) => {
        if (!response || !response.datos || response.datos.length === 0) {
          console.error('No hay datos disponibles para generar el archivo Excel.');
          return;
        }
  
        const datos = response.datos;
  
        const wsData = [
          ['Folio', 'Descripción', 'Estatus', 'Fecha de creación', 'Medio', 'Razón', 'Ubicación', 'Sububicación', 'Fecha o periodo', 'Implicados', 'Testigos'],
          ...datos.map((item: any) => [
            item.folio || '',
            item.descripcion || '',
            item.estatus || '',
            item.fecha_creacion || '',
            item.medio || '',
            item.razon || '',
            item.ubicacion || '',
            item.sububicacion || '',
            item.fecha_o_periodo || '',
            item.implicados?.map((implicado: any) => `${implicado.nombre} (${implicado.puesto})`).join(', ') || '',
            item.testigos?.map((testigo: any) => `${testigo.nombre} (${testigo.puesto})`).join(', ') || ''
          ])
        ];
  
        const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
  
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
  
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `Reporte_${new Date().toISOString().slice(0, 10)}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al obtener los datos del backend:', err);
      }
    });
  }
  

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}