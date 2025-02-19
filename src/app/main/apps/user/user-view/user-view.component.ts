import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';
import { UserViewService } from 'app/main/apps/user/user-view/user-view.service';
import { environment } from 'environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserViewComponent implements OnInit, OnDestroy {
  // Variables públicas
  public url = this.router.url;
  public lastValue: string;
  public data: any;
  public solicitanteData: any;
  public row: any[] = [];
  public implicados: any[] = [];
  public testigos: any[] = [];
  


  // Variables privadas
  private _unsubscribeAll: Subject<any>;

  // Formulario reactivo para el estado
  statusForm: FormGroup;

  constructor(
    private apiService: ApiService, // Nombre correcto
    private router: Router,
    private _userViewService: UserViewService,
    private _httpClient: HttpClient,
    private _router: Router
  ) {
    this._unsubscribeAll = new Subject();
    this.lastValue = this.url.substr(this.url.lastIndexOf('/') + 1);

    // Inicializar el formulario reactivo
    this.statusForm = new FormGroup({
      status: new FormControl(''), // Inicializa vacío o con un valor del backend
    });
  }

  // Método para actualizar el estado
  

  // Lifecycle Hooks
  ngOnInit(): void {
    this._userViewService.onUserViewChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.data = response;
  
        // Obtener los datos del solicitante
        if (this.data.id) {
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
  
          // Obtener los datos de los implicados
          this.apiService.getInvolucrados(this.data.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
              (implicadosData) => {
                // Verifica si implicadosData es un arreglo o un objeto
                this.implicados = Array.isArray(implicadosData) ? implicadosData : [implicadosData];
                console.log('Datos de implicados:', this.implicados);
              },
              (error) => {
                console.error('Error al obtener los datos de los implicados:', error);
              }
            );
  
          // Obtener los datos de los testigos
          this.apiService.getTestigos(this.data.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
              (testigosData) => {
                // Verifica si testigosData es un arreglo o un objeto
                this.testigos = Array.isArray(testigosData) ? testigosData : [testigosData];
                console.log('Datos de testigos:', this.testigos);
              },
              (error) => {
                console.error('Error al obtener los datos de los testigos:', error);
              }
            );
        }
      });
  }

  actualizarStatus() {
    const nuevoStatus = this.statusForm.value.status;
  
    // Obtener el ID del usuario actual (suponiendo que está en el localStorage)
    const userId = localStorage.getItem('userId'); // Ajusta según tu sistema de autenticación
  
    // Generar la fecha de última actualización
    const updatedDate = new Date().toISOString(); // Fecha en formato ISO
  
    // Mostrar confirmación antes de cambiar el estado
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
        const apiUrl = `${environment.apiUrl}/api/requests/${this.data.id}/status`;
  
        // Agregar token de autenticación si es necesario
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Ajusta según tu sistema de autenticación
        });
  
        // Datos a enviar en la solicitud PATCH
        const body = {
          status: nuevoStatus,
          id_user_updated: userId,
          updated_date: updatedDate
        };
  
        console.log('URL de la API:', apiUrl);
        console.log('Datos a enviar:', body);
  
        this._httpClient.patch(
          apiUrl,
          body, // Enviar el cuerpo con los nuevos datos
          { headers }
        ).subscribe({
          next: (response) => {
            console.log('Respuesta de la API:', response);
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

  // Método para convertir el estado numérico a texto
  getStatusString(status: number): string {
    switch (status) {
      case 1:
        return 'En proceso';
      case 2:
        return 'Abierto';
      case 3:
        return 'Cerrado';
      default:
        return '';
    }
  }

  getMedio(id_via: number): string {
    switch (id_via) {
      case 1:
        return 'Teléfono';
      case 2:
        return 'Correo';
      default:
        return 'Portal';
    }
  }

  getSublocation(id_sublocation:number): string{
    switch (id_sublocation) {
      case 0:
        return " " + this.data.name_sublocation;
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
        return 'Embotelladora ';
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
        return " " + this.data.name_sublocation;
    }
  }

  

  getLocation(id_location: number): string {
    switch (id_location) {
      case 0:
        return 'Ubicación desconocida';
      case 1:
        return 'Corporativo' + "-" + this.getSublocation(this.data.id_sublocation);
      case 2:
        return 'Cedis' + "-" + this.getSublocation(this.data.id_sublocation);
      case 3:
        return 'Sucursales' + "-" + this.getSublocation(this.data.id_sublocation);
      case 4:
        return 'Naves y anexas filiales' + "-" + this.getSublocation(this.data.id_sublocation);
      case 5:
        return 'Innomex' + "-" + this.getSublocation(this.data.id_sublocation);
      case 6:
        return 'TRATE' + "-" + this.getSublocation(this.data.id_sublocation);
      case 7:
        return 'Unidad de transporte' + "-" + this.getSublocation(this.data.id_sublocation);
      default:
        return 'Ubicación desconocida';
    }
  }

  // Método para convertir el motivo numérico a texto
  getreason(id_reason: number | null | undefined): string {
    const reasons = {
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
      12: 'Manipulación de inventarios',
    };

    // Validación y retorno
    if (id_reason !== null && id_reason !== undefined && reasons.hasOwnProperty(id_reason)) {
      return reasons[id_reason];
    } else {
      return 'Datos inexistentes';
    }
  }
}