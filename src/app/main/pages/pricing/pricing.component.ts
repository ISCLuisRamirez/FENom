import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PricingService } from 'app/main/pages/pricing/pricing.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit, OnDestroy {
  public data: any;
  public searchText: string;

  Monthly = false;

  private _unsubscribeAll: Subject<any>;

  constructor(private _pricingService: PricingService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._pricingService.onPricingChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      this.data = response;
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
