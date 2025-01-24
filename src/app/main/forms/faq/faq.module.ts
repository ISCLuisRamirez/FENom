import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';  // Agregado para ngb-accordion
import { NgSelectModule } from '@ng-select/ng-select';

import { CoreCommonModule } from '@core/common.module';
import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { CoreDirectivesModule } from '@core/directives/directives';

import { FaqComponent } from 'app/main/forms/faq/faq.component';

const routes: Routes = [
  {
    path: 'faq',
    component: FaqComponent,
    data: { animation: 'faq' }  // Se ha añadido un nombre de animación (opcional)
  }
];

@NgModule({
  declarations: [FaqComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreCommonModule,
    ContentHeaderModule,
    CardSnippetModule,
    FormsModule,
    CoreDirectivesModule,
    NgSelectModule,
    NgbModule  // Asegúrate de incluir este módulo para usar ngb-accordion
  ]
})
export class FaqModule {}
