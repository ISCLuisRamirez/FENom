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
  public selectedLocationId: number = 0;
  public selectedSubLocationId: number = 0;

  public currentUser: User | null = null;
  public isAnonymous: boolean = true; 
  public locationLabel: string = '';
  public contentHeader: object;
  public TDNameVar = '';
  public TDEmailVar = '';
  public phone: string ='';
  public employee_number: string ='';
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
    console.log('currentUserValue:', this._authenticationService.currentUserValue?.role);
    this.cargarDatos();
    this.verticalWizardStepper = new Stepper(document.querySelector('#stepper2'), {
      linear: true,
      animation: true
    });

    this.today = new Date().toISOString().split('T')[0];
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

  // Función para cargar datos
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

  // Función para manejar el cambio de ubicación
  onUbicacionChange(ubicacion: string): void {
    this.selectedUbicacion = ubicacion;
    this.customInputValue = '';
    this.showListbox = false;
    this.showInputBox = false;
    this.selectedSubLocationId = 0;

    switch (ubicacion.toLowerCase()) {
      case 'corporativo':
        this.selectedLocationId = 1;
        this.showListbox = true;
        this.locationLabel = 'Seleccione el área del corporativo';
        this.listboxOptions = ['E Diaz', 'Mar Báltico', 'Podium', 'Pedro Loza', 'Oficinas de RRHH MTY'];
        break;

      case 'cedis':
        this.selectedLocationId = 2;
        this.showListbox = true;
        this.locationLabel = 'Seleccione el CEDIS';
        this.listboxOptions = ['Occidente', 'Noreste', 'Centro'];
        break;

      case 'sucursales':
        this.selectedLocationId = 3;
        this.showInputBox = true;
        this.locationLabel = 'Ingrese el nombre o número de la sucursal';
        break;

      case 'naves y anexas filiales':
      case 'navesanexas':
        this.selectedLocationId = 4;
        this.showInputBox = true;
        this.locationLabel = 'Ingrese el nombre o número de la nave';
        break;

      case 'innomex':
        this.selectedLocationId = 5;
        this.showListbox = true;
        this.locationLabel = 'Seleccione el área de INNOMEX';
        this.listboxOptions = ['Embotelladora', 'Dispositivos Médicos'];
        break;

      case 'trate':
        this.selectedLocationId = 6;
        this.showListbox = true;
        this.locationLabel = 'Seleccione el área de TRATE';
        this.listboxOptions = ['Occidente', 'Noreste'];
        break;

      case 'unidad de transporte':
      case 'unidadtransporte':
        this.selectedLocationId = 7;
        this.showInputBox = true;
        this.locationLabel = 'Ingrese el número de la unidad';
        break;

      default:
        this.selectedLocationId = 0;
    }

    this.cdr.detectChanges();
  }

  onSubLocationChange(event: any): void {
    const subLocationMap: { [key: string]: number } = {
      'E Diaz': 1,
      'Mar Báltico': 2,
      'Podium': 3,
      'Pedro Loza': 4,
      'Oficinas de RRHH MTY': 5,
      'Occidente': 6,
      'Noreste': 7,
      'Centro': 8,
      'Embotelladora': 9,
      'Dispositivos Médicos': 10
    };

    this.selectedSubLocationId = subLocationMap[event.target.value] || 0;
    console.log("📌 SubUbicación seleccionada:", event.target.value);
    console.log("📌 ID de la SubUbicación:", this.selectedSubLocationId);
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
    this.isAnonymous = !value; 
    this.showAdditionalInfo = value;
    this.cdr.detectChanges();
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
  
    console.log("📌 Valores antes de enviar:");
    console.log("Nombre:", this.TDNameVar);
    console.log("Puesto:", this.TDEmailVar);
    console.log("Número de empleado:", this.employee_number);
    console.log("Teléfono:", this.phone);
    console.log("Email:", this.email);
    console.log("¿Es anónimo?", this.isAnonymous);
  
    // 📌 Datos base de la denuncia
    const denunciaData: any = {
      id_reason: this.selectMultiSelected?.id || 0,
      id_location: this.getLocationId(),
      id_sublocation: this.getSubLocationId(),
      date: this.specificDate || this.today,
      file: this.selectedFiles.length > 0 ? this.selectedFiles[0].file.name : '',
      status: 1
    };
  
    this.apiService.enviarDenuncia(denunciaData).subscribe((response) => {
      console.log("✅ Respuesta de la denuncia:", response);

      if (!this.isAnonymous) {
        const requesterData = {
          id_request: response.id,
          name: this.TDNameVar,
          position: this.TDEmailVar,
          employee_number: this.employee_number, 
          phone: this.phone,  
          email: this.email
        };
  
        console.log("📤 Enviando datos del requester:", requesterData);
  
        this.apiService.enviarDatosPersonales(requesterData).subscribe(
          (res) => {
            console.log("✅ Requester guardado:", res);
          },
          (err) => {
            console.error("❌ Error al guardar requester:", err);
          }
        );
      }
  
      // 📌 Mostrar mensaje y esperar a que el usuario presione "Cerrar"
      Swal.fire({
        title: '¡Denuncia Enviada!',
        html: `<strong>Folio:</strong> <span style="color: green;"><strong>${response.folio}</strong></span><br><br>
               <strong>Contraseña:</strong> <span style="color: green;"><strong>${response.password}</strong></span><br><br>
               <em><span style="color: red;"><strong>IMPORTANTE.</strong></span> Favor de guardar bien estos datos.</em>`,
        icon: 'success',
        confirmButtonText: 'Cerrar'
      }).then((result) => {
        if (result.isConfirmed) {
          this._router.navigate(['/Inicio']); // 🔥 Redirige SOLO cuando presione "Cerrar"
        }
      });
  
    });
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