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
import { StringNullableChain } from 'lodash';

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


  //Datos de endpoint requesters en caso de no ser anónimo
  public employee_number: string ='';
  public position: string = '';
  public phone: string = '';
  public name: '';
  public email: string = '';
  public isAnonymous: boolean = false;

  //Datos de endpoint medio
  public telefono_medio: string = '';
  public email_medio: string = '';
  public selectedMedio: any;
  public selectMedio = [
    { name: 'Teléfono', id: 1 },
    { name: 'Correo', id: 2 }
  ];

  //Datos del motivo (Listado de motivos y respectivos ID's)
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

  //Datos del endpoint request 
  public currentUser: User | null = null;
  public telefono: string = '';

  //datos del endpoint involved
  public employee_number_inv: string ='';
  public position_inv: string = '';
  public name_inv: '';

  //Datos del endpoint witness
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
  public today: string;
  public datereport: string = '';
  public selectedFiles: FileItem[] = [];
  public involvedList = [{ name: '', position: '', employeeNumber: '' }];
  public witnessList = [{ name: '', position: '', employeeNumber: '' }];
  public datos = [];
 
  public showValidation: boolean = false;
  public showAdditionalInfo = false;
  public showListbox = false;
  public showInputBox = false;
  public listboxOptions: string[] = [];
  public customInputValue = '';
  public dynamicLabel = '';

  

  


  private verticalWizardStepper: Stepper;

  public uploader: FileUploader = new FileUploader({
    url: URL,
    isHTML5: true,
    allowedFileType: ['image', 'pdf', 'doc', 'docx'],
    maxFileSize: 10 * 1024 * 1024
  });

  private _unsubscribeAll: Subject<any> = new Subject<any>();

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
  
    // Determinar si se debe guardar name_sublocation o id_sublocation
    const ubicacionesConInput = ['unidadtransporte', 'anexos', 'navesfilialesysucursales'];
    const usarNameSubLocation = ubicacionesConInput.includes(this.selectedUbicacion.toLowerCase());
  
    let idSubLocation: number | null = null;
    let nameSubLocation: string | null = null;
  
    if (usarNameSubLocation) {
      // Guardar el valor del input en name_sublocation
      nameSubLocation = this.customInputValue;
    } else {
      // Obtener el ID de la sububicación para otras ubicaciones
      idSubLocation = this.getSubLocationId();
    }
  
    // Datos de la denuncia
    const denunciaData = {
      id_user: this.currentUser.id,
      id_via: this.selectedMedio || 0,
      id_reason: this.motivo.id || 0,
      id_location: this.getLocationId(),
      id_sublocation: idSubLocation, // Puede ser null si se usa name_sublocation
      name_sublocation: nameSubLocation, // Guardar el nombre de la sububicación si es necesario
      date: this.specificDate || this.today,
      file: this.selectedFiles.length > 0 ? this.selectedFiles[0].file.name : '',
      status: 1
    };
  
    // Enviar la denuncia
    this.apiService.enviarDenuncia(denunciaData).subscribe(
      (response) => {
        // Si la denuncia se envió correctamente, registrar el solicitante (denunciante)
        const requesterData = {
          id_request: response.id, // ID de la denuncia creada
          name: this.name,
          position: this.position,
          employee_number: this.employee_number || null,
          phone: this.phone || null,
          email: this.email || null
        };
  
        this.apiService.enviarDatosPersonales(requesterData).subscribe(
          (res) => {
            // Guardar datos de Involucrados (Involved)
            const involvedPromises = this.involvedList.map((involved) => {
              const involvedData = {
                id_request: response.id, // ID de la denuncia creada
                name: involved.name,
                position: involved.position,
                employee_number: involved.employeeNumber || null
              };
              return this.apiService.enviarDatosInv(involvedData).toPromise();
            });
  
            // Guardar datos de Testigos (Witness)
            const witnessPromises = this.witnessList.map((witness) => {
              const witnessData = {
                id_request: response.id, // ID de la denuncia creada
                name: witness.name,
                position: witness.position,
                employee_number: witness.employeeNumber || null
              };
              return this.apiService.enviarDatosWit(witnessData).toPromise();
            });
  
            // Esperar a que todas las promesas se resuelvan
            Promise.all([...involvedPromises, ...witnessPromises])
              .then(() => {
                // Mostrar mensaje de éxito
                Swal.fire({
                  title: '¡Denuncia Enviada!',
                  html: `
                    <strong>Folio:</strong><span style="color: green;"><strong> ${response.folio}</strong></span><br><br>
                    <strong>Contraseña:</strong><span style="color: green;"> <strong> ${response.password}</strong><br><br></span>
                    <em><span style="color: red;"><strong>IMPORTANTE.</strong><br></span>Recuerda que tu folio y contraseña son únicos. Guárdalos en un lugar seguro. Con este folio y contraseña podrás revisar el estatus de tu denuncia</em>
                  `,
                  icon: 'success',
                  confirmButtonText: 'Cerrar'
                }).then((result) => {
                  if (result.isConfirmed || result.dismiss === Swal.DismissReason.close) {
                    this._router.navigate(['/Inicio']);
                  }
                });
              })
              .catch((error) => {
                console.error('Error al guardar involucrados o testigos:', error);
                Swal.fire({
                  title: '❌ Error',
                  text: 'Hubo un problema al guardar los involucrados o testigos.',
                  icon: 'error',
                  confirmButtonText: 'Reintentar'
                });
              });
          },
          (error) => {
            console.error("Error al guardar el solicitante:", error);
            Swal.fire({
              title: '❌ Error',
              text: 'Hubo un problema al guardar el solicitante.',
              icon: 'error',
              confirmButtonText: 'Reintentar'
            });
          }
        );
      },
      (error) => {
        console.error('Error al enviar la denuncia:', error);
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
    if (this.customInputValue) {
      // Buscar el índice de la opción seleccionada en la lista de opciones
      const index = this.listboxOptions.indexOf(this.customInputValue);
      return index + 1; // Sumar 1 para evitar IDs de 0
    }
    return 0; // Si no hay sububicación, devolver 0
  }

  onMedioChange() {
    console.log("Medio seleccionado (ID):", this.selectedMedio);
  
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