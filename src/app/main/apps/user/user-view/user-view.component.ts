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

        // Actualizar el formulario con el estado actual de la denuncia
        this.statusForm.patchValue({ status: this.data.status });

        // Obtener los datos del solicitante si el id_requester está disponible
        if (this.data.id) {
          this.apiService.getSolicitanteInfoFiltrado(this.data.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
              (solicitanteData) => {
                // Asignar los datos de solicitanteData a la variable row
                this.row = solicitanteData;
                console.log('Datos guardados en row:', this.row);
              },
              (error) => {
                console.error('Error al obtener los datos del solicitante:', error);
              }
            );
        }
      });
  }

  actualizarStatus() {
    const nuevoStatus = this.statusForm.value.status;
  
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
  
        this._httpClient.patch(
          apiUrl,
          { status: nuevoStatus },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        ).subscribe({
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

  getLocation(id_location: number): string {
    switch (id_location) {
      case 1:
        return 'Corporativo';
      case 2:
        return 'Cedis';
      case 3:
        return 'Sucursales';
      case 4:
        return 'Naves y anexas filiales';
      case 5:
        return 'Innomex';
      case 6:
        return 'TRATE';
      case 7:
        return 'Unidad de transporte';
      default:
        return 'Ubicación desconocida'; // Valor por defecto si el id_location no coincide
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