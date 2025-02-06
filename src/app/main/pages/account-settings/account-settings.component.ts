import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/auth/service';
import { User } from 'app/auth/models';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  // Public properties
  public currentUser: User;
  public isComite: boolean;
  public isCapturista: boolean;

  constructor(private _authenticationService: AuthenticationService) {
    // Subscribe to current user changes
    this._authenticationService.currentUser$.subscribe(x => (this.currentUser = x));
    this.isComite = this._authenticationService.isComite;
    this.isCapturista = this._authenticationService.isCapturista;
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }
}
