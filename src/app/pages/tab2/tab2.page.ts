import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PhotoService, UserPhoto } from '../../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  visibleMode: number | undefined = 1;
  sortMode: number | undefined = 0;
  sortAtt: string | undefined = "count";

  constructor(
    public photoService: PhotoService,
    public actionSheetController: ActionSheetController,
    private router: Router,
  ) {}

  async ngOnInit() {

  }

  addPhotoToGallery() {
    this.router.navigate(['/app/tabs/tab2/photo-edit', '0'])
    // this.photoService.addNewToGallery();
  }

  computeVisible(isVisible: number) {
    if (this.visibleMode == -1) {
      return true;
    }
    return this.visibleMode == isVisible;
  }
  
  async handleDelete(photo: UserPhoto) {
    const flag = await this.canDismiss();
    if (flag) {
      this.photoService.deletePicture(photo);
    }
  }

  getDisplayList() {
    return this.photoService.photos.filter(item => this.computeVisible(item.isVisible)).sort(this.sortTypes)
  }

  handleVisible() {
    this.visibleMode = Math.abs(1-this.visibleMode);
  }

  handleSort() {
    this.sortMode = Math.abs(1-this.sortMode);
  }

  sortTypes = (a: any, b: any) => this.sortMode ? b[this.sortAtt] - a[this.sortAtt] : a[this.sortAtt] - b[this.sortAtt]

  canDismiss = async () => {
    const actionSheet = await this.actionSheetController.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'Yes',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    return role === 'confirm';
  };

  handleUpdate(photo: UserPhoto) {
    return async () => {
      photo.updateTime = new Date().toISOString();
      photo.count++;
      this.photoService.updatePicture(photo);
    }
  }

  showActionSheet(photo: UserPhoto) {
    // 因为想在tab里实现和执行该过程，但html参数中不能填匿名函数，所以这里返回匿名函数
    return async () => {
      const actionSheet = await this.actionSheetController.create({
        header: 'Photos',
        buttons: [
          {
            text: 'Detail',
            role: 'selected',
            icon: 'bookmarks',
            handler: () => {
              this.router.navigate(['/app/tabs/tab2/photo-detail', photo.code])
            }
          },
          {
            text: photo.isVisible?'hidden':'display',
            role: 'selected',
            icon: photo.isVisible?'eye-off':'eye',
            handler: () => {
              photo.isVisible = Math.abs(1-photo.isVisible);
              this.photoService.updatePicture(photo);
            }
          },
          {
            text: 'Edit',
            role: 'selected',
            icon: 'create',
            handler: () => {
              this.router.navigate(['/app/tabs/tab2/photo-edit', photo.code])
            }
          },
          {
            text: 'Delete',
            role: 'destructive',
            icon: 'trash',
            handler: () => {
              this.handleDelete(photo);
            }
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel',
            handler: () => {
              // Nothing to do, action sheet is automatically closed
              }
          }
        ]
      });
      await actionSheet.present();
    }
  }
}
