import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class DatatablesService implements Resolve<any> {
  rows: any[] = [];
  onDatatablessChanged: BehaviorSubject<any>;

  private apiUrl = `${environment.apiUrl}/api/requests`; // ✅ Definir API URL correctamente

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    this.onDatatablessChanged = new BehaviorSubject([]);
  }

  /**
   * Resolver
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getDataTableRows()]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Obtiene las solicitudes con paginación desde el backend
   */
  getRequests(filtro: any): Observable<any> {
    let params = new HttpParams()
      .set('Pagina', filtro.Pagina.toString())
      .set('TamanoPagina', filtro.TamanoPagina.toString());

    if (filtro.IdReason) params = params.set('IdReason', filtro.IdReason.toString());
    if (filtro.IdLocation) params = params.set('IdLocation', filtro.IdLocation.toString());
    if (filtro.IdSublocation) params = params.set('IdSublocation', filtro.IdSublocation.toString());
    if (filtro.FechaDesde) params = params.set('FechaDesde', filtro.FechaDesde);
    if (filtro.FechaHasta) params = params.set('FechaHasta', filtro.FechaHasta);
    if (filtro.Status) params = params.set('Status', filtro.Status.toString());
    if (filtro.Folio) params = params.set('Folio', filtro.Folio);
    if (filtro.OrdenarPor) params = params.set('OrdenarPor', filtro.OrdenarPor);
    params = params.set('OrdenDesc', filtro.OrdenDesc.toString());

    return this._httpClient.get<any>(this.apiUrl, { params });
  }

  /**
   * Obtiene las filas para la tabla con filtros aplicados
   */
  getDataTableRows(filters: any = {}): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let params = new HttpParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== '') {
          params = params.set(key, filters[key].toString());
        }
      });

      this._httpClient.get<any>(this.apiUrl, { params }).subscribe(
        (response) => {
          console.log('Respuesta API:', response);

          if (response && response.datos && Array.isArray(response.datos)) {
            this.rows = response.datos; // ✅ Asegurar que se toma correctamente el array de datos
          } else {
            console.error('La API no devolvió un array en response.Datos:', response);
            this.rows = [];
          }

          this.onDatatablessChanged.next(this.rows);
          resolve(this.rows);
        },
        (error) => {
          console.error('Error al obtener datos:', error);
          this.rows = [];
          reject(error);
        }
      );
    });
  }
}
