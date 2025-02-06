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
  public currentUser: User | null = null;
  public languageOptions: any;
  public selectedLanguage: any;
  public horizontalMenu: boolean;

  @HostBinding('class.fixed-top')
  public isFixed = false;

  @HostBinding('class.navbar-static-style-on-scroll')
  public windowScrolled = false;

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
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private _coreConfigService: CoreConfigService,
    private _coreMediaService: CoreMediaService,
    private _mediaObserver: MediaObserver,
    public _translateService: TranslateService
  ) {}

  // ✅ Obtener información del usuario al inicializar el navbar
  ngOnInit(): void {
    // 📌 Suscribirse a `currentUser$` para obtener el usuario en tiempo real
    this._authenticationService.currentUser$.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
      this.currentUser = user;
    });
    
    // 📌 Obtener configuración de la aplicación
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
      this.horizontalMenu = config.layout.type === 'horizontal';
      this.currentSkin = config.layout.skin;
    });

    // 📌 Configurar opciones de idioma
    this.languageOptions = {
      en: { title: 'English', flag: 'us' },
      fr: { title: 'French', flag: 'fr' },
      de: { title: 'German', flag: 'de' },
      pt: { title: 'Portuguese', flag: 'pt' }
    };

    this.selectedLanguage = _.find(this.languageOptions, { id: this._translateService.currentLang });
  }

  // ✅ Obtener si el usuario está logueado
  get isCapturista(): boolean {
    return this._authenticationService.isCapturista;
  }

  get isLoggedIn() {
    return this._authenticationService.currentUserValue != null;
  }
  

  get isComite(): boolean {
    return this._authenticationService.isComite;
  }

  get isAdmin(): boolean {
    return this._authenticationService.isAdmin;
  }

  /**
   * Método para alternar entre modo oscuro y claro
   */
  toggleDarkSkin() {
    this._coreConfigService.getConfig().pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
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
   * Método para cerrar sesión
   */
  logout() {
    this._authenticationService.logout();
    this._router.navigate(['/pages/authentication/login-v1']);
  }

  /**
   * Método para limpiar suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
