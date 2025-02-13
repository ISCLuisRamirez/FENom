import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';
import { UserViewService } from 'app/main/apps/user/user-view/user-view.service';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserViewComponent implements OnInit, OnDestroy {
  // Variables públicas
  public url = this.router.url;
  public lastValue: string;
  public data: any;

  // Variables privadas
  private _unsubscribeAll: Subject<any>;

  // Formulario reactivo para el estado
  statusForm: FormGroup;

  constructor(
    private router: Router,
    private _userViewService: UserViewService,
    private _httpClient: HttpClient,
    private _router: Router
  ) {
    this._unsubscribeAll = new Subject();
    this.lastValue = this.url.substr(this.url.lastIndexOf('/') + 1);

    // Inicializar el formulario reactivo
    this.statusForm = new FormGroup({
      status: new FormControl('') // Inicializa vacío o con un valor del backend
    });
  }

  // Método para actualizar el estado
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
        // Si el usuario confirma, proceder con el cambio de estado
        this._httpClient.patch(`${environment.apiUrl}/api/requests/${this.data.id}/status`, { status: nuevoStatus }, { headers: { 'Content-Type': 'application/json' } })
          .subscribe(
            (response) => {
              Swal.fire({
                title: '¡Estado Actualizado!',
                icon: 'success',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#7367F0',
              }).then(() => {
                this._router.navigate(['/tables/datatables']);
              });
            },
            (error) => {
              console.error('Error al actualizar el estado:', error); // Log del error
              Swal.fire({
                title: 'Error!',
                text: 'No se pudo actualizar el estado.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#7367F0',
              });
            }
          );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Si el usuario cancela, no hacer nada
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

  // Lifecycle Hooks
  ngOnInit(): void {
    this._userViewService.onUserViewChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((response) => {
      this.data = response;
      console.log(this.data);

      // Actualizar el formulario con el estado actual de la denuncia
      this.statusForm.patchValue({ status: this.data.status });

      // Aquí puedes acceder a más datos de la base de datos
      console.log('Folio:', this.data.folio);
      console.log('Medio de denuncia:', this.data.id_via);
      console.log('Tipo de denuncia:', this.data.id_reason);
      console.log('Ubicación:', this.data.id_location);
      console.log('Fecha del suceso:', this.data.date);
      console.log('Descripción:', this.data.description);
      console.log('Nombre del solicitante:', this.data.applicant_name);
      console.log('Correo del solicitante:', this.data.applicant_email);
      console.log('Teléfono del solicitante:', this.data.applicant_phone);
      console.log('Dirección del solicitante:', this.data.applicant_address);
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
        return 'ERROR';
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