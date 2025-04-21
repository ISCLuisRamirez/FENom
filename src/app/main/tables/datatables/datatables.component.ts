import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Location } from '@angular/common';
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

  private _unsubscribeAll: Subject<any> = new Subject();
  private tempData: any[] = [];
  
  filteredRows = [];
  tableLimit = 10;
  currentPage = 1;
  totalRecords = 0;
  totalPages = 0;

  filters = {
    Pagina: this.currentPage,
    TamanoPagina: this.tableLimit,
    IdReason: null,
    IdLocation: null,
    IdSublocation: null,
    FechaDesde: null,
    FechaHasta: null,
    Status: null,
    Folio: '',
    OrdenarPor: 'id',
    OrdenDesc: false
  };
  
  public rows: any[] = [];
  public kitchenSinkRows: any[] = [];
  public selected: any[] = [];
  public chkBoxSelected: any[] = [];
  public exportCSVData: any;
  public basicSelectedOption: string | number = '10';
  public selectedStatus: string = '';
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;
  public editingName: any = {};
  public editingStatus: any = {};
  public editingAge: any = {};
  public editingSalary: any = {};
  public expanded: any = {};
  public contentHeader: object;
  public _snippetCodeKitchenSink = snippet.snippetCodeKitchenSink;
  public _snippetCodeInlineEditing = snippet.snippetCodeInlineEditing;
  public _snippetCodeRowDetails = snippet.snippetCodeRowDetails;
  public _snippetCodeCustomCheckbox = snippet.snippetCodeCustomCheckbox;
  public _snippetCodeResponsive = snippet.snippetCodeResponsive;
  public _snippetCodeMultilangual = snippet.snippetCodeMultilangual;
  Math = Math;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;

  constructor(
    private _datatablesService: DatatablesService,
    private _coreTranslationService: CoreTranslationService,
    public location: Location
  ) {
    this._coreTranslationService.translate(english, french, german, portuguese);
  }

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.filters.Pagina = this.currentPage;
    this.filters.TamanoPagina = this.tableLimit;

    this._datatablesService.getRequests(this.filters).subscribe(response => {
      this.filteredRows = response.datos;
      this.totalRecords = response.totalRegistros;
      this.totalPages = response.TotalPaginas;
    });
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

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadRequests();
  }

  onLimitChange() {
    this.currentPage = 1;
    this.loadRequests();
  }
  
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

 
  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(d => {
      return (
        (d.full_name && d.full_name.toLowerCase().includes(val)) ||
        (d.folio && d.folio.toString().toLowerCase().includes(val)) ||
        !val
      );
    });

    this.kitchenSinkRows = temp;
    if (this.table) this.table.offset = 0;
    this.filterByStatus();
  }


  filterByStatus() {
    if (this.selectedStatus) {
      this.filteredRows = this.kitchenSinkRows.filter(row => row.status == this.selectedStatus);
    } else {
      this.filteredRows = [...this.kitchenSinkRows];
    }

    if (this.table) this.table.offset = 0;

    if (this.basicSelectedOption === 'all') {
      this.tableLimit = this.filteredRows.length;
    }
  }

  rowDetailsToggleExpand(row) {
    this.tableRowDetails.rowDetail.toggleExpandRow(row);
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event) {
  }

  customChkboxOnSelect({ selected }) {
    this.chkBoxSelected.splice(0, this.chkBoxSelected.length);
    this.chkBoxSelected.push(...selected);
  }


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
  onFilterChange() {
    this.currentPage = 1;
    this.loadRequests();
  }  
}
