import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import Swal from 'sweetalert2';
import { AuthenticationService } from 'app/auth/service';
import { ApiService } from 'app/services/api.service';
import Stepper from 'bs-stepper';
import { User } from 'app/auth/models';
import { NgForm } from '@angular/forms';
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
    maxFileSize: 10 * 1024 * 1024 // 10 MB
  });

  constructor(
    private _router: Router,
    private apiService: ApiService,
    private _authenticationService: AuthenticationService,
    private cdr: ChangeDetectorRef
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

    this.uploader.onAfterAddingFile = (fileItem) => {
      fileItem.withCredentials = false;
    };
  }

  verticalWizardNext(form: NgForm) {
    if (form.valid) {
      this.verticalWizardStepper.next();
      this.cdr.detectChanges();
    } else {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios antes de continuar.',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
    }
  }

  verticalWizardPrevious() {
    this.verticalWizardStepper.previous();
    this.cdr.detectChanges();
  }

  cargarDatos() {
    this.apiService.getRoles().subscribe(
      (response) => {
        this.datos = response;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al obtener datos', error);
      }
    );
  }

  onUbicacionChange(ubicacion: string): void {
    this.selectedUbicacion = ubicacion;
    this.customInputValue = '';
    this.showListbox = false;
    this.showInputBox = false;

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
        this.showInputBox = true;
        this.locationLabel = 'Ingrese el número de la unidad';
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
    this.cdr.detectChanges();
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

  onMedioChange(event: any) {
    this.selectedMedio = event.name;
    this.telefono = '';
    this.email = '';
    this.showValidation = false;
    this.cdr.detectChanges();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      files.forEach((file) => {
        this.uploader.addToQueue([file]);
      });
      this.cdr.detectChanges();
    }
  }

  addInvolved() {
    this.involvedList.push({ name: '', position: '', employeeNumber: '' });
    this.cdr.detectChanges();
  }

  removeInvolved() {
    if (this.involvedList.length > 0) {
      this.involvedList.pop();
      this.cdr.detectChanges();
    }
  }

  addWitness() {
    this.witnessList.push({ name: '', position: '', employeeNumber: '' });
    this.cdr.detectChanges();
  }

  removeWitness() {
    if (this.witnessList.length > 0) {
      this.witnessList.pop();
      this.cdr.detectChanges();
    }
  }

  toggleAnonimato(value: boolean) {
    this.showAdditionalInfo = value;
    this.cdr.detectChanges();
  }

  async onSubmit(form: NgForm) {
    try {
      // 1️⃣ Crear la denuncia
      const requestData = {
        id_reason: this.selectMultiSelected?.id || 0,
        id_location: this.getLocationId(),
        id_sublocation: this.getSubLocationId(),
        name_sublocation: this.customInputValue,
        date: this.specificDate,
        period: this.approximateDatePeriod,
        status: 1
      };

      const requestResponse = await this.apiService.enviarDenuncia(requestData).toPromise();
      if (!requestResponse || !requestResponse.id) {
        throw new Error('Error al obtener el ID de la denuncia');
      }
      const id_request = requestResponse.id;

      // 2️⃣ Guardar datos del solicitante (si aplica)
      if (this.TDNameVar && this.TDEmailVar && this.telefono) {
        await this.apiService.guardarSolicitante({
          id_request,
          name: this.TDNameVar,
          position: this.TDEmailVar,
          employee_number: this.telefono,
          phone: this.telefono,
          email: this.email
        }).toPromise();
      }

      // 3️⃣ Guardar involucrados
      for (const person of this.involvedList) {
        await this.apiService.guardarInvolucrado({
          id_request,
          name: person.name,
          position: person.position,
          employee_number: person.employeeNumber,
          phone: this.telefono,
          email: this.email
        }).toPromise();
      }

      // 4️⃣ Guardar testigos
      for (const witness of this.witnessList) {
        await this.apiService.guardarTestigo({
          id_request,
          name: witness.name,
          position: witness.position,
          employee_number: witness.employeeNumber,
          phone: this.telefono,
          email: this.email
        }).toPromise();
      }

      // 5️⃣ Subir archivos
      for (const fileItem of this.uploader.queue) {
        const file = fileItem._file;
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('id_request', id_request.toString());
        await this.apiService.subirArchivo(formData).toPromise();
      }

      // 6️⃣ Mostrar mensaje de éxito
      Swal.fire({
        title: '¡Denuncia Enviada! ✅',
        html: `
          <strong>Folio:</strong> <span style="color: green;">${requestResponse.folio}</span><br>
          <strong>Contraseña:</strong> <span style="color: green;">${requestResponse.password}</span><br>
          <em><strong style="color: red;">IMPORTANTE:</strong> Guarda estos datos, no hay recuperación.</em>
        `,
        icon: 'success',
        confirmButtonText: 'Cerrar'
      }).then(() => this._router.navigate(['/Inicio']));

    } catch (error) {
      console.error('Error al enviar datos', error);
      Swal.fire('Error', 'No se pudo enviar la denuncia. Intenta de nuevo.', 'error');
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

  getLocationId(): number {
    const locations = { corporativo: 1, cedis: 2, sucursales: 3, navesanexas: 4, innomex: 5, trate: 6, unidadtransporte: 7 };
    return locations[this.selectedUbicacion.toLowerCase()] || 0;
  }

  getSubLocationId(): number {
    return this.customInputValue ? this.customInputValue.length : 0;
  }
}