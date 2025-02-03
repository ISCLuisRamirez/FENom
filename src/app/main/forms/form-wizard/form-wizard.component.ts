import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { ApiService } from 'app/services/api.service';
import Stepper from 'bs-stepper';

const URL = 'http://localhost:5101'; // Cambia esta URL por tu endpoint.

@Component({
  selector: 'app-form-wizard',
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormWizardComponent implements OnInit {
  // Variables públicas
  public contentHeader: object; // Configuración del encabezado
  public TDNameVar = ''; // Nombre
  public TDEmailVar = ''; // Correo
  public TDFirstNameVar = ''; // Primer nombre
  public TDLastNameVar = ''; // Apellido
  public twitterVar = ''; // Twitter
  public facebookVar = ''; // Facebook
  public googleVar = ''; // Google
  public linkedinVar = ''; // LinkedIn
  public landmarkVar = ''; // Punto de referencia
  public addressVar = ''; // Dirección
  public approximateDatePeriod = ''; // Periodo aproximado
  public specificDate: string = ''; // Fecha específica
  public today: string; // Fecha actual para restringir fechas futuras
  public datereport: string = ''; // Tipo de fecha seleccionada
  public descriptionVar: string = ''; // Descripción
  public previousReport: string = ''; // Reporte previo
  public previousReportDetails: string = ''; // Detalles del reporte previo
  public hasAnotherDropZoneOver = false; // Zona de drop secundaria
  public hasBaseDropZoneOver = false; // Zona de drop principal

  public uploader: FileUploader = new FileUploader({
    url: URL,
    isHTML5: true,
    allowedFileType: ['image', 'pdf', 'doc', 'docx'], // Tipos de archivos permitidos
    maxFileSize: 10 * 1024 * 1024 // Tamaño máximo permitido: 10 MB
  });

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

  public selectMultiSelected: any; // Motivo seleccionado
  public isCapturista = true; // Indica si es cliente
  public isLoggedIn = true; // Indica si está autenticado
  public selectedFiles: FileItem[] = []; // Archivos seleccionados
  public involvedList = [{ name: '', position: '', employeeNumber: '' }]; // Lista de involucrados
  public witnessList = []; // Lista de testigos
  public datos=[];

  public showAdditionalInfo = false; // Mostrar información adicional
  public showListbox = false; // Mostrar lista desplegable
  public showInputBox = false; // Mostrar caja de texto
  public listboxOptions: string[] = []; // Opciones dinámicas
  public customInputValue = ''; // Valor personalizado
  public dynamicLabel = ''; // Etiqueta dinámica

  // Variables privadas
  private verticalWizardStepper: Stepper;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarDatos();
    
   // Inicializar el Stepper
    this.verticalWizardStepper = new Stepper(document.querySelector('#stepper2'), {
      linear: false,
      animation: true
    });

    // Configurar fecha actual
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];

    // Configurar encabezado
    this.contentHeader = {
      headerTitle: 'Crea tu denuncia',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          { name: 'Inicio', isLink: true, link: '/' },
          { name: 'Crear Denuncia', isLink: true, link: '/crear-denuncia' },
          { name: 'Formulario', isLink: false }
        ]
      }
    };

    // Configurar uploader
    this.configureUploader();
  }

  configureUploader() {
    // Configurar eventos del uploader
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false; // Evitar envío de credenciales CORS
      this.selectedFiles = this.uploader.queue;
      console.log('Archivo agregado:', file.file.name);
    };

    this.uploader.onProgressAll = (progress) => {
      console.log(`Progreso total: ${progress}%`);
    };

    this.uploader.onCompleteItem = (item, response, status) => {
      console.log(`Archivo subido: ${item.file.name}, Estado: ${status}`);
    };

    this.uploader.onCompleteAll = () => {
      console.log('Todos los archivos han sido subidos.');
      alert('Todos los archivos han sido subidos correctamente.');
    };

    this.uploader.onWhenAddingFileFailed = (item, filter) => {
      if (filter.name === 'fileSize') {
        alert('El archivo excede el tamaño máximo permitido de 10 MB.');
      } else if (filter.name === 'fileType') {
        alert('El tipo de archivo no es permitido.');
      } else {
        alert('Error desconocido al agregar el archivo.');
      }
    };
  }

  cargarDatos() {
    this.apiService.getRoles().subscribe(
      (response) => {
        this.datos = response;
        console.log('Datos recibidos:', this.datos);
      },
      (error) => {
        console.error('Error al obtener datos', error);
      }
    );
  }

  fileOverBase(e: boolean): void {
    this.hasBaseDropZoneOver = e;
  }

  fileOverAnother(e: boolean): void {
    this.hasAnotherDropZoneOver = e;
  }

  verticalWizardNext() {
    this.verticalWizardStepper.next();
  }

  verticalWizardPrevious() {
    this.verticalWizardStepper.previous();
  }

  addInvolved() {
    this.involvedList.push({ name: '', position: '', employeeNumber: '' });
  }

  removeInvolved() {
    if (this.involvedList.length > 1) {
      this.involvedList.pop();
    }
  }

  addWitness() {
    this.witnessList.push({ name: '', contact: '' });
  }

  removeWitness() {
    if (this.witnessList.length > 0) {
      this.witnessList.pop();
    }
  }

  toggleAnonimato(show: boolean) {
    this.showAdditionalInfo = show;
  }

  onUbicacionChange(ubicacion: string): void {
    this.resetDynamicFields();

    if (['corporativo', 'cedis', 'innomex', 'trate'].includes(ubicacion)) {
      this.showListbox = true;
      this.listboxOptions = this.getListboxOptions(ubicacion);
      this.dynamicLabel = `Seleccione una opción de ${ubicacion}`;
    }

    if (ubicacion === 'sucursales') {
      this.showInputBox = true;
      this.dynamicLabel = 'Introduzca el número de sucursal...';
    } else if (ubicacion === 'navesAnexas') {
      this.showInputBox = true;
      this.dynamicLabel = 'Introduzca el nombre de la nave o anexo filial...';
    } else if (ubicacion === 'unidadTransporte') {
      this.showInputBox = true;
      this.dynamicLabel = 'Introduzca el número de la unidad de transporte...';
    }
  }

  getListboxOptions(ubicacion: string): string[] {
    const options = {
      corporativo: ['Podium', 'Mar Báltico', 'Pedro Loza', 'Oficinas de RRHH MTY'],
      cedis: ['Occidente', 'Noreste', 'Centro'],
      innomex: ['Embotelladora', 'Dispositivos Médicos'],
      trate: ['Occidente', 'Noreste', 'Centro', 'CDA Villahermosa', 'CDA Mérida', 'CDA Chihuahua']
    };
    return options[ubicacion] || [];
  }

  resetDynamicFields(): void {
    this.showListbox = false;
    this.showInputBox = false;
    this.listboxOptions = [];
    this.customInputValue = '';
    this.dynamicLabel
     = '';
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      files.forEach((file) => {
        // Crear un objeto FileItem manualmente y añadirlo a la cola
        const fileItem = this.uploader.addToQueue([file]);
        console.log('Archivo añadido a la cola:', file.name);
      });
    }
  }
  
  getLocationId(): number {
    switch (this.customInputValue.toLowerCase()) {
      case 'corporativo': return 1;
      case 'cedis': return 2;
      case 'sucursales': return 3;
      case 'naves anexas': return 4;
      case 'innomex': return 5;
      case 'trate': return 6;
      case 'unidad transporte': return 7;
      default: return 0; // Valor por defecto si no se selecciona nada
    }
  }
  
  getSubLocationId(): number {
    return this.listboxOptions.indexOf(this.customInputValue) + 1 || 0;
  }
  

  onSubmit() {
    if (this.specificDate && this.specificDate > this.today) {
      alert('La fecha seleccionada no puede ser en el futuro.');
      return;
    }
  
    // Generar folio único (simplemente como ejemplo)
    const folio = 'FOLIO-' + Math.floor(Math.random() * 1000000);
  
    // Contraseña para el seguimiento (opcional, puedes mejorar esta lógica)
    const password = Math.random().toString(36).slice(-8);
  
    // Adaptación de los datos para el backend
    const denunciaData = {
      id_requesters: this.isLoggedIn ? 1 : 0,  // Suponiendo que obtienes este ID al iniciar sesión
      id_reason: this.selectMultiSelected?.id || 0, // Debes tener el ID del motivo
      id_location: this.getLocationId(), // Método para obtener ID de la ubicación
      id_sublocation: this.getSubLocationId(), // ID de sububicación si aplica
      date: this.specificDate || this.today, // Fecha de la denuncia
      file: this.selectedFiles.length > 0 ? this.selectedFiles[0].file.name : '', // Nombre del primer archivo subido
      folio: folio,
      password: password,
      status: 1 // Suponiendo que 1 es "pendiente" o "nuevo"
    };
  
    // Envío de la denuncia al backend
    this.apiService.enviarDenuncia(denunciaData).subscribe(
      (response) => {
        alert(`Denuncia enviada correctamente. Folio: ${folio}`);
        console.log('Respuesta del servidor:', response);
      },
      (error) => {
        alert('Error al enviar la denuncia.');
        console.error('Error en el envío:', error);
      }
    );
  }
  
}
