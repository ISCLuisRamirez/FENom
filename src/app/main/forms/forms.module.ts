import { NgModule } from '@angular/core';

import { FormRepeaterModule } from 'app/main/forms/form-repeater/form-repeater.module';
import { FormElementsModule } from 'app/main/forms/form-elements/form-elements.module';
import { FormLayoutModule } from 'app/main/forms/form-layout/form-layout.module';
import { FormValidationModule } from 'app/main/forms/form-validation/form-validation.module';
import { FaqModule } from 'app/main/forms/faq/faq.module';
import { FormWizardModule } from 'app/main/forms/form-wizard/form-wizard.module';
import { FormCaptModule } from 'app/main/forms/form-capt/form-capt.module';

@NgModule({
  declarations: [
  ],
  imports: [
    FaqModule,
    FormElementsModule,
    FormLayoutModule,
    FormCaptModule,
    FormWizardModule, 
    FormValidationModule,
    FormRepeaterModule
  ]
})
export class FormsModule {}
