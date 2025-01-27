import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import Stepper from 'bs-stepper';

@Component({
  selector: 'app-form-wizard',
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FormWizardComponent implements OnInit {
  // Public Variables
  public contentHeader: object;
  public TDNameVar: string;
  public TDEmailVar: string;
  public TDFirstNameVar: string;
  public TDLastNameVar: string;
  public twitterVar: string;
  public facebookVar: string;
  public googleVar: string;
  public linkedinVar: string;
  public landmarkVar: string;
  public addressVar: string;
  public approximateDatePeriod: string = '';
  public specificDate: any;
  public datereport: string = '';
  public descriptionVar: string; // Variable para la descripción del incidente
  public previousReport: string; // Indica si el incidente fue reportado previamente ('si' o 'no')
  public previousReportDetails: string; // Detalles del reporte previo

  public selectBasic = [
    { name: 'Teléfono' },
    { name: 'Correo' },
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
    { name: 'Fraude Financiero (Malversación de fondos, falsificación de registros, prácticas contables inadecuadas)' },
  ];

  public selectMultiSelected: any; // Variable para almacenar la selección de motivos
  public isClient: boolean = true; // Indica si el cliente está habilitado
  public isLoggedIn: boolean = true; // Indica si el usuario está logueado
  public selectedFiles: File[] = []; // Archivos seleccionados por el usuario

  public involvedList = [
    { name: '', position: '', employeeNumber: '' }, // Estructura inicial
  ];

  public witnessList = []; // Lista de testigos (opcional)

  public showAdditionalInfo: boolean = false; // Controla la visibilidad de los campos de "Información Adicional"

  // Private Variables
  private verticalWizardStepper: Stepper;

  constructor() {}

  /**
   * Avanza al siguiente paso del Vertical Wizard
   */
  verticalWizardNext() {
    this.verticalWizardStepper.next();
  }

  /**
   * Regresa al paso anterior del Vertical Wizard
   */
  verticalWizardPrevious() {
    this.verticalWizardStepper.previous();
  }

  /**
   * Añade un nuevo involucrado
   */
  addInvolved() {
    this.involvedList.push({ name: '', position: '', employeeNumber: '' });
  }

  /**
   * Elimina un involucrado si hay más de uno
   */
  removeInvolved() {
    if (this.involvedList.length > 1) {
      this.involvedList.pop();
    }
  }

  /**
   * Añade un nuevo testigo
   */
  addWitness() {
    this.witnessList.push({ name: '', contact: '' });
  }

  /**
   * Elimina un testigo
   */
  removeWitness() {
    if (this.witnessList.length > 0) {
      this.witnessList.pop();
    }
  }

  /**
   * Controla el cambio de estado de anonimato
   * @param show Si es verdadero, muestra los campos adicionales
   */
  toggleAnonimato(show: boolean) {
    this.showAdditionalInfo = show;
  }

  /**
   * Maneja los archivos seleccionados por el usuario
   */
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      console.log('Archivos seleccionados:', this.selectedFiles);
    }
  }

  /**
   * Lógica al enviar el formulario
   */
  onSubmit() {
    alert(
      'Su formulario se ha enviado exitosamente su folio es: ###### y su contraseña dinámica es: ************ IMPORTANTE! Favor de no perder su contraseña ni su folio ya que no existe un método de recuperación'
    );
    console.log('Descripción:', this.descriptionVar);
    console.log('Reporte Previo:', this.previousReport);
    console.log('Detalles del Reporte Previo:', this.previousReportDetails);
    console.log('Archivos Subidos:', this.selectedFiles);
    console.log('Involucrados:', this.involvedList);
    console.log('Testigos:', this.witnessList);
    console.log('Información Adicional Visible:', this.showAdditionalInfo);
  }

  /**
   * Inicializa el contenido del encabezado y los steppers
   */
  ngOnInit() {
    // Inicialización del Vertical Wizard
    this.verticalWizardStepper = new Stepper(document.querySelector('#stepper2'), {
      linear: false,
      animation: true,
    });

    // Configuración del contenido del encabezado
    this.contentHeader = {
      headerTitle: 'Crea tu denuncia',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          { name: 'Inicio', isLink: true, link: '/' },
          { name: 'Crear Denuncia', isLink: true, link: '/crear-denuncia' },
          { name: 'Formulario', isLink: false },
        ],
      },
    };
  }
}
