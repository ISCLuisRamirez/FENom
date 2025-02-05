import { Component, OnDestroy, OnInit, HostBinding, HostListener, ViewEncapsulation } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'app/auth/service';
import { CoreConfigService } from '@core/services/config.service';
import { CoreMediaService } from '@core/services/media.service';
import { User } from 'app/auth/models';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'app/services/api.service';

const URL = 'http://localhost:5101';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit, OnDestroy {
  public coreConfig: any;
  public currentSkin: string;
  public prevSkin: string;
  public currentUser: User;
  public languageOptions: any;
  public selectedLanguage: any;
  public horizontalMenu: boolean;  // Retenido para el menú horizontal

  @HostBinding('class.fixed-top')
  public isFixed = false;

  @HostBinding('class.navbar-static-style-on-scroll')
  public windowScrolled = false;

  // Add .navbar-static-style-on-scroll on scroll using HostListener & HostBinding
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (
      (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) &&
      this.coreConfig.layout.navbar.type == 'navbar-static-top' &&
      this.coreConfig.layout.type == 'horizontal'
    ) {
      this.windowScrolled = true;
    } else if (
      (this.windowScrolled && window.pageYOffset) ||
      document.documentElement.scrollTop ||
      document.body.scrollTop < 10
    ) {
      this.windowScrolled = false;
    }
  }

  // Private
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private _coreConfigService: CoreConfigService,
    private _coreMediaService: CoreMediaService,
    private _mediaObserver: MediaObserver,
    public _translateService: TranslateService
  ) {
    this._authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;
    });

    this.languageOptions = {
      en: { title: 'English', flag: 'us' },
      fr: { title: 'French', flag: 'fr' },
      de: { title: 'German', flag: 'de' },
      pt: { title: 'Portuguese', flag: 'pt' }
    };

    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle Dark Skin
   */
  toggleDarkSkin() {
    this._coreConfigService
      .getConfig()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(config => {
        this.currentSkin = config.layout.skin;
      });

    this.prevSkin = localStorage.getItem('prevSkin');

    if (this.currentSkin === 'dark') {
      this._coreConfigService.setConfig(
        { layout: { skin: this.prevSkin ? this.prevSkin : 'default' } },
        { emitEvent: true }
      );
    } else {
      localStorage.setItem('prevSkin', this.currentSkin);
      this._coreConfigService.setConfig({ layout: { skin: 'dark' } }, { emitEvent: true });
    }
  }

  /**
   * Logout method
   */
  logout() {
    this._authenticationService.logout();
    this._router.navigate(['/pages/authentication/login-v1']);
  }

  // Helper method to check if the user is logged in
  get isLoggedIn() {
    return this._authenticationService.currentUserValue != null;
  }

  // Helper method to check if the user is an admin
  get isComite() {
    return this._authenticationService.isComite;
  }

  // Helper method to check if the user is a client
  get isCapturista() {
    return this._authenticationService.isCapturista;
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
      this.horizontalMenu = config.layout.type === 'horizontal'; // Aseguramos que el menú horizontal se mantenga
      this.currentSkin = config.layout.skin;
    });

    this.selectedLanguage = _.find(this.languageOptions, { id: this._translateService.currentLang });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
