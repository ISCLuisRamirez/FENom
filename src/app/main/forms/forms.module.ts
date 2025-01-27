import { NgModule } from '@angular/core';

import { FormRepeaterModule } from 'app/main/forms/form-repeater/form-repeater.module';
import { FormElementsModule } from 'app/main/forms/form-elements/form-elements.module';
import { FormLayoutModule } from 'app/main/forms/form-layout/form-layout.module';
import { FormValidationModule } from 'app/main/forms/form-validation/form-validation.module';
import { FormWizardModule } from 'app/main/forms/form-wizard/form-wizard.module';
import { FaqModule } from 'app/main/forms/faq/faq.module';

@NgModule({
  declarations: [],
  imports: [
    FaqModule,
    FormElementsModule,
    FormLayoutModule,
    FormWizardModule, // Importa el módulo corregido del FormWizard
    FormValidationModule,
    FormRepeaterModule
  ]
})
export class FormsModule {}
