import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';

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

  getDataTableRows(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/pricing-data').subscribe((response: any) => {
        this.rows = response;
        this.onPricingChanged.next(this.rows);
        resolve(this.rows);
      }, reject);
    });
  }
}
