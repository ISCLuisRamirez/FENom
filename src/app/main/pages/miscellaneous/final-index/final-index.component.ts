import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthenticationService } from 'app/auth/service';
import { CoreConfigService } from '@core/services/config.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-final-index',
  templateUrl: './final-index.component.html',
  styleUrls: ['./final-index.component.scss']
})
export class FinalIndexComponent implements OnInit, OnDestroy {
  public coreConfig: any;

  // Private
  private _unsubscribeAll: Subject<void> = new Subject<void>();

  constructor(
    private _coreConfigService: CoreConfigService,
    private _authenticationService: AuthenticationService,
    public location: Location
  ) {
    // Configure the layout
    this._coreConfigService.setConfig({
      layout: {
        navbar: {
          hidden: false
        },
        footer: {
          hidden: false
        },
        menu: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: true
      }
    }, { emitEvent: true });
  }

  get isCapturista(): boolean {
    return this._authenticationService.isCapturista ?? false;
  }

  get isLoggedIn(): boolean {
    return !!this._authenticationService.currentUserValue;
  }

  ngOnInit(): void {
    this.location.replaceState('/Home');
    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
