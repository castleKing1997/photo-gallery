import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: UserPhoto[] = [];
  private KEY_PHOTO_STORAGE: string = 'PHOTO';

  constructor(
    private platform: Platform,
    private imagePicker: ImagePicker,
    ) { 
    this.loadSaved()
  }

  public async addNewToGallery(userPhoto: UserPhoto, photo: Photo) {
    const savedImageFile = await this.addPicture(userPhoto, photo);
    this.photos.push(savedImageFile); 
    Preferences.set({
      key: this.KEY_PHOTO_STORAGE+"."+savedImageFile.code,
      value: JSON.stringify(savedImageFile),
    });
  }

  public async takePhoto() {
      // Take a photo
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100
      });
      return capturedPhoto;
  }

  public async pickPhoto() {
    const pickedPhoto = await this.imagePicker.getPictures({
      maximumImagesCount: 1,
      quality: 100,
    })
    // Read each saved photo's data from the Filesystem
    const readFile = await Filesystem.readFile({
      path: pickedPhoto[0],
    });
    // Web platform only: Load the photo as base64 data
    const webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    return webviewPath;
  }

  public async loadSaved() {
    // Retrieve cached photo array data
    const allKeys = (await Preferences.keys()).keys;
    const photoKeys = allKeys.filter(item=>item.match(this.KEY_PHOTO_STORAGE))
    this.photos = [];
    for (let index = 0; index < photoKeys.length; index++) {
      const keyTemp = photoKeys[index];
      const item = await Preferences.get({key : keyTemp});
      this.photos.push(JSON.parse(item.value)); 
    }
  
    // Easiest way to detect when running on the web:
    // “when the platform is NOT hybrid, do this”
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: Directory.Data
        });
  
        // Web platform only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  public async getPhotoById(id: string) {
    const item = await Preferences.get({key : this.KEY_PHOTO_STORAGE+"."+id});
    return JSON.parse(item.value);
  }

  public async deletePicture(photo: UserPhoto) {
    // Update photos array cache by overwriting the existing photo array
    Preferences.remove({
      key: this.KEY_PHOTO_STORAGE+"."+photo.code,
    });
  
    // delete photo file from filesystem
    const filename = photo.filepath
                        .substr(photo.filepath.lastIndexOf('/') + 1);
  
    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data
    });

    this.loadSaved();
  }

  public async updatePicture(photo: UserPhoto) {
    const oldPhoto = await this.getPhotoById(photo.code);
    // Update photos array cache by overwriting the existing photo array
    Preferences.set({
      key: this.KEY_PHOTO_STORAGE+"."+photo.code,
      value: JSON.stringify(photo)
    });
    // delete old photo file if changed
    if (oldPhoto.filepath != photo.filepath) {
      const filename = oldPhoto.filepath
      .substr(oldPhoto.filepath.lastIndexOf('/') + 1);
      await Filesystem.deleteFile({
        path: filename,
        directory: Directory.Data
      });
    }
    this.loadSaved()
  }


  // Save picture to file on device
  private async addPicture(userPhoto: UserPhoto, photo: Photo) {
    // Convert photo to base64 format, required by Filesystem API to save
    let base64Data = null;
    if (photo.webPath.match("data:image/jpeg;base64")) {
      base64Data = photo.webPath;
    } else {
      base64Data = await this.readAsBase64(photo);
    }
    
    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
        name: userPhoto.name,
        createTime: userPhoto.createTime,
        updateTime: userPhoto.updateTime,
        count: userPhoto.count,
        code: this.getUUid(),
        isVisible: userPhoto.isVisible,
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
        name: userPhoto.name,
        createTime: userPhoto.createTime,
        updateTime: userPhoto.updateTime,
        count: userPhoto.count,
        code: this.getUUid(),
        isVisible: userPhoto.isVisible,
      };
    }
  }

  // Save picture to file on device
  private async savePicture(photo: Photo) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
        name: null,
        createTime: null,
        updateTime: null,
        count: 0,
        code: null,
        isVisible: 1,
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
        name: null,
        createTime: null,
        updateTime: null,
        count: 0,
        code: null,
        isVisible: 1,
      };
    }
  }

  private async readAsBase64(photo: Photo) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path
      });
  
      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
  
      return await this.convertBlobToBase64(blob) as string;
    }
  }
  
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  private getUUid = () => {
    const s = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits[Math.floor(Math.random() * 0x10)];
    }
    s[14] = '4';
    if (s[19] >= 'a' && s[19] <= 'f') {
      s[19] = hexDigits[8];
    } else {
      s[19] = hexDigits[parseInt(s[19]) & 0x3];
    }
    s[8] = s[13] = s[18] = s[23] = '-';
    return s.join('');
  }
}

export interface UserPhoto {
  filepath: string;
  webviewPath: string;
  name: string;
  createTime: string;
  updateTime: string;
  count: number;
  code: string;
  isVisible: number;
}