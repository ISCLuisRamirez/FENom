import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountSettingsComponent } from './account-settings.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AccountSettingsComponent],  // Declara el componente en este módulo
  imports: [
    CommonModule,   // Importa CommonModule para que las directivas comunes de Angular funcionen
    RouterModule    // Importa RouterModule para el enrutamiento si usas [routerLink] en el HTML
  ],
  exports: [AccountSettingsComponent]  // Expon el componente si deseas usarlo fuera de este módulo
})
export class AccountSettingsModule {}
