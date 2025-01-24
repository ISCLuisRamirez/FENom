import { Component, OnInit } from '@angular/core';

// Servicio no relacionado con autenticación ni estadísticas
import { DashboardService } from 'app/main/dashboard/dashboard.service';

@Component({
  selector: 'app-ecommerce',
  templateUrl: './ecommerce.component.html',
  styleUrls: ['./ecommerce.component.scss'],
})
export class EcommerceComponent implements OnInit {
  // Public
  public data: any;

  // Constructor
  constructor(private _dashboardService: DashboardService) {}

  // Lifecycle Hooks
  ngOnInit(): void {
    // Obtener los datos del servicio de dashboard
    this._dashboardService.onApiDataChanged.subscribe((response) => {
      this.data = response;
    });
  }
}
