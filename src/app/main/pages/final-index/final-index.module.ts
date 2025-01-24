import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CoreCommonModule } from '@core/common.module';

import { FinalIndexComponent } from 'app/main/pages/miscellaneous/final-index/final-index.component';

// routing
const routes: Routes = [
  {
    path: 'pages/final-index',
    component: FinalIndexComponent
  }
];

@NgModule({
  declarations: [FinalIndexComponent],
  imports: [CommonModule, RouterModule.forChild(routes), CoreCommonModule]
})
export class FinalIndexModule {}
