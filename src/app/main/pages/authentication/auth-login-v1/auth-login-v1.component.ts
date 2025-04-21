import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil, first } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { AuthenticationService } from 'app/auth/service';
import { CoreConfigService } from '@core/services/config.service';
import { ApiService } from 'app/services/api.service';

@Component({
  selector: 'app-auth-login-v1',
  templateUrl: './auth-login-v1.component.html',
  styleUrls: ['./auth-login-v1.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthLoginV1Component implements OnInit {
  public coreConfig: any;
  public loginForm: UntypedFormGroup;
  public submitted = false;
  public passwordTextType: boolean;
  public returnUrl: string;
  public error = '';
  public loading = false;
  public roles = [];
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {UntypedFormBuilder} _formBuilder
   * @param {ActivatedRoute} _route
   * @param {Router} _router
   * @param {AuthenticationService} _authenticationService
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private _formBuilder: UntypedFormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private apiService: ApiService,
    public location:Location
  ) {
    if (this._authenticationService.currentUserValue) {
      this._router.navigate(['/']);
    }

    this._unsubscribeAll = new Subject();

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this._authenticationService
      .login(this.f.employee_number.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        data => {
          switch (data.role) {
            case 'Comite':
              this._router.navigate(['/pages/profile']);
              break;
            default:
              this._router.navigate([this.returnUrl]);
              break;
          }
        },
        error => {
          this.error = error;
          this.loading = false;
        }
      );

  }

  ngOnInit(): void {
    this.loginForm = this._formBuilder.group({
      employee_number: ['', [Validators.required]],
      password: ['', Validators.required]
    });

    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
