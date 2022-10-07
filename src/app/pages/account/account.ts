import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Photo } from '@capacitor/camera';

import { ActionSheetController, AlertController } from '@ionic/angular';
import { PhotoService } from 'src/app/services/photo.service';
import { UserDetail, UserService } from 'src/app/services/user.service';



@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
  styleUrls: ['./account.scss'],
})
export class AccountPage implements AfterViewInit {
  username: string;
  userDetail: UserDetail;
  tempPhoto: Photo;

  constructor(
    public alertCtrl: AlertController,
    public router: Router,
    public userService: UserService,
    public photoService: PhotoService,
    public actionSheetController: ActionSheetController
  ) {
    this.userDetail = {
      id: null,
      usercode: null,
      username: null,
      email: null,
      avatar: null,
      gender: null,
    }
  }

  ngAfterViewInit() {
    this.userService.setToken()
      .then(() => {
        this.loadUserDetail()
      })
  }

  loadUserDetail() {
    this.userService.getUserInfo()
      .then(resp => {
        this.username = resp.data["membername"]
        this.userDetail.id = resp.data["eid"];
        this.userDetail.usercode = resp.data["membercode"]
        this.userDetail.username = resp.data["membername"]
        this.userDetail.email = resp.data["email"]
        this.userDetail.avatar = resp.data["avatar"]
        this.userDetail.gender = resp.data["gender"]
      })
  }

  updatePicture() {
    this.handleChooseImage();
  }

  async handleChooseImage() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choose Way',
      buttons: [
        {
          text: 'Camera',
          role: 'confirm',
          handler: async () => {
            this.photoService.takePhoto()
              .then((res) => {
                this.tempPhoto = res;
                this.changeAvatar();
              });
          }
        },
        {
          text: 'Album',
          role: 'confirm',
          handler: async () => {
            this.photoService.pickPhoto()
              .then((res) => {
                this.tempPhoto = {
                  webPath: res,
                  saved: false,
                  format: 'png'
                };
                this.changeAvatar();
              });
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    actionSheet.present();
  }

  async changeUsername() {
    const alert = await this.alertCtrl.create({
      header: 'Change Username',
      buttons: [
        'Cancel',
        {
          text: 'Ok',
          handler: (data: any) => {
            this.userService.updateUserInfo(this.userDetail.id, { membername: data.username })
              .then(() => {
                this.loadUserDetail();
              })
          }
        }
      ],
      inputs: [
        {
          type: 'text',
          name: 'username',
          value: this.username,
          placeholder: 'username'
        }
      ]
    });
    await alert.present();
  }

  async changeAvatar() {
    let base64Data = null;
    if (this.tempPhoto.webPath.match("data:image/jpeg;base64")) {
      base64Data = this.tempPhoto.webPath;
    } else {
      base64Data = await this.photoService.readAsBase64(this.tempPhoto);
    }
    base64Data = base64Data.split("base64,")[1]
    const fileName = new Date().getTime() + '.jpeg';
    this.photoService.uploadPhotoToMinio({
      filename: fileName,
      format: "jpeg",
      imageData: base64Data
    })
      .then(res => {
        console.log("321", res);
        this.userService.updateUserInfo(this.userDetail.id, { avatar: res['url'] })
          .then(() => { this.loadUserDetail(); });
      })
      .catch(e => {
        alert(e)
      });
  }

  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Change Password',
      buttons: [
        'Cancel',
        {
          text: 'Ok',
          handler: (data: any) => {
            this.userService.updateUserInfo(this.userDetail.id, { password: data.password })
              .then(() => {
                this.loadUserDetail();
              })
          }
        }
      ],
      inputs: [
        {
          type: 'text',
          name: 'password',
          value: "",
          placeholder: 'password'
        }
      ]
    });
    await alert.present();
  }

  logout() {
    this.userService.logout();
    this.router.navigateByUrl('/app/tabs/tab2');
  }
}
