import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { FileUploadModule } from 'ng2-file-upload';
import { CoreCommonModule } from '@core/common.module';
import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { FormWizardComponent } from 'app/main/forms/form-wizard/form-wizard.component';

const routes: Routes = [
  {
    path: 'form-wizard',
    component: FormWizardComponent,
    data: { animation: 'wizard' }
  }
];

@NgModule({
  declarations: [
    FormWizardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    NgSelectModule,
    FileUploadModule,
    CoreCommonModule,
    CoreDirectivesModule,
    CardSnippetModule,
    ContentHeaderModule
  ],
  exports: [
    FormWizardComponent
  ]
})
export class FormWizardModule { }