import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import Swal from 'sweetalert2';
import { AuthenticationService } from 'app/auth/service';
import { ApiService } from 'app/services/api.service';
import Stepper from 'bs-stepper';
import { User } from 'app/auth/models';
import { NgForm } from '@angular/forms'; // Importa NgForm
import { Router } from '@angular/router';

const URL = 'http://localhost:5101';

@Component({
  selector: 'app-form-wizard',
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormWizardComponent implements OnInit {
  //Datos de endpoint requesters en caso de no ser anónimo */
  public employee_number: string ='';
  public position: string = '';
  public phone: string = '';
  public name: '';
  public email: string = '';


 public isAnonymous: boolean = false;
  public currentUser: User | null = null;
  public locationLabel: string = '';
  public contentHeader: object;
  public TDNameVar = '';
  public TDEmailVar = '';
  
  
  
  public telefono: string = '';
  public selectedUbicacion: string = '';
  public selectedMedio: string = '';
  
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
  public showTransportOptions: boolean = false; // Para mostrar los radios de región cuando se selecciona "Unidad Transporte"
  public showTransportInput: boolean = false; // Para mostrar el input cuando una región ha sido seleccionada
  public selectedRegion: string = ''; // Para almacenar la región seleccionada

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
    private _router: Router,
    private apiService: ApiService,
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

  // Función para avanzar al siguiente paso
  verticalWizardNext(form: NgForm) {
    if (form.valid) {
      this.verticalWizardStepper.next();
      this.cdr.detectChanges(); // Forzar la detección de cambios
    } else {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios antes de continuar.',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
    }
  }

  // Función para retroceder al paso anterior
  verticalWizardPrevious() {
    this.verticalWizardStepper.previous();
    this.cdr.detectChanges(); // Forzar la detección de cambios
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


  // Función para validar la ubicación
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

  // Función para manejar el cambio de medio
  onMedioChange(event: any) {
    this.selectedMedio = event.name;
    this.telefono = '';
    this.email = '';
    this.showValidation = false;
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  // Función para manejar la selección de archivos
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

  // Función para agregar involucrados
  addInvolved() {
    this.involvedList.push({ name: '', position: '', employeeNumber: '' });
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  // Función para eliminar involucrados
  removeInvolved() {
    if (this.involvedList.length > 0) {
      this.involvedList.pop();
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }
  }

  // Función para agregar testigos
  addWitness() {
    this.witnessList.push({ name: '', position: '', employeeNumber: '' });
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  // Función para eliminar testigos
  removeWitness() {
    if (this.witnessList.length > 0) {
      this.witnessList.pop();
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }
  }

  // Función para manejar el anonimato
  toggleAnonimato(value: boolean) {
    this.showAdditionalInfo = value;
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  

  // Función para enviar el formulario
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
        // Si la denuncia se envió correctamente, registrar el solicitante (denunciante)
        const requesterData = {
          id_request: response.id, // ID de la denuncia creada
          name: this.name,
          position: this.position, // Suponiendo que la ubicación es la posición
          employee_number: this.employee_number || null,
          phone: this.phone || null,
          email: this.email|| null
        };
  
        this.apiService.enviarDatosPersonales(requesterData).subscribe(
          (res) => {
            Swal.fire({
              title: '¡Denuncia Enviada!',
              html: `
                <strong>Folio:</strong><span style="color: green;"><strong> ${response.folio}</strong></span><br><br>
                <strong>Contraseña:</strong><span style="color: green;"> <strong> ${response.password}</strong><br><br></span>
                <em><span style="color: red;"><strong>IMPORTANTE.</strong><br></span>Recuerda que tu folio y contraseña son únicos. Guárdalos en un lugar seguro.</em>
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
            console.error("Error al guardar el solicitante:", error);
          }
        );
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
  

  // Función para validar el paso actual
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

  // Función para obtener el ID de la ubicación
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

  // Función para obtener el ID de la sububicación
  getSubLocationId(): number {
    return this.listboxOptions.indexOf(this.customInputValue) + 1 || 0;
  }
}