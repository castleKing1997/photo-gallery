import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { RestResponse } from 'src/app/interfaces/rest-response';

import { UserService,  UserOptions } from 'src/app/services/user.service';



@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
  styleUrls: ['./signup.scss'],
})
export class SignupPage {
  signup: UserOptions = { username: '', password: '' };
  submitted = false;

  constructor(
    public router: Router,
    public userService: UserService,
  ) {}

  async onSignup(form: NgForm) {
    this.submitted = true;
    if (form.valid) {
      this.userService.signup(this.signup)
      .subscribe((resp: RestResponse) => {
        if (resp.code !== 200) {
          return;
        }
        this.router.navigateByUrl('/app/tabs/tab2');
      })
    }
  }
}
