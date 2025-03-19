import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable()
export class PricingService implements Resolve<any> {
  rows: any;
  onPricingChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient) {
    this.onPricingChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getDataTableRows()]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Obtiene los datos de la tabla de precios.
   */
  getDataTableRows(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/pricing-data').subscribe(
        (response: any) => {
          this.rows = response;
          this.onPricingChanged.next(this.rows);
          resolve(this.rows);
        },
        (error) => {
          console.error('Error al obtener los datos de la tabla:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Consulta el estatus de un folio con su contraseña.
   * @param folio Número de folio
   * @param password Contraseña asociada al folio
   * @returns Observable con la respuesta del servidor
   */
  searchStatus(folio: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('folio', folio)
      .set('password', password);

    return this._httpClient.get<any>(environment.apiUrl+'/requests/search', { params });
  }
}
