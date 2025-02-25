import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CoreCommonModule } from '@core/common.module';

import { ComingSoonComponent } from 'app/main/pages/miscellaneous/coming-soon/coming-soon.component';
import { ErrorComponent } from 'app/main/pages/miscellaneous/error/error.component';
import { MaintenanceComponent } from 'app/main/pages/miscellaneous/maintenance/maintenance.component';
import { NotAuthorizedComponent } from 'app/main/pages/miscellaneous/not-authorized/not-authorized.component';
import { FinalIndexComponent } from 'app/main/pages/miscellaneous/final-index/final-index.component';
import { PoliciesComponent } from 'app/main/pages/miscellaneous/policies/policies.component';

// routing
const routes: Routes = [
  {
    path: 'miscellaneous/coming-soon',
    component: ComingSoonComponent
  },
  {
    path: 'miscellaneous/not-authorized',
    component: NotAuthorizedComponent
  },
  {
    path: 'miscellaneous/maintenance',
    component: MaintenanceComponent
  },
  {
    path: 'miscellaneous/error',
    component: ErrorComponent
  },
  {
    path: 'miscellaneous/final-index',
    component: FinalIndexComponent
  },
  {
    path: 'miscellaneous/policies',
    component: PoliciesComponent
  }
];

@NgModule({
  declarations: [ComingSoonComponent, NotAuthorizedComponent, MaintenanceComponent, ErrorComponent, FinalIndexComponent, PoliciesComponent],
  imports: [CommonModule, RouterModule.forChild(routes), CoreCommonModule]
})
export class MiscellaneousModule {}
