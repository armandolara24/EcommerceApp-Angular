import { Component, Inject, OnInit } from '@angular/core';
import { OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';
//import { OktaAuthService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  storage: Storage = sessionStorage;
  isAuthenticated: boolean = false;
  userFullName: string;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth, private oktaAuthStateService: OktaAuthStateService ) { }

  ngOnInit(): void {

    
    this.oktaAuthStateService.authState$.subscribe(
      (result) => {
        this.isAuthenticated = result.isAuthenticated!;
        this.getUserDetails();
      }
    );
    

  }

  getUserDetails() {
    if (this.isAuthenticated) {

      // Fetch the logged in user details (user's claims)
      //
      // user full name is exposed as a property name
      this.oktaAuth.getUser().then(
        (res) => {
          this.userFullName = res.name!;

          // retrieve the user's email from authentication response
          const userEmail = res.email;

          // now store the email in browser storage
          this.storage.setItem('userEmail', JSON.stringify(userEmail));
        }
      );
    }
  }

  logout() {
    // Terminates the session with Okta and removes current tokens.
    this.oktaAuth.signOut();
  }
}
