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
  // public
  public url = this.router.url;
  public lastValue;
  public data;

  // private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {Router} router
   * @param {UserViewService} _userViewService
   * @param {HttpClient} _httpClient
   */
  constructor(
    private router: Router,
    private _userViewService: UserViewService,
    private _httpClient: HttpClient,
    private _router: Router
  ) {
    this._unsubscribeAll = new Subject();
    this.lastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  statusForm = new FormGroup({
    status: new FormControl('') // Inicializa vacío o con un valor del backend
  });

  actualizarStatus() {
    const nuevoStatus = this.statusForm.value.status;

    this._httpClient.patch(`${environment.apiUrl}/api/requests/${this.data.id}/status`, nuevoStatus, { headers: { 'Content-Type': 'application/json' } })
      .subscribe(
        response => {
          Swal.fire({
            title: '¡Estado Actualizado!',
            /* text: 'Por favor, completa todos los campos obligatorios antes de enviar la denuncia.', */
            icon: 'success',
            confirmButtonText: 'Cerrar'
          }).then((result) => {
            if (result.isConfirmed || result.dismiss === Swal.DismissReason.close) {
              this._router.navigate(['/tables/datatables']);
            }
          });
        },
        error => {
          Swal.fire({
            title: 'Error!',
            /* text: 'Por favor, completa todos los campos obligatorios antes de enviar la denuncia.', */
            icon: 'error',
            confirmButtonText: 'Cerrar'
          })
        }
      );
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
  ngOnInit(): void {
    this._userViewService.onUserViewChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      this.data = response;
      console.log(this.data)
    });
    this.statusForm.patchValue({ status: this.data.status });
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
