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
  public descriptionVar: string;
  public previousReport: string;
  public previousReportDetails: string;

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

  public selectMultiSelected: any;
  public isClient: boolean = true;
  public isLoggedIn: boolean = true;
  public selectedFiles: File[] = [];
  public involvedList = [{ name: '', position: '', employeeNumber: '' }];
  public witnessList = [];

  public showAdditionalInfo: boolean = false;

  public showListbox: boolean = false;
  public showInputBox: boolean = false;
  public listboxOptions: string[] = [];
  public customInputValue: string = '';
  public dynamicLabel: string = ''; // Etiqueta dinámica

  // Private Variables
  private verticalWizardStepper: Stepper;

  constructor() {}

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

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      console.log('Archivos seleccionados:', this.selectedFiles);
    }
  }

  /**
   * Maneja los cambios de ubicación y actualiza las etiquetas dinámicas
   */
  onUbicacionChange(ubicacion: string): void {
    this.resetDynamicFields();

    if (['corporativo', 'cedis', 'innomex', 'trate'].includes(ubicacion)) {
      this.showListbox = true;
      this.listboxOptions = this.getListboxOptions(ubicacion);
      this.dynamicLabel = `Seleccione una opción de ${ubicacion}`;
    }

    if (ubicacion === 'sucursales') {
      this.showInputBox = true;
      this.dynamicLabel = 'Introduzca el número de sucursal... ';
    } else if (ubicacion === 'navesAnexas') {
      this.showInputBox = true;
      this.dynamicLabel = 'Introduzca el nombre de la nave o anexo filial... ';
    } else if (ubicacion === 'unidadTransporte') {
      this.showInputBox = true;
      this.dynamicLabel = 'Introduzca el número de la unidad de transporte... ';
    }
  }

  getListboxOptions(ubicacion: string): string[] {
    const options = {
      corporativo: ['Podium', 'Mar Báltico', 'Pedro Loza', 'Oficinas de RRHH MTY'],
      cedis: ['Occidente', 'Noreste', 'Centro'],
      innomex: ['Embotelladora', 'Dispositivos Médicos'],
      trate: ['Occidente', 'Noreste', 'Centro', 'CDA Villahermosa', 'CDA Mérida', 'CDA Chihuahua'],
    };
    return options[ubicacion] || [];
  }

  resetDynamicFields(): void {
    this.showListbox = false;
    this.showInputBox = false;
    this.listboxOptions = [];
    this.customInputValue = '';
    this.dynamicLabel = '';
  }

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
    console.log('Ubicación seleccionada:', this.customInputValue || this.listboxOptions);
  }

  ngOnInit() {
    this.verticalWizardStepper = new Stepper(document.querySelector('#stepper2'), {
      linear: false,
      animation: true,
    });

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
