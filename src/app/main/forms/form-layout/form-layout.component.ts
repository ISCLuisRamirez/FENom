import { Component, OnInit } from '@angular/core';
import * as snippet from 'app/main/forms/form-layout/form-layout.snippetcode';

@Component({
  selector: 'app-form-layout',
  templateUrl: './form-layout.component.html'
})

export class FormLayoutComponent implements OnInit {

  // public
  public contentHeader: object;

  public _snippetCodeHorizontal = snippet.snippetCodeHorizontal;
  public _snippetCodeIcons = snippet.snippetCodeIcons;
  public _snippetCodeVertical = snippet.snippetCodeVertical;
  public _snippetCodeVertiacalIcons = snippet.snippetCodeVertiacalIcons;
  public _snippetCodeMultiple = snippet.snippetCodeMultiple;

  constructor() {}


  ngOnInit() {
    // content header
    this.contentHeader = {
      headerTitle: 'Crear Denuncia',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Inicio',
            isLink: true,
            link: '/'
          },
          {
            name: 'Crear Denuncia',
            isLink: true,
            link: '/'
          },
          {
            name: 'Form Den',
            isLink: false
          }
        ]
      }
    };
  }
}
