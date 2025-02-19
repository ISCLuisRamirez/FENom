import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { CoreTranslationService } from '@core/services/translation.service';
import { locale as german } from 'app/main/tables/datatables/i18n/de';
import { locale as english } from 'app/main/tables/datatables/i18n/en';
import { locale as french } from 'app/main/tables/datatables/i18n/fr';
import { locale as portuguese } from 'app/main/tables/datatables/i18n/pt';

import * as snippet from 'app/main/tables/datatables/datatables.snippetcode';
import { DatatablesService } from 'app/main/tables/datatables/datatables.service';

@Component({
  selector: 'app-datatables',
  templateUrl: './datatables.component.html',
  styleUrls: ['./datatables.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatablesComponent implements OnInit, OnDestroy {
  // ------------------------------------------------
  // 1) Variables de control y de datos
  // ------------------------------------------------

  private _unsubscribeAll: Subject<any> = new Subject();
  private tempData: any[] = [];

  public rows: any[] = [];
  public kitchenSinkRows: any[] = [];
  public filteredRows: any[] = [];
  public selected: any[] = [];
  public chkBoxSelected: any[] = [];
  public exportCSVData: any;

  // Control para la opción seleccionada en el dropdown (10, 25, 50, 100 o 'all')
  public basicSelectedOption: string | number = '10';

  // Este será el límite REAL que usará ngx-datatable
  public tableLimit: number = 10;

  // Filtro por estatus
  public selectedStatus: string = '';

  // ngx-datatable config
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;
  public editingName: any = {};
  public editingStatus: any = {};
  public editingAge: any = {};
  public editingSalary: any = {};
  public expanded: any = {};

  public contentHeader: object;

  // Snippet code
  public _snippetCodeKitchenSink = snippet.snippetCodeKitchenSink;
  public _snippetCodeInlineEditing = snippet.snippetCodeInlineEditing;
  public _snippetCodeRowDetails = snippet.snippetCodeRowDetails;
  public _snippetCodeCustomCheckbox = snippet.snippetCodeCustomCheckbox;
  public _snippetCodeResponsive = snippet.snippetCodeResponsive;
  public _snippetCodeMultilangual = snippet.snippetCodeMultilangual;

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;

  constructor(
    private _datatablesService: DatatablesService,
    private _coreTranslationService: CoreTranslationService
  ) {
    this._coreTranslationService.translate(english, french, german, portuguese);
  }

  // ------------------------------------------------
  // 2) Ciclo de vida
  // ------------------------------------------------
  ngOnInit() {
    // Suscribirse para obtener los datos
    this._datatablesService.onDatatablessChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(response => {
        this.rows = response.datos;
        this.tempData = [...this.rows];
        this.kitchenSinkRows = [...this.rows];
        this.filteredRows = [...this.kitchenSinkRows];
        this.exportCSVData = [...this.rows];
      });

    // Configuración de encabezado
    this.contentHeader = {
      headerTitle: 'Datatables',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          { name: 'Home', isLink: true, link: '/' },
          { name: 'Forms & Tables', isLink: true, link: '/' },
          { name: 'Datatables', isLink: false }
        ]
      }
    };
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // ------------------------------------------------
  // 3) Manejo de la paginación y la tabla
  // ------------------------------------------------

  /**
   * Se llama cuando el usuario cambia la opción en el <select> (10, 25, 50, 100 o 'all')
   */
  onLimitChange() {
    if (this.basicSelectedOption === 'all') {
      // Si el usuario selecciona "Todos"
      this.tableLimit = this.filteredRows.length; // Mostramos todas las filas en una sola página
    } else {
      // Convertimos la cadena a número (por ej. '10' -> 10)
      this.tableLimit = +this.basicSelectedOption;
    }

    // Reiniciamos la paginación a la primera página
    if (this.table) {
      this.table.offset = 0;
    }
  }

  /**
   * Filtra las filas según el texto ingresado (folio o nombre)
   */
  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(d => {
      // Ajusta los campos según tu data (folio, full_name, etc.)
      return (
        (d.full_name && d.full_name.toLowerCase().includes(val)) ||
        (d.folio && d.folio.toString().toLowerCase().includes(val)) ||
        !val
      );
    });

    this.kitchenSinkRows = temp;
    if (this.table) this.table.offset = 0;
    // Volvemos a filtrar por estatus
    this.filterByStatus();
  }

  /**
   * Filtra las filas por estatus (1, 2, 3) o muestra todas si no hay estatus seleccionado
   */
  filterByStatus() {
    if (this.selectedStatus) {
      this.filteredRows = this.kitchenSinkRows.filter(row => row.status == this.selectedStatus);
    } else {
      this.filteredRows = [...this.kitchenSinkRows];
    }
    // Reiniciamos la paginación
    if (this.table) this.table.offset = 0;

    // Si estamos en "Todos", actualiza tableLimit para mostrar todo
    if (this.basicSelectedOption === 'all') {
      this.tableLimit = this.filteredRows.length;
    }
  }

  // ------------------------------------------------
  // 4) Eventos de la tabla
  // ------------------------------------------------
  rowDetailsToggleExpand(row) {
    this.tableRowDetails.rowDetail.toggleExpandRow(row);
  }

  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event) {
    // console.log('Activate Event', event);
  }

  customChkboxOnSelect({ selected }) {
    this.chkBoxSelected.splice(0, this.chkBoxSelected.length);
    this.chkBoxSelected.push(...selected);
  }

  // ------------------------------------------------
  // 5) Inline editing (opcional)
  // ------------------------------------------------
  inlineEditingUpdateName(event, cell, rowIndex) {
    this.editingName[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  inlineEditingUpdateAge(event, cell, rowIndex) {
    this.editingAge[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  inlineEditingUpdateSalary(event, cell, rowIndex) {
    this.editingSalary[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  inlineEditingUpdateStatus(event, cell, rowIndex) {
    this.editingStatus[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }
}
