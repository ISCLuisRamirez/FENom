import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import Swal from 'sweetalert2';
import { AuthenticationService } from 'app/auth/service';
import { ApiService } from 'app/services/api.service';
import Stepper from 'bs-stepper';
import { User } from 'app/auth/models';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Location } from '@angular/common';
import { environment } from 'environments/environment';

@Component({
  
  selector: 'app-form-capt',
  templateUrl: './form-capt.component.html',
  styleUrls: ['./form-capt.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCaptComponent implements OnInit {
  @ViewChild('form') form!: NgForm;
  @ViewChild('form1') form1!: NgForm;
  @ViewChild('form2') form2!: NgForm;
  @ViewChild('form3') form3!: NgForm;
  @ViewChild('form4') form4!: NgForm;
  @ViewChild('form5') form5!: NgForm;


  public currentStep: number = 0;
  public name_sublocation: string = '';
  public value_UT:string='';
  public showTransportOptions: boolean = false;
  public showTransportInput: boolean = false; 
  public selectedRegion: string = ''; 

  public previousReport:string ='';
  public previousReportDetails: string ='';


  public employee_number: string ='';
  public position: string = '';
  public phone: string = '';
  public name: '';
  public email: string = '';
  public isAnonymous: boolean = false;


  public telefono_medio: string = '';
  public email_medio: string = '';
  public selectedMedio: any;
  public selectMedio = [
    { name: 'Teléfono', id: 1 },
    { name: 'Correo', id: 2 }
  ];


  public motivo: any;
  public selectMotivo = [
    { name: 'Abuso de autoridad', id: 1 },
    { name: 'Acoso laboral', id: 2 },
    { name: 'Acoso sexual', id: 3 },
    { name: 'Apropiación y uso indebido de activos o recursos', id: 4 },
    { name: 'Condiciones inseguras', id: 5 },
    { name: 'Conflicto de interés', id: 6 },
    { name: 'Corrupción, soborno o extorsión', id: 7 },
    { name: 'Desvío de recursos', id: 8 },
    { name: 'Discriminación', id: 9 },
    { name: 'Fraude Financiero (Malversación de fondos, falsificación de registros, prácticas contables inadecuadas)', id: 10 },
    { name: 'Incumplimiento de las políticas internas', id: 11 },
    { name: 'Manipulación de inventarios', id: 12 }
  ];

  public selectArea = [
    { name: 'Capital Humano', id: 1 },
    { name: 'Legal', id: 2 },
    { name: 'Desarrollo', id: 3 },
    { name: 'Operaciones', id: 4 },
    { name: 'MKT Punto de Venta', id: 5 },
    { name: 'MKT Promociones', id: 6 },
    { name: 'MKT Publicidad', id: 7 },
    { name: 'TI', id: 8 },
    { name: 'Innovación y Planeación Estrategica', id: 9 },
    { name: 'Compras', id: 10 },
    { name: 'Compras Institucionales', id: 11 },
    { name: 'Auditoria Interna', id: 12 },
    { name: 'Finanzas', id: 13 },
    { name: 'Comercio Digital', id: 14 },
    { name: 'Caja de Ahorro', id: 15 },
    { name: 'Mantenimiento', id: 16 },
    { name: 'Kromi (fotosistemas)', id: 17 },
    { name: 'Servicios Medicos (MediCaf)', id: 18 },
    { name: 'Logistica (Tegua-TRATE)', id: 19 },
    { name: 'Innomex', id: 20 }
  ];


  public currentUser: User | null = null;
  public telefono: string = '';

  public employee_number_inv: string ='';
  public position_inv: string = '';
  public name_inv: '';

  public employee_number_wit: string ='';
  public position_wit: string = '';
  public name_wit: ''; 


  
  public locationLabel: string = '';
  public contentHeader: object;
  public TDNameVar = '';
  public TDEmailVar = '';
  public selectedUbicacion: string = '';
  public approximateDatePeriod = '';
  public specificDate: string = '';
  public description:string='';
 
  public today: string;
  public datereport: string = '';
  public selectedFiles: FileItem[] = [];
  public involvedList = [
    { name_inv: '', position_inv: '', employee_number_inv: '', area_inv: 0 } 
  ];
  
  public witnessList = [
    { name_wit: '', position_wit: '', employee_number_wit: '', area_wit: 0 } 
  ];
  public datos = [];
 
  public showValidation: boolean = false;
  public showAdditionalInfo = false;
  public showListbox = false;
  public showInputBox = false;
  public listboxOptions: string[] = [];
  public customInputValue = '';
  public customInputValuelabel = '';
  public dynamicLabel = '';
  private verticalWizardStepper: Stepper;

  public uploader: FileUploader = new FileUploader({
    url: environment.apiUrl,
    isHTML5: true,
    allowedFileType: ['image', 'pdf', 'doc', 'docx'],
    maxFileSize: 10 * 1024 * 1024
  });

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private apiService: ApiService,
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private cdr: ChangeDetectorRef,
    public location: Location
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

  numberOnly(event: KeyboardEvent) {

    if (!/^[0-9]$/.test(event.key) && 
        event.key !== 'Backspace' && 
        event.key !== 'Delete' && 
        event.key !== 'ArrowLeft' && 
        event.key !== 'ArrowRight') {
      event.preventDefault();
    }
  }

  charCount = {
    previousReportDetails: 500,
    description: 500
  };
  updateCharCount(field: string): void {
    const maxLength = field === 'previousReportDetails' ? 500 : 500;
    this.charCount[field] = maxLength - this[field].length;
  }


  ngOnInit() {
    this._authenticationService.currentUser$.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
      this.currentUser = user;
    }); 

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
        return !!this.motivo;

      case 2:
        return this.isUbicacionValid();

      case 3:
        return !!this.datereport && (
          (this.datereport === 'date' && !!this.specificDate) ||
          (this.datereport === 'dateaprox' && !!this.approximateDatePeriod) ||
          (this.datereport === 'NA')
        );

      case 4:
        return this.involvedList.every(person => person.name_inv.trim() !== '');

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
  
    const denunciaData: any = {
      id_user: this.currentUser?.id || null,
      id_via: this.selectedMedio || null,
      via_detail: this.email_medio || this.telefono_medio,
      id_reason: this.motivo?.id || null,
      id_location: this.getLocationId(),
      id_sublocation: this.getsubLocationId1() || this.getsubLocationId2() ||this.getsubLocationId3() || this.getsubLocationId4(),
      description: this.description,
      reported: this.previousReportDetails || null,
      name_sublocation: this.name_sublocation ||  null,
      date: this.specificDate || null,
      period: this.approximateDatePeriod || null,
      file: '',
      status: 1
    };
  
    this.apiService.enviarDenuncia(denunciaData).subscribe({
      next: (response) => {
        const idRequest = response?.id;
        if (!idRequest) {
          Swal.fire({
            title: '❌ Error',
            text: 'No se recibió el ID de la denuncia.',
            icon: 'error',
            confirmButtonText: 'Reintentar'
          });
          return;
        }
  
        const enviarDatosAdicionales = () => {
          const additionalPromises: Promise<any>[] = [];
          if (this.isAnonymous === true) {
            const requesterData = {
              id_request: idRequest,
              name: this.name || '',
              position: this.position || null,
              employee_number: this.employee_number || null,
              phone: this.phone || null,
              email: this.email || null
            };
            additionalPromises.push(this.apiService.enviarDatosPersonales(requesterData).toPromise());
          }
  
          this.involvedList
            .filter(inv => inv.name_inv && inv.name_inv.trim() !== '')
            .forEach(inv => {
              const involvedData = {
                id_request: idRequest,
                name: inv.name_inv || '',
                position: inv.position_inv || '',
                employee_number: inv.employee_number_inv || null,
                id_department: inv.area_inv || null
              };
              additionalPromises.push(this.apiService.enviarDatosInv(involvedData).toPromise());
            });
  
          this.witnessList
            .filter(wit => wit.name_wit && wit.name_wit.trim() !== '')
            .forEach(wit => {
              const witnessData = {
                id_request: idRequest,
                name: wit.name_wit || '',
                position: wit.position_wit || '',
                employee_number: wit.employee_number_wit ? String(wit.employee_number_wit) : null,
                id_department: wit.area_wit || null
              };
              additionalPromises.push(this.apiService.enviarDatosWit(witnessData).toPromise());
            });
  
          Promise.all(additionalPromises)
            .then(() => {
              Swal.fire({
                title: '✅ Denuncia registrada',
                html: `
                  <strong>Folio:</strong> <span style="color: green;"><strong>${response.folio}</strong></span><br>
                  <strong>Contraseña:</strong> <span style="color: green;"><strong>${response.password}</strong></span><br><br>
                  <small>Tu denuncia ha sido ingresada en el sistema. En los próximos días, revisaremos la información que has proporcionado para continuar con la investigación.  </small><br><br>
                  <em style="color: red;"><strong>IMPORTANTE:</strong></em><br>
                  Recuerda que tu folio y contraseña son únicos. Guárdalos en un lugar seguro. Con este folio y contraseña podrás revisar el estatus de tu denuncia.
                `,
                icon: 'success',
                confirmButtonText: 'Cerrar'
              }).then(() => {
                this._router.navigate(['/Inicio']);
              });
            })
            .catch((error) => {
              console.error('❌ Error al guardar datos adicionales:', error);
              Swal.fire({
                title: '❌ Error',
                text: 'Hubo un problema al guardar datos adicionales (involucrados, testigos o datos personales). Verifica los datos e intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Reintentar'
              });
            });
        };
  
        if (this.uploader.queue.length > 0) {
          const uploadObservables = this.uploader.queue.map(item =>
            this.apiService.uploadFile(item._file, idRequest)
          );
          forkJoin(uploadObservables).subscribe({
            next: (uploadResponses: any[]) => {
              const uploadedFiles = uploadResponses.map(resp => resp.fileName || resp.id);
              denunciaData.file = uploadedFiles.join(',');
              enviarDatosAdicionales();
            },
            error: (error) => {
              console.error('Error al subir archivos:', error);
              Swal.fire({
                title: 'Error al subir archivos',
                text: 'No se pudieron subir los archivos. Intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
              });
            }
          });
        } else {
          enviarDatosAdicionales();
        }
      },
      error: (error) => {
        console.error('❌ Error al enviar la denuncia:', error);
        Swal.fire({
          title: '❌ Error',
          text: 'Hubo un problema al enviar la denuncia. Revisa tu conexión e intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'Reintentar'
        });
      }
    });
  }
  
  

  
  
  
  verticalWizardNext() {
    switch (this.currentStep) {
      case 0:
        if (this.form.valid) {
          this.currentStep++;
          this.verticalWizardStepper.next();
        } else {
          console.warn('Formulario "Medio" inválido');
        }
        break;
      case 1:
        if (this.form1.valid) {
          this.currentStep++;
          this.verticalWizardStepper.next();
        } else {
          console.warn('Formulario "Motivo" inválido');
        }
        break;
      case 2:
        if (this.form2.valid) {
          this.currentStep++;
          this.verticalWizardStepper.next();
        } else {
          console.warn('Formulario "Ubicación" inválido');
        }
        break;
      case 3:
        if (this.form3.valid) {
          this.currentStep++;
          this.verticalWizardStepper.next();
        } else {
          console.warn('Formulario "Detalles" inválido');
        }
        break;
      case 4:
        if (this.form4.valid) {
          this.currentStep++;
          this.verticalWizardStepper.next();
        } else {
          console.warn('Formulario "Involucrados" inválido');
        }
        break;
      case 5:
        if (this.form5.valid) {
          this.onSubmit(); 
        } else {
          console.warn('Formulario "Privacidad" inválido');
        }
        break;
      default:
        console.warn('Paso desconocido');
        break;
    }

    this.cdr.detectChanges();
  }

  verticalWizardPrevious() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.verticalWizardStepper.previous();
      this.cdr.detectChanges();
    }
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

  onRegionChange(region: string): void {
    this.selectedRegion = region;
    this.showTransportInput = !!region;
    this.cdr.detectChanges();
  }

  onUbicacionChange(ubicacion: string): void {
    this.selectedUbicacion = ubicacion;
    this.customInputValue = ''; 
    this.showListbox = false;
    this.showInputBox = false;
    this.showTransportOptions = false; 
    this.showTransportInput = false; 
    this.selectedRegion = ''; 

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
        this.showTransportOptions = true; 
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

  resetDynamicFields(): void {
    this.showListbox = false;
    this.showInputBox = false;
    this.listboxOptions = [];
    this.customInputValue = '';
    this.cdr.detectChanges(); 
  }

  getLocationId(): number {
    switch (this.selectedUbicacion.toLowerCase()) {
      case 'corporativo': return 1;
      case 'cedis': return 2;
      case 'navesfilialesysucursales': return 3;
      case 'anexos': return 4;
      case 'innomex': return 5;
      case 'trate': return 6;
      case 'unidadtransporte': return 7;
      default: return 0;
    }
  }

  getsubLocationId1(): number {
      if (this.selectedUbicacion === 'Corporativo' && this.customInputValuelabel === 'E Diaz') {
      return 1;
      }else if (this.selectedUbicacion === 'corporativo' && this.customInputValue === 'Mar Báltico') {
        return 2; 
      }else if (this.selectedUbicacion === 'corporativo' && this.customInputValue === 'Podium') {
        return 3;
      } else if (this.selectedUbicacion === 'corporativo' && this.customInputValue === 'Pedro Loza') {
        return 4;
      } else if (this.selectedUbicacion === 'corporativo' && this.customInputValue === 'Oficinas de RRHH MTY') {
        return 5;
      } else {
        return 0;
      }
    }
    
  
    getsubLocationId2(): number {
      if (this.selectedUbicacion === 'cedis' && this.customInputValue === 'Occidente') {
        return 6;
      } else if (this.selectedUbicacion === 'cedis' && this.customInputValue === 'Noreste') {
        return 7;
      } else if (this.selectedUbicacion === 'cedis' && this.customInputValue === 'Centro') {
        return 8;
      } else {
        return 0;
      }
    }
    
    getsubLocationId3(): number {
      if (this.selectedUbicacion === 'innomex' && this.customInputValue === 'Embotelladora') {
        return 9;
      } else if (this.selectedUbicacion === 'innomex' && this.customInputValue === 'Dispositivos Médicos') {
       return 10;
      }
    }
  
    getsubLocationId4(): number {
      if (this.selectedUbicacion === 'trate' && this.customInputValue === 'Occidente') {
        return 11;
      } else if (this.selectedUbicacion === 'trate' && this.customInputValue === 'Noreste') {
        return 12;
      } else if (this.selectedUbicacion === 'trate' && this.customInputValue === 'Centro') {
        return 13;
      } else if (this.selectedUbicacion === 'trate' && this.customInputValue === 'CDA Villahermosa') {
        return 14;
      } else if (this.selectedUbicacion === 'trate' && this.customInputValue === 'CDA Mérida') {
        return 15;
      } else if (this.selectedUbicacion === 'trate' && this.customInputValue === 'CDA Chihuahua') {
        return 16;
      } else {
        return 0;
      }
    }
    

  onMedioChange() {

    if (this.selectedMedio === 1) {
      this.email_medio = '';
    } else if (this.selectedMedio === 2) {
      this.telefono_medio = '';
    }
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
    this.involvedList.push({ name_inv: '', position_inv: '', employee_number_inv: '', area_inv: 0 });
    this.cdr.detectChanges(); 
  }

  removeInvolved() {
    if (this.involvedList.length > 0) {
      this.involvedList.pop();
      this.cdr.detectChanges(); 
    }
  }

  addWitness() {
    this.witnessList.push({ name_wit: '', position_wit: '', employee_number_wit: '', area_wit: 0});
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
}