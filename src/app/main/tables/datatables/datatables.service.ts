import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class DatatablesService implements Resolve<any> {
  rows: any;
  onDatatablessChanged: BehaviorSubject<any>;

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.onDatatablessChanged = new BehaviorSubject({});
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
      Promise.all([this.getDataTableRows()]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Get rows
   */
  getDataTableRows(filters: any = {}): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const validFilters: any = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== '') {
          validFilters[key] = filters[key];
        }
      });
  
      this._httpClient.get<any>(`${environment.apiUrl}/api/requests`, { params: validFilters }).subscribe(
        (response) => {
          console.log('Respuesta API:', response);
  
          if (response && response.datos && Array.isArray(response.datos)) {
            this.rows = response.datos; // ✅ Asegurar que estamos tomando el array correctamente
          } else {
            console.error('La API no devolvió un array en response.datos:', response);
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
