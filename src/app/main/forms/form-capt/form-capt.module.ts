import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { FileUploadModule } from 'ng2-file-upload';

// Core imports
import { CoreCommonModule } from '@core/common.module';
import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { CoreDirectivesModule } from '@core/directives/directives';

// Layout imports
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

// Component imports
import { FormCaptComponent } from 'app/main/forms/form-capt/form-capt.component';

const routes: Routes = [
  {
    path: 'form-capt',
    component: FormCaptComponent,
    data: { animation: 'wizard' }
  }
];

@NgModule({
  declarations: [
    FormCaptComponent
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
    FormCaptComponent
  ]
})
export class FormCaptModule { }