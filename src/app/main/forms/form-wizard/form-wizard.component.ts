import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { Location } from '@angular/common';
import Stepper from 'bs-stepper';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { ApiService } from 'app/services/api.service';
import { AuthenticationService } from 'app/auth/service';
import { Router } from '@angular/router';
import { User } from 'app/auth/models';
import { environment } from 'environments/environment';
import { id } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-form-wizard',
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormWizardComponent implements OnInit, OnDestroy {
  @ViewChild('form1') form1!: NgForm;
  @ViewChild('form2') form2!: NgForm;
  @ViewChild('form3') form3!: NgForm;
  @ViewChild('form4') form4!: NgForm;
  @ViewChild('form5') form5!: NgForm;
  
  public currentStep: number = 0;
  private verticalWizardStepper: Stepper;
  readonly maxFiles = 5;
  readonly maxTotalSize = 25 * 1024 * 1024; 

  public selectedMedio: any = 0;
  public selectedFiles: FileItem[] = [];

  public value_UT: string = '';
  public showTransportOptions: boolean = false;
  public showTransportInput: boolean = false;
  public selectedRegion: string = '';

  public employee_number: string = '';
  public position: string = '';
  public phone: string = '';
  public name: string = '';
  public email: string = '';
  public isAnonymous: string = 'false';

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
  public locationLabel: string = '';
  public contentHeader: object;
  public TDNameVar = '';
  public TDEmailVar = '';
  public selectedUbicacion: string = '';
  public approximateDatePeriod: string = '';
  public specificDate: string = '';
  public description: string = '';
  public previousReport:string ='';
  public previousReportDetails: string ='';

  public today: string;
  public datereport: string = '';
  public datos = [];

  public showValidation: boolean = false;
  public showAdditionalInfo = false;
  public showListbox = false;
  public showInputBox = false;
  public listboxOptions: string[] = [];
  public customInputValue = '';
  public customInputValuelabel = '';
  public dynamicLabel = '';
  public name_sublocation: string = '';

  public involvedList = [
    { name_inv: '', position_inv: '', employee_number_inv: '', area_inv: 0 } // `area_inv` es solo el ID
  ];
  
  public witnessList = [
    { name_wit: '', position_wit: '', employee_number_wit: '', area_wit: 0 } // `area_wit` es solo el ID
  ];

  public uploader: FileUploader = new FileUploader({
    url: environment.apiUrl,
    isHTML5: true,
    allowedMimeType: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'audio/mpeg',
      'video/mp4'
    ],
    maxFileSize: 25 * 1024 * 1024 // 25 MB
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

  charCount = {
    previousReportDetails: 500,
    description: 500
  };

  numberOnly(event: KeyboardEvent) {
    if (!/^[0-9]$/.test(event.key) && 
        event.key !== 'Backspace' && 
        event.key !== 'Delete' && 
        event.key !== 'ArrowLeft' && 
        event.key !== 'ArrowRight') {
      event.preventDefault();
    }
  }

  validateDate(): void {
    if (this.specificDate > this.today) {
      this.specificDate = ''; 
      Swal.fire({
        title: 'Fecha inválida',
        text: 'La fecha no puede ser posterior a la fecha actual.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  ngOnInit() {
    this._authenticationService.currentUser$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.verticalWizardStepper = new Stepper(document.querySelector('#stepper2'), {
      linear: true,
      animation: true
    });

    this.today = new Date().toISOString().split('T')[0];

    Swal.fire({
      title: '<span style="color: red;">IMPORTANTE</span><br>',
      html: 'Antes de comenzar tu denuncia, ten en cuenta que al finalizar se te asignará un folio y una contraseña únicos. <br><br><strong> Es crucial que los resguardes en un lugar seguro, ya que <strong style="color: red;">NO</strong> podrán recuperarse.</strong>',
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
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

    const isNameSelected = this.name_sublocation && !this.getsubLocationId1() && !this.getsubLocationId2() && !this.getsubLocationId3() && !this.getsubLocationId4();
  
    const denunciaData: any = {
      id_user: this.currentUser?.id || null,
      id_via: this.selectedMedio || null,
      id_reason: this.motivo?.id || null,
      id_location: this.getLocationId(),
      id_sublocation: isNameSelected ? null : (this.getsubLocationId1() || this.getsubLocationId2() || this.getsubLocationId3() || this.getsubLocationId4()),
      name_sublocation: isNameSelected ? this.name_sublocation : null,
      description: this.description,
      reported: this.previousReportDetails || null,
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
  
          if (this.isAnonymous === 'true') {
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
                title: '✅ Denuncia Enviada',
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
  
  updateCharCount(field: string): void {
    const maxLength = field === 'previousReportDetails' ? 500 : 500;
    this.charCount[field] = maxLength - this[field].length;
  }



  verticalWizardNext() {
    switch (this.currentStep) {
      case 0:
        if (this.form1.valid) {
          this.currentStep++;
          this.verticalWizardStepper.next();
        } else {
          console.warn('Formulario "Motivo" inválido');
        }
        break;
      case 1:
        if (this.form2.valid) {
          this.currentStep++;
          this.verticalWizardStepper.next();
        } else {
          console.warn('Formulario "Ubicación" inválido');
        }
        break;
      case 2:
        if (this.form3.valid) {
          this.currentStep++;
          this.verticalWizardStepper.next();
        } else {
          console.warn('Formulario "Detalles" inválido');
        }
        break;
      case 3:
        if (this.form4.valid) {
          this.currentStep++;
          this.verticalWizardStepper.next();
        } else {
          console.warn('Formulario "Involucrados" inválido');
        }
        break;
      case 4:
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

  isStepValid(): boolean {
    const currentStep = this.currentStep;

    switch (currentStep) {
      case 0:
        return !!this.motivo;
      case 1:
        return this.isUbicacionValid();
      case 2:
        return !!this.datereport && (
          (this.datereport === 'date' && !!this.specificDate) ||
          (this.datereport === 'dateaprox' && !!this.approximateDatePeriod) ||
          (this.datereport === 'NA')
        );
      case 3:
        return this.involvedList.every(person => person.name_inv.trim() !== '');
      case 4:
        if (this.showAdditionalInfo) {
          return !!this.name && !!this.email && !!this.phone && !!this.position && !!this.employee_number;
        }
        return true;

      default:
        return true;
    }
  }
  onRegionChange(region: string): void {
    this.selectedRegion = region;
    this.showTransportInput = !!region;
    this.cdr.detectChanges();
  }

  onUbicacionChange(ubicacion: string): void {
    
    this.selectedUbicacion = ubicacion;
    this.customInputValue = '';
    this.customInputValuelabel = '';
    this.name_sublocation = '';
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
        this.locationLabel = 'Ingrese el nombre o número de la nave ';
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
/*       case 'unidadtransporte':
        return !!this.customInputValuelabel?.trim() || !!this.value_UT?.trim();
 */
      case 'corporativo':
      case 'cedis':
      case 'innomex':
      case 'trate':
        return !!this.customInputValue;

      default:
        return false;
    }
  }

  getLocationId(): number {
    switch (this.selectedUbicacion.toLowerCase()) {
      case 'corporativo': return 1;
      case 'cedis': return 2;
      case 'sucursales': return 3;
      case 'anexos': return 4;
      case 'innomex': return 5;
      case 'trate': return 6;
      case 'unidadtransporte': return 7;
      default: return 0;
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
    /* this.cdr.detectChanges(); */
  }
  removeWitness() {
    if (this.witnessList.length > 0) {
      this.witnessList.pop();
      this.cdr.detectChanges();
    }
  }
  trackByFn(index: number, item: any): number {
    return index; 
  }

  toggleAnonimato(value: boolean) {
    this.showAdditionalInfo = value;
    this.cdr.detectChanges();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      const currentQueueLength = this.uploader.queue.length;

      if (currentQueueLength + files.length > 5) {
        Swal.fire({
          title: 'Límite de archivos',
          text: 'Solo se permiten máximo 5 archivos en total.',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
        return;
      }

      const allowedFormats = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'mp3', 'mpeg', 'mp4'];
      const invalidFiles = files.filter(file => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        return !allowedFormats.includes(fileExtension || '');
      });
  
      if (invalidFiles.length > 0) {
        Swal.fire({
          title: 'Formato no válido',
          text: `Algunos archivos tienen formatos no permitidos. Los formatos admitidos son: ${allowedFormats.join(', ')}`,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
  
      const existingSize = this.uploader.queue.reduce((acc, item) => acc + item.file.size, 0);
      const newFilesSize = files.reduce((acc, file) => acc + file.size, 0);
      const totalSize = existingSize + newFilesSize;
  
      if (totalSize > 25 * 1024 * 1024) {
        Swal.fire({
          title: 'Tamaño excedido',
          text: 'El tamaño total de los archivos no puede superar 25 MB.',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
        return;
      }

      files.forEach(file => {
        this.uploader.addToQueue([file]);
      });
  
      this.cdr.detectChanges();
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
  

  

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
