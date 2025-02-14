import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Asegúrate de que el servicio esté proporcionado en el nivel raíz
})
export class ProfileService implements Resolve<any> {
  // BehaviorSubject para emitir los cambios en los datos
  onPricingChanged: BehaviorSubject<any>;

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient - HttpClient para hacer solicitudes HTTP
   */
  constructor(private _httpClient: HttpClient) {
    // Inicializar el BehaviorSubject con un valor por defecto (objeto vacío)
    this.onPricingChanged = new BehaviorSubject({});
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      // Obtener los datos al resolver la ruta
      Promise.all([this.getDataTableRows()]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Obtener filas de datos desde el endpoint
   *
   * @returns {Promise<any[]>} - Promesa con los datos obtenidos
   */
  getDataTableRows(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      // Hacer la solicitud HTTP para obtener los datos
      this._httpClient.get('api/profile-data').subscribe(
        (response: any) => {
          // Emitir los datos a través del BehaviorSubject
          this.onPricingChanged.next(response);
          resolve(response);
        },
        (error) => {
          // Manejar errores
          console.error('Error al obtener los datos:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Método para actualizar los datos manualmente (opcional)
   */
  refreshData(): void {
    this.getDataTableRows().then(() => {
      console.log('Datos actualizados correctamente');
    }).catch((error) => {
      console.error('Error al actualizar los datos:', error);
    });
  }
}