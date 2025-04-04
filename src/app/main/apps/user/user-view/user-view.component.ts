import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';
import { UserViewService } from 'app/main/apps/user/user-view/user-view.service';
import { environment } from 'environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from 'app/auth/models';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserViewComponent implements OnInit, OnDestroy {
  // Variables públicas
  public url = this.router.url;
  public files: any[] = [];
  public lastValue: string;
  public data: any;
  public solicitanteData: any;
  public row: any[] = [];
  public implicados: any[] = [];
  public testigos: any[] = [];
  public currentUser: User | null = null;
  public selectedFileName: string | null = null;
  public previewURL: SafeResourceUrl | null = null;

  // Variables privadas
  private _unsubscribeAll: Subject<any>;

  // Formulario reactivo para el estado
  statusForm: FormGroup;

  constructor(
    private sanitizer: DomSanitizer,
    private apiService: ApiService,
    private router: Router,
    private _userViewService: UserViewService,
    private _httpClient: HttpClient,
    private _router: Router
  ) {
    this._unsubscribeAll = new Subject();
    this.lastValue = this.url.substr(this.url.lastIndexOf('/') + 1);

    // Inicializar el formulario reactivo
    this.statusForm = new FormGroup({
      // Por defecto vacío. Ajusta a 'string' o 'number' según tu lógica
      status: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.lastValue = this.url.substr(this.url.lastIndexOf('/') + 1);

    // Reemplazar la URL sin recargar ni afectar la navegación
    history.replaceState({}, '', `/complaint/${this.lastValue}`);
  
    // Suscribirse al servicio que retorna la data de la denuncia
    this._userViewService.onUserViewChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.data = response;
        console.log(this.data);
        if (this.data?.status) {
          this.statusForm.patchValue({ status: +this.data.status });
        }
      });

    // Suscribirse al servicio que retorna la data de la denuncia
    this._userViewService.onUserViewChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.data = response;

        // Si ya tenemos this.data, asignamos el estado al formulario
        if (this.data?.status) {
          this.statusForm.patchValue({ status: +this.data.status });
        }

        if (this.data?.id) {
          // Obtener información del solicitante
          this.apiService.getSolicitanteInfoFiltrado(this.data.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
              (solicitanteData) => {
                this.row = solicitanteData;
                console.log('Datos del solicitante:', this.row);
              },
              (error) => {
                console.error('Error al obtener los datos del solicitante:', error);
              }
            );

          // Obtener información de los implicados
          this.apiService.getInvolucrados(this.data.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
              (implicadosData) => {
                this.implicados = Array.isArray(implicadosData) ? implicadosData : [implicadosData];
              },
              (error) => {
                console.error('Error al obtener los datos de los implicados:', error);
              }
            );

          // Obtener información de los testigos
          this.apiService.getTestigos(this.data.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
              (testigosData) => {
                this.testigos = Array.isArray(testigosData) ? testigosData : [testigosData];
              },
              (error) => {
                console.error('Error al obtener los datos de los testigos:', error);
              }
            );

          // Obtener la lista de archivos asociados
          this.apiService.getFile(this.data.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
              (filesData) => {
                this.files = filesData;
              },
              (error) => {
                console.error('Error al obtener los archivos:', error);
              }
            );
        }
      });
  }


  actualizarStatus() {
    const nuevoStatus = this.statusForm.value.status;
    const currentUserString = localStorage.getItem('currentUser') || '{}';
    const updatedDate = new Date().toISOString();

    Swal.fire({
      title: 'Confirmación',
      text: '¿Deseas cambiar el estado de la denuncia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#7367F0',
      cancelButtonColor: '#E42728',
    }).then((result) => {
      if (result.isConfirmed) {
        const apiUrl = `${environment.apiUrl}/requests/${this.data.id}/status`;
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        });

        let status: number = nuevoStatus;
        this._httpClient.patch(apiUrl, status, { headers }).subscribe({
          next: (response) => {
            Swal.fire({
              title: '¡Estado Actualizado!',
              text: 'El estado se ha actualizado correctamente.',
              icon: 'success',
              confirmButtonText: 'Cerrar',
              confirmButtonColor: '#7367F0',
            }).then(() => {
              this._router.navigate(['/tables/datatables']);
            });
          },
          error: (error) => {
            console.error('Error al actualizar el estado:', error);
            Swal.fire({
              title: 'Error!',
              text: error?.error?.message || 'No se pudo actualizar el estado.',
              icon: 'error',
              confirmButtonText: 'Cerrar',
              confirmButtonColor: '#7367F0',
            });
          }
        });
      } else {
        Swal.fire({
          title: 'Cancelado',
          text: 'No se realizaron cambios.',
          icon: 'info',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#7367F0',
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  getDepartment(id_department: number): string {
    switch (id_department) {
      case 0:
        return 'Área desconocida'
      case 1:
        return 'Capital Humano';
      case 2:
        return 'Legal';
      case 3:
        return 'Desarrollo';
      case 4:
        return 'Operaciones';
      case 5:
        return 'MKT Punto de Venta';
      case 6:
        return 'MKT Promociones';
      case 7:
        return 'MKT Publicidad';
      case 8:
        return 'TI';
      case 9:
        return 'Innovación y Planeación Estrategica';
      case 10:
        return 'Compras';
      case 11:
        return 'Compras Institucionales';
      case 12:
        return 'Auditoria Interna';
      case 13:
        return 'Finanzas';
      case 14:
        return 'Comercio Digital';
      case 15:
        return 'Caja de Ahorro';
      case 16:
        return 'Mantenimiento';
      case 17:
        return 'Kromi (fotosistemas)';
      case 18:
        return 'Servicios Medicos (MediCaf)';
      case 19:
        return 'Logistica (Tegua-TRATE)';
      case 20:
        return 'Innomex';
      default:
        return 'Área desconocida';
    }
  }

  // Método para convertir el estado numérico a texto
  getStatusString(status: number): string {
    switch (status) {
      case 1:
        return 'En proceso';
      case 2:
        return 'Abierto';
      case 3:
        return 'Cerrado';      
      case 4:
        return 'Rechazado';
      default:
        return '';
    }
  }

  // Método para convertir el id_via a un string
  getMedio(id_via: number): string {
    switch (id_via) {
      case 0:
        return 'Portal'
      case 1:
        return 'Teléfono';
      case 2:
        return 'Correo';
      default:
        return 'Portal';
    }
  }

  // Método para convertir id_sublocation a texto
  getSublocation(id_sublocation: number): string {
    switch (id_sublocation) {
      case 0:
        return ' ' + this.data.name_sublocation;
      case 1:
        return 'E diaz';
      case 2:
        return 'Mar Báltico';
      case 3:
        return 'Podium';
      case 4:
        return 'Pedro Loza';
      case 5:
        return 'Oficinas de RRHH MTY';
      case 6:
        return 'Occidente';
      case 7:
        return 'Noreste';
      case 8:
        return 'Centro';
      case 9:
        return 'Embotelladora';
      case 10:
        return 'Dispositivos Médicos';
      case 11:
        return 'Occidente';
      case 12:
        return 'Noreste';
      case 13:
        return 'Centro';
      case 14:
        return 'CDA Villahermosa';
      case 15:
        return 'CDA Mérida';
      case 16:
        return 'CDA Chihuahua';
      default:
        return ' ' + this.data.name_sublocation;
    }
  }

  // Método para convertir id_location a texto
  getLocation(id_location: number): string {
    switch (id_location) {
      case 0:
        return 'Ubicación desconocida';
      case 1:
        return 'Corporativo' + '-' + this.getSublocation(this.data.id_sublocation);
      case 2:
        return 'Cedis' + '-' + this.getSublocation(this.data.id_sublocation);
      case 3:
        return 'Sucursales' + '-' + this.getSublocation(this.data.id_sublocation);
      case 4:
        return 'Naves y anexas filiales' + '-' + this.getSublocation(this.data.id_sublocation);
      case 5:
        return 'Innomex' + '-' + this.getSublocation(this.data.id_sublocation);
      case 6:
        return 'TRATE' + '-' + this.getSublocation(this.data.id_sublocation);
      case 7:
        return 'Unidad de transporte' + '-' + this.getSublocation(this.data.id_sublocation);
      default:
        return 'Ubicación desconocida';
    }
  }

  // Método para convertir el id_reason a texto
  getreason(id_reason: number | null | undefined): string {
    const reasons: any = {
      1: 'Abuso de autoridad',
      2: 'Acoso laboral',
      3: 'Acoso Sexual',
      4: 'Apropiación y uso indebido de activos o recursos',
      5: 'Condiciones inseguras',
      6: 'Conflicto de interés',
      7: 'Corrupción, soborno o extorsión',
      8: 'Desvío de recursos',
      9: 'Discriminación',
      10: 'Fraude Financiero (Malversación de fondos, falsificación de registros, prácticas contables inadecuadas)',
      11: 'Incumplimiento de las políticas internas',
      12: 'Manipulación de inventarios'
    };

    if (id_reason !== null && id_reason !== undefined && reasons.hasOwnProperty(id_reason)) {
      return reasons[id_reason];
    } else {
      return 'Motivo desconocido';
    }
  }



  viewFile(file: any): void {
    this.selectedFileName = file.file_name;
  
    this.apiService.Viewfile(file.id).subscribe({
      next: (blob: Blob) => {
        // Convertir el blob en una URL local
        const objectUrl = URL.createObjectURL(blob);
  
        // Marcar la URL como “segura” para que Angular no la bloquee
        this.previewURL = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
      },
      error: err => console.error('Error al obtener el archivo:', err)
    });
  }
  
  
  closePreview(): void {
    // Libera la memoria del blob
    if (this.previewURL) {
      // Si quisieras liberar la URL original, primero habría que guardarla en una variable normal
      // antes de sanitizarla, porque sanitizer produce un objeto "SafeResourceUrl".
    }
    this.previewURL = null;
    this.selectedFileName = null;
  }
  isPDF(filename: string): boolean {
    return filename.toLowerCase().endsWith('.pdf');
  }
  
  isImage(filename: string): boolean {
    const ext = filename.toLowerCase();
    return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png');
  }
    
  
}
