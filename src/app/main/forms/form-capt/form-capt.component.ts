import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import Swal from 'sweetalert2';
import { AuthenticationService } from 'app/auth/service';
import { ApiService } from 'app/services/api.service';
import Stepper from 'bs-stepper';
import { User } from 'app/auth/models';
import { Router } from '@angular/router';

const URL = 'http://localhost:5101';

@Component({
  selector: 'app-form-capt',
  templateUrl: './form-capt.component.html',
  styleUrls: ['./form-capt.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCaptComponent implements OnInit {
  public showTransportOptions: boolean = false; // Para mostrar los radios de región cuando se selecciona "Unidad Transporte"
  public showTransportInput: boolean = false; // Para mostrar el input cuando una región ha sido seleccionada
  public selectedRegion: string = ''; // Para almacenar la región seleccionada
  
  public currentUser: User | null = null;
  public locationLabel: string = '';
  public contentHeader: object;
  public TDNameVar = '';
  public TDEmailVar = '';
  public telefono: string = '';
  public selectedUbicacion: string = '';
  public selectedMedio: string = '';
  public email: string = '';
  public approximateDatePeriod = '';
  public specificDate: string = '';
  public today: string;
  public datereport: string = '';
  public selectedFiles: FileItem[] = [];
  public involvedList = [{ name: '', position: '', employeeNumber: '' }];
  public witnessList = [{ name: '', position: '', employeeNumber: '' }];
  public datos = [];
  public selectMultiSelected: any;
  public showValidation: boolean = false;
  public showAdditionalInfo = false;
  public showListbox = false;
  public showInputBox = false;
  public listboxOptions: string[] = [];
  public customInputValue = '';
  public dynamicLabel = '';

  public selectBasic = [
    { name: 'Teléfono' },
    { name: 'Correo' }
  ];

  public selectMulti = [
    { name: 'Abuso de autoridad' },
    { name: 'Acoso laboral' },
    { name: 'Acoso sexual' },
    { name: 'Apropiación y uso indebido de activos o recursos' },
    { name: 'Condiciones inseguras' },
    { name: 'Conflicto de interés' },
    { name: 'Corrupción, soborno o extorsión' },
    { name: 'Desvío de recursos' },
    { name: 'Discriminación' },
    { name: 'Fraude Financiero (Malversación de fondos, falsificación de registros, prácticas contables inadecuadas)' }
  ];

  private verticalWizardStepper: Stepper;

  public uploader: FileUploader = new FileUploader({
    url: URL,
    isHTML5: true,
    allowedFileType: ['image', 'pdf', 'doc', 'docx'],
    maxFileSize: 10 * 1024 * 1024
  });

  constructor(
    private apiService: ApiService,
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private cdr: ChangeDetectorRef // Inyectar ChangeDetectorRef
  ) {}

  get isCapturista(): boolean {
    return this._authenticationService.isCapturista;
  }

  get isLoggedIn() {
    return this._authenticationService.currentUserValue != null;
  }

  get isComite(): boolean {
    return this._authenticationService.isComite;
  }

  ngOnInit() {
    console.log('currentUserValue:', this._authenticationService.currentUserValue?.role);
    this.cargarDatos();
    this.verticalWizardStepper = new Stepper(document.querySelector('#stepper2'), {
      linear: true,
      animation: true
    });

    this.today = new Date().toISOString().split('T')[0];

    Swal.fire({
      title: '<span style="color: red;">IMPORTANTE</span>',
      html: 'Antes de comenzar tu denuncia, ten en cuenta que al finalizar se te asignará un folio y una contraseña únicos. <br><br><strong> Es crucial que los resguardes en un lugar seguro, ya que <strong style="color: red;">NO</strong> podrán recuperarse.</strong>',
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
  }

  validateAndProceed() {
    this.showValidation = true;
    if (this.isStepValid()) {
      this.verticalWizardNext();
    } else {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios antes de continuar.',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
    }
  }

  isStepValid(): boolean {
    const currentStep = (this.verticalWizardStepper as any).currentStep;

    switch (currentStep) {
      case 0:
        return this.selectedMedio && (
          (this.selectedMedio === 'Teléfono' && this.telefono.length === 10) ||
          (this.selectedMedio === 'Correo' && this.email.includes('@'))
        );

      case 1:
        return !!this.selectMultiSelected;

      case 2:
        return this.isUbicacionValid();

      case 3:
        return !!this.datereport && (
          (this.datereport === 'date' && !!this.specificDate) ||
          (this.datereport === 'dateaprox' && !!this.approximateDatePeriod) ||
          (this.datereport === 'NA')
        );

      case 4:
        return this.involvedList.every(person => person.name.trim() !== '');

      case 5:
        if (this.showAdditionalInfo) {
          return !!this.TDNameVar && !!this.TDEmailVar && !!this.telefono;
        }
        return true;

      default:
        return true;
    }
  }

  getListboxOptions(ubicacion: string): string[] {
    switch (ubicacion.toLowerCase()) {
      case 'corporativo':
        return ['Podium', 'Edificio Mar Baltico', 'Pedro Loza', 'Oficinas de RRHH MTY', 'E Diaz'];

      case 'cedis':
        return ['Occidente', 'Noreste', 'Centro'];

      case 'innomex':
        return ['Embotelladora', 'Dispositivos Médicos'];

      case 'trate':
        return ['Occidente', 'Noreste', 'Centro', 'CDA Villahermosa', 'CDA Mérida', 'CDA Chihuahua'];

      default:
        return [];
    }
  }

  onSubmit() {
    if (!this.isStepValid()) {
      Swal.fire({
        title: '❌ Campos Incompletos',
        text: 'Por favor, completa todos los campos obligatorios antes de enviar la denuncia.',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const denunciaData = {
      id_requesters: this.isLoggedIn ? 1 : 0,
      id_reason: this.selectMultiSelected?.id || 0,
      id_location: this.getLocationId(),
      id_sublocation: this.getSubLocationId(),
      date: this.specificDate || this.today,
      file: this.selectedFiles.length > 0 ? this.selectedFiles[0].file.name : '',
      status: 1
    };

    this.apiService.enviarDenuncia(denunciaData).subscribe(
      (response) => {
        Swal.fire({
          title: '¡Denuncia Enviada!',
          html: `
            <strong>Folio:</strong><span style="color: green;"><strong> ${response.folio}</strong></span><br><br>
            <strong>Contraseña:</strong><span style="color: green;"> <strong> ${response.password}</strong><br><br></span>
            <em><span style="color: red;"><strong>IMPORTANTE.</strong><br></span>Recuerda que tu folio y contraseña son únicos. Guárdalos en un lugar seguro. Con este folio y contraseña podrás revisar el estatus de tu denuncia.</em>
          `,
          icon: 'success',
          confirmButtonText:'Cerrar'
        }).then((result) => {
          if (result.isConfirmed || result.dismiss === Swal.DismissReason.close) {
            this._router.navigate(['/Inicio']);
          }
        });
      },
      (error) => {
        Swal.fire({
          title: '❌ Error',
          text: 'Hubo un problema al enviar la denuncia.',
          icon: 'error',
          confirmButtonText: 'Reintentar'
        });
      }
    );
  }

  verticalWizardNext() {
    this.verticalWizardStepper.next();
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  verticalWizardPrevious() {
    this.verticalWizardStepper.previous();
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  cargarDatos() {
    this.apiService.getRoles().subscribe(
      (response) => {
        this.datos = response;
        this.cdr.detectChanges(); // Forzar la detección de cambios
      },
      (error) => {
        console.error('Error al obtener datos', error);
      }
    );
  }

  onRegionChange(region: string): void {
    this.selectedRegion = region;
    this.showTransportInput = !!region; // Si hay una región seleccionada, mostrar el input
    this.cdr.detectChanges();
  }

  // Función para manejar el cambio de ubicación
  onUbicacionChange(ubicacion: string): void {
    this.selectedUbicacion = ubicacion;
    this.customInputValue = ''; // Reset del valor
    this.showListbox = false;
    this.showInputBox = false;
    this.showTransportOptions = false; // Ocultar regiones al cambiar de ubicación
    this.showTransportInput = false; // Ocultar input al cambiar de ubicación
    this.selectedRegion = ''; // Resetear región cuando se cambia de ubicación

    switch (ubicacion.toLowerCase()) {
      case 'sucursales':
        this.showInputBox = true;
        this.locationLabel = 'Ingrese el nombre o número de la sucursal';
        break;
      case 'navesanexas':
        this.showInputBox = true;
        this.locationLabel = 'Ingrese el nombre o número de la nave';
        break;
      case 'unidadtransporte':
        this.showTransportOptions = true; // Mostrar radios de región
        this.locationLabel = 'Seleccione la región y luego ingrese la unidad de transporte';
        break;
      case 'corporativo':
        this.showListbox = true;
        this.locationLabel = 'Seleccione el área del corporativo';
        this.listboxOptions = ['E Diaz', 'Mar Báltico', 'Podium', 'Pedro Loza', 'Oficinas de RRHH MTY'];
        break;
      case 'cedis':
        this.showListbox = true;
        this.locationLabel = 'Seleccione el CEDIS';
        this.listboxOptions = ['Occidente', 'Noreste', 'Centro'];
        break;
      case 'innomex':
        this.showListbox = true;
        this.locationLabel = 'Seleccione el área de INNOMEX';
        this.listboxOptions = ['Embotelladora', 'Dispositivos Médicos'];
        break;
      case 'trate':
        this.showListbox = true;
        this.locationLabel = 'Seleccione el área de TRATE';
        this.listboxOptions = ['Occidente', 'Noreste', 'Centro', 'CDA Villahermosa', 'CDA Mérida', 'CDA Chihuahua'];
        break;
    }
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  isUbicacionValid(): boolean {
    if (!this.selectedUbicacion) return false;

    switch (this.selectedUbicacion.toLowerCase()) {
      case 'sucursales':
      case 'navesanexas':
      case 'unidadtransporte':
        return !!this.customInputValue?.trim();

      case 'corporativo':
      case 'cedis':
      case 'innomex':
      case 'trate':
        return !!this.customInputValue;

      default:
        return false;
    }
  }

  resetDynamicFields(): void {
    this.showListbox = false;
    this.showInputBox = false;
    this.listboxOptions = [];
    this.customInputValue = '';
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  getLocationId(): number {
    switch (this.selectedUbicacion.toLowerCase()) {
      case 'corporativo': return 1;
      case 'cedis': return 2;
      case 'sucursales': return 3;
      case 'naves anexas': return 4;
      case 'innomex': return 5;
      case 'trate': return 6;
      case 'unidad transporte': return 7;
      default: return 0;
    }
  }

  getSubLocationId(): number {
    return this.listboxOptions.indexOf(this.customInputValue) + 1 || 0;
  }

  onMedioChange(event: any) {
    this.selectedMedio = event.name;
    this.telefono = '';
    this.email = '';
    this.showValidation = false;
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      files.forEach((file) => {
        this.uploader.addToQueue([file]);
      });
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }
  }

  addInvolved() {
    this.involvedList.push({ name: '', position: '', employeeNumber: '' });
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  removeInvolved() {
    if (this.involvedList.length > 0) {
      this.involvedList.pop();
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }
  }

  addWitness() {
    this.witnessList.push({ name: '', position: '', employeeNumber: '' });
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  removeWitness() {
    if (this.witnessList.length > 0) {
      this.witnessList.pop();
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }
  }

  toggleAnonimato(value: boolean) {
    this.showAdditionalInfo = value;
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }
}