import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { takeUntil } from 'rxjs/operators';
import { PricingService } from 'app/main/pages/pricing/pricing.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('captchaCanvas', { static: false }) captchaCanvas!: ElementRef<HTMLCanvasElement>;

  public data: any;
  public searchText: string = '';
  public captcha: string = '';
  public captchaInput: string = '';
  public captchaError: boolean = false;
  public isCaptchaValidated: boolean = false;

  public folio: string = '';        // Campo para el folio
  public password: string = '';     // Campo para la contraseña
  public statusResponse: any;       // Respuesta del backend

  public showInfo: boolean = false; // ✅ Propiedad para controlar la visibilidad de la información

  private _unsubscribeAll: Subject<any> = new Subject();

  constructor(private _pricingService: PricingService,public location:Location ) { }

  ngOnInit(): void {
   /*  this.location.replaceState('/status_inquiry'); */
    this._pricingService.onPricingChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.data = response;
      });
  }

  ngAfterViewInit(): void {
    this.generateCaptcha();
  }

  /**
   * ✅ Método para alternar la visibilidad de la información adicional.
   */
  toggleInfo(): void {
    this.showInfo = !this.showInfo;
  }

  generateCaptcha(): void {
    const canvas = this.captchaCanvas.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('No se pudo obtener el contexto del canvas.');
      return;
    }

    this.captcha = this.generateRandomCaptcha();
    this.drawCaptchaBackground(context, canvas);
    this.drawCaptchaText(context);
    this.drawNoise(context, canvas);
    this.resetCaptchaValidation();
  }

  private generateRandomCaptcha(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789';
    return Array.from({ length: 6 }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  }

  private drawCaptchaBackground(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#f1f1f1';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  private drawCaptchaText(context: CanvasRenderingContext2D): void {
    context.font = '30px Arial';
    context.fillStyle = '#000';
    const startX = 20;

    Array.from(this.captcha).forEach((char, index) => {
      const x = startX + index * 30;
      const y = 40 + Math.random() * 10 - 5;
      const angle = Math.random() * 0.4 - 0.2;
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.fillText(char, 0, 0);
      context.restore();
    });
  }

  private drawNoise(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    for (let i = 0; i < 5; i++) {
      context.strokeStyle = `rgba(0, 0, 0, ${Math.random()})`;
      context.beginPath();
      context.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      context.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      context.stroke();
    }

    for (let i = 0; i < 50; i++) {
      context.fillStyle = `rgba(0, 0, 0, ${Math.random()})`;
      context.beginPath();
      context.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
      context.fill();
    }
  }

  validateCaptcha(): void {
    this.captchaError = this.captchaInput.trim().toUpperCase() !== this.captcha.toUpperCase();
    this.isCaptchaValidated = !this.captchaError;
  }

  private resetCaptchaValidation(): void {
    this.captchaInput = '';
    this.captchaError = false;
    this.isCaptchaValidated = false;
  }

  submitForm(): void {
    this.validateCaptcha();

    if (this.isCaptchaValidated) {
      if (this.folio.trim() && this.password.trim()) {
        this._pricingService.searchStatus(this.folio, this.password).subscribe({
          next: (response) => {
            this.statusResponse = response;
            if (response.requestStatus == 1) {
              Swal.fire({
                titleText: 'Tu solicitud se encuentra:',
                html: '<span style="color: blue; font-size: 28px;"><strong>En proceso.</strong></span> <br>',
                confirmButtonText: 'Cerrar'
              });
            }else{
              if (response.requestStatus == 2) {
                Swal.fire({
                  title: 'Tu solicitud se encuentra:',
                  html: '<span style="color: yellow; font-size: 28px;"><strong>Abierta.</strong></span> <br>',
                  confirmButtonText: 'Cerrar'
                });
              }else{
                Swal.fire({
                  title: 'Tu solicitud se encuentra:',
                  html: '<span style="color: green; font-size: 28px;"><strong>Cerrada.</strong></span> <br>',
                  confirmButtonText: 'Cerrar'
                });
              }
            }
          },
          error: (error) => {
            Swal.fire({
              title: 'Error.',
              text: 'Hubo un error al consultar el estatus. Folio o contraseña inexistentes. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Reintentar'
            });
          }
        });
      } else {
        Swal.fire({
          title: 'Completa los campos',
          text: 'Debe ingresar el folio y la contraseña.',
          icon: 'warning',
          confirmButtonText: 'Reintentar'
        });
      }
    } else {
      Swal.fire({
        title: '¿Eres un robot?',
        text: 'El CAPTCHA no es válido. Inténtalo de nuevo.',
        icon: 'warning',
        confirmButtonText: 'Reintentar'
      });
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
