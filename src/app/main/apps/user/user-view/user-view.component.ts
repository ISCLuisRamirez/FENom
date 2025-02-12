import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';
import { UserViewService } from 'app/main/apps/user/user-view/user-view.service';
import { environment } from 'environments/environment';

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
  constructor(private router: Router, private _userViewService: UserViewService, private _httpClient: HttpClient) {
    this._unsubscribeAll = new Subject();
    this.lastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  statusForm = new FormGroup({
    status: new FormControl('') // Inicializa vacío o con un valor del backend
  });

  actualizarStatus() {
    const nuevoStatus = this.statusForm.value.status;

    this._httpClient.put(`${environment.apiUrl}/api/requests/${this.data.id}`, { status: nuevoStatus })
      .subscribe(
        response => {
          console.log('Estado actualizado correctamente', response);
          alert('Estado actualizado con éxito');
        },
        error => {
          console.error('Error actualizando el estado', error);
          alert('Hubo un error al actualizar el estado');
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
