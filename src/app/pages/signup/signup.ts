import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { RestResponse } from 'src/app/interfaces/rest-response';

import { UserService, UserOptions } from 'src/app/services/user.service';



@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
  styleUrls: ['./signup.scss'],
})
export class SignupPage {
  signup: UserOptions = { username: '', password: '' };
  submitted = false;
  constructor(
    private router: Router,
    private userService: UserService,
    private toastController: ToastController
  ) { }

  async onSignup(form: NgForm) {
    this.submitted = true;
    if (form.valid) {
      this.userService.signup(this.signup)
        .then(async (resp: RestResponse) => {
          const toast = await this.toastController.create({
            message: '注册成功',
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
}
