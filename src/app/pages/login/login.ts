import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { from } from 'rxjs';
import { RestResponse } from 'src/app/interfaces/rest-response';

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
    public router: Router,
    private toastController: ToastController
  ) { }

  onLogin(form: NgForm) {
    this.submitted = true;
    if (form.valid) {
      this.userService.login(this.login)
        .then(async (resp: RestResponse) => {
          const toast = await this.toastController.create({
            message: '登录成功',
            duration: 1500,
            cssClass: 'warning-toast',
            position: 'top'
          });
          await toast.present();
          this.router.navigateByUrl('/app/tabs/tab2');
        })
        .catch(async e => {
          const toast = await this.toastController.create({
            message: e,
            duration: 1500,
            cssClass: 'warning-toast',
            position: 'top'
          });
          await toast.present();
        })
    }
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}
