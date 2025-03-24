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
  // Public properties
  public coreConfig: any;
  public loginForm: UntypedFormGroup;
  public submitted = false;
  public passwordTextType: boolean;
  public returnUrl: string;
  public error = '';
  public loading = false;
  public roles = [];

  // Private
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
    // Check if the user is already logged in, if so, redirect to the home page
    if (this._authenticationService.currentUserValue) {
      this._router.navigate(['/']);
    }

    this._unsubscribeAll = new Subject();

    // Configure the layout
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

  // Convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Toggle password visibility
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  /**
   * On Submit
   */
  onSubmit() {
    this.submitted = true;

    // Stop here if the form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    // Start loading and call the authentication service to log in
    this.loading = true;
    this._authenticationService
      .login(this.f.employee_number.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        data => {
          switch (data.role) {
            case 'Comite':
              console.log('Comite');
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

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On Init
   */
  ngOnInit(): void {
   /*  this.location.replaceState('/login'); */

    // Initialize the login form with validators
    this.loginForm = this._formBuilder.group({
      employee_number: ['', [Validators.required]],
      password: ['', Validators.required]
    });

    // Get the return URL from route parameters or default to '/'
    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';

    // Subscribe to core config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }

  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
