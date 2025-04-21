import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class ProfileService implements Resolve<any> {
  onPricingChanged: BehaviorSubject<any>;

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient - 
   */
  constructor(private _httpClient: HttpClient) {
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
      Promise.all([this.getDataTableRows()]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * 
   *
   * @returns {Promise<any[]>} 
   */
  getDataTableRows(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/profile-data').subscribe(
        (response: any) => {
          this.onPricingChanged.next(response);
          resolve(response);
        },
        (error) => {
          console.error('Error al obtener los datos:', error);
          reject(error);
        }
      );
    });
  }

  refreshData(): void {
    this.getDataTableRows().then(() => {
    }).catch((error) => {
      console.error('Error al actualizar los datos:', error);
    });
  }
}