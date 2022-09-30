import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService, UserOptions } from 'src/app/services/user.service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  login: UserOptions = { username: '', password: '' };
  submitted = false;

  constructor(
    public userService: UserService,
    public router: Router
  ) { }

  onLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.userService.login(this.login.username);
      this.router.navigateByUrl('/app/tabs/tab2');
    }
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}
