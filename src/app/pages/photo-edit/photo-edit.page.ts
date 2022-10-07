import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActionSheetController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { IonDatetime, AlertController } from '@ionic/angular';

import { PhotoService, UserPhoto } from 'src/app/services/photo.service';
import { Photo } from '@capacitor/camera';

@Component({
  selector: 'app-photo-edit',
  templateUrl: './photo-edit.page.html',
  styleUrls: ['./photo-edit.page.scss'],
})
export class PhotoEditPage implements OnInit {

  photo: UserPhoto | undefined;
  tempPhoto: Photo | undefined;
  editMode: String | undefined;
  curDate: String | undefined;
  minDate: String | undefined;
  maxDate: String | undefined;
  pickMode: String | undefined;
  showPicker: Boolean | undefined = false;
  debug: Boolean | undefined = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private photoService: PhotoService,
    public actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private router: Router,
  ) { }

  async ngOnInit() {
    await this.getPhoto();
    if (this.photo.createTime == null) {
      this.photo.createTime = new Date().toISOString();
    }
    if (this.photo.updateTime == null) {
      this.photo.updateTime = new Date().toISOString();
    }
    this.curDate = new Date().toISOString();
    this.maxDate = new Date().toISOString();
  }

  public goBack() {
    this.location.back();
  }

  async getPhoto() {
    const id = this.route.snapshot.paramMap.get('id');
    this.editMode = id == "0" ? 'add' : 'edit';
    if (this.editMode == 'edit') {
      this.photo = await this.photoService.getPhotoById(id);
    } else if (this.editMode == 'add') {
      this.photo = {
        filepath: null,
        webviewPath: null,
        name: null,
        createTime: null,
        updateTime: null,
        count: 0,
        code: null,
        isVisible: 1,
      };
    }
  }

  handlePickDate(mode: string) {
    this.showPicker = true;
    this.pickMode = mode;
    if (this.pickMode == "CREATE") {
      this.curDate = this.photo.createTime;
      this.minDate = undefined;
      this.maxDate = this.photo.updateTime;
    } else if (this.pickMode == "UPDATE") {
      this.minDate = this.photo.createTime;
      this.curDate = this.photo.updateTime;
      this.maxDate = new Date().toISOString();
    }
  }

  handleCancelPick() {
    this.showPicker = false;
  }

  async handleAddOrUpdate() {
    if (this.photo.name == null || this.photo.name == "") {
      const alert = await this.alertController.create({
        header: 'Name is Empty',
        buttons: ['OK'],
      });
      await alert.present();
      return
    }
    if (this.photo.webviewPath == null || this.photo.webviewPath == "") {
      const alert = await this.alertController.create({
        header: 'Image is Empty',
        buttons: ['OK'],
      });
      await alert.present();
      return
    }
    try {
      if (this.editMode == "edit") {
        this.photoService.updatePicture(this.photo);
      } else if (this.editMode == "add") {
        this.photoService.addNewToGallery(this.photo, this.tempPhoto);
      }
    } catch (e) {
      this.photo.webviewPath = e.toString();
    }
    this.router.navigate(["/app/tabs/tab2"])
  }

  async handleChooseImage() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choose Way',
      buttons: [
        {
          text: 'Camera',
          role: 'confirm',
          handler: async () => {
            this.tempPhoto = await this.photoService.takePhoto();
            if (this.tempPhoto != null) {
              this.photo.webviewPath = this.tempPhoto.webPath;
            }
          }
        },
        {
          text: 'Album',
          role: 'confirm',
          handler: async () => {
            const temp = await this.photoService.pickPhoto();
            if (temp != null) {
              this.photo.webviewPath = temp;
              this.tempPhoto = {
                webPath: temp,
                saved: false,
                format: 'png'
              };
            }
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

  async setCurDate(dateComponet: IonDatetime) {
    await dateComponet.confirm();
    if (this.pickMode == "CREATE") {
      this.photo.createTime = dateComponet.value.toString();
    } else if (this.pickMode == "UPDATE") {
      this.photo.updateTime = dateComponet.value.toString();
    }
    this.showPicker = false
  }

}
