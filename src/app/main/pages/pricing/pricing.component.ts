import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PricingService } from 'app/main/pages/pricing/pricing.service';

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

  // Propiedades para manejar información adicional
  public showInfo: boolean = false;

  private _unsubscribeAll: Subject<any> = new Subject();

  constructor(private _pricingService: PricingService) {}

  ngOnInit(): void {
    // Suscribirse a los datos del servicio
    this._pricingService.onPricingChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.data = response;
      });
  }

  ngAfterViewInit(): void {
    // Generar el CAPTCHA al cargar la vista del componente
    this.generateCaptcha();
  }

  /**
   * Genera un nuevo CAPTCHA y lo renderiza en el canvas.
   */
  generateCaptcha(): void {
    const canvas = this.captchaCanvas.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('No se pudo obtener el contexto del canvas.');
      return;
    }

    // Generar texto CAPTCHA
    this.captcha = this.generateRandomCaptcha();

    // Dibujar el CAPTCHA
    this.drawCaptchaBackground(context, canvas);
    this.drawCaptchaText(context);
    this.drawNoise(context, canvas);

    // Reiniciar validación y entrada del usuario
    this.resetCaptchaValidation();
  }

  /**
   * Genera un texto CAPTCHA aleatorio.
   */
  private generateRandomCaptcha(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'; // Sin caracteres confusos
    return Array.from({ length: 6 }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  }

  /**
   * Dibuja el fondo del CAPTCHA.
   */
  private drawCaptchaBackground(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#f1f1f1';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Dibuja el texto del CAPTCHA de manera distorsionada.
   */
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

  /**
   * Dibuja líneas y puntos aleatorios en el canvas como ruido.
   */
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

  /**
   * Valida si la entrada del usuario coincide con el CAPTCHA.
   */
  validateCaptcha(): void {
    this.captchaError = this.captchaInput.trim().toUpperCase() !== this.captcha.toUpperCase();
    this.isCaptchaValidated = !this.captchaError;
  }

  /**
   * Reinicia los valores relacionados con la validación del CAPTCHA.
   */
  private resetCaptchaValidation(): void {
    this.captchaInput = '';
    this.captchaError = false;
    this.isCaptchaValidated = false;
  }

  /**
   * Alterna la visibilidad de la información adicional.
   */
  toggleInfo(): void {
    this.showInfo = !this.showInfo;
  }

  /**
   * Envía el formulario después de validar el CAPTCHA.
   */
  submitForm(): void {
    this.validateCaptcha();

    if (this.isCaptchaValidated) {
      alert('CAPTCHA válido. Procesando la consulta...');
      // Aquí puedes continuar con la lógica para consultar el estatus
    } else {
      alert('El CAPTCHA no es válido. Inténtalo de nuevo.');
    }
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
