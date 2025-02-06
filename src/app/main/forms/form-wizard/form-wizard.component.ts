import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import Swal from 'sweetalert2';
import { ApiService } from 'app/services/api.service';
import Stepper from 'bs-stepper';


const URL = 'http://localhost:5101';

@Component({
  selector: 'app-form-wizard',
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormWizardComponent implements OnInit {
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
  public involvedList = [{ name: '', position: '', employee_number: '' }];
  public witnessList = [{ name: '', position: '', employee_number: '' }];
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
  
  public isLoggedIn = true;
  
  private verticalWizardStepper: Stepper;

  public uploader: FileUploader = new FileUploader({
    url: URL,
    isHTML5: true,
    allowedFileType: ['image', 'pdf', 'doc', 'docx'],
    maxFileSize: 10 * 1024 * 1024
  });

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarDatos();
    this.verticalWizardStepper = new Stepper(document.querySelector('#stepper2'), {
      linear: false,
      animation: true
    });

    this.today = new Date().toISOString().split('T')[0];
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
        return ['Podium', 'Edificio Mar Baltico', 'Pedro Loza', 'Oficinas de RRHH MTY','E Diaz' ];
  
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
            <strong>Folio:</strong> ${response.folio}<br>
            <strong>Contraseña:</strong> ${response.password}<br>
            <em><strong>❌ IMPORTANTE:❌ </strong> Favor de guardar bien estos datos, ya que no existe ningun método de recuperación.</em>
          `,
          icon: 'success',
          confirmButtonText: 'Entendido'
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
  }

  verticalWizardPrevious() {
    this.verticalWizardStepper.previous();
  }

  cargarDatos() {
    this.apiService.getRoles().subscribe(
      (response) => {
        this.datos = response;
      },
      (error) => {
        console.error('Error al obtener datos', error);
      }
    );
  }

  onUbicacionChange(ubicacion: string): void {
    this.selectedUbicacion = ubicacion;
    this.customInputValue = ''; // Reset el valor
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
        this.listboxOptions = ['Edificio principal', 'Área de estacionamiento', 'Jardines', 'Comedor', 'Recepción'];
        break;
      case 'cedis':
        this.showListbox = true;
        this.locationLabel = 'Seleccione el área del CEDIS';
        this.listboxOptions = ['Área de carga', 'Almacén principal', 'Área de picking', 'Oficinas administrativas', 'Patio de maniobras'];
        break;
      case 'innomex':
        this.showListbox = true;
        this.locationLabel = 'Seleccione el área de INNOMEX';
        this.listboxOptions = ['Planta de producción', 'Laboratorio', 'Almacén de materias primas', 'Área de empaque', 'Control de calidad'];
        break;
      case 'trate':
        this.showListbox = true;
        this.locationLabel = 'Seleccione el área de TRATE';
        this.listboxOptions = ['Taller mecánico', 'Área de lavado', 'Patio de maniobras', 'Oficinas administrativas', 'Almacén de refacciones'];
        break;
    }
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
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      files.forEach((file) => {
        this.uploader.addToQueue([file]);
      });
    }
  }

  addInvolved() {
    this.involvedList.push({ name: '', position: '', employee_number: '' });
  }

  removeInvolved() {
    if (this.involvedList.length > 1) {
      this.involvedList.pop();
    }
  }

  addWitness() {
    this.witnessList.push({ name: '', position: '', employee_number: '' });
  }

  removeWitness() {
    if (this.witnessList.length > 1) {
      this.witnessList.pop();
    }
  }

  toggleAnonimato(value: boolean) {
    this.showAdditionalInfo = value;
  }
}