import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';


import { PhotoService, UserPhoto } from 'src/app/services/photo.service';

@Component({
  selector: 'app-photo-detail',
  templateUrl: './photo-detail.page.html',
  styleUrls: ['./photo-detail.page.scss'],
})
export class PhotoDetailPage implements OnInit {

  photo: UserPhoto | undefined;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private photoService: PhotoService,
  ) { }

  async ngOnInit() {
    this.getPhoto();
  }

  goBack() {
    this.location.back();
  }

  goEdit() {
    this.router.navigate(['/edit', this.photo.code])
  }

  async getPhoto() {
    const id = this.route.snapshot.paramMap.get('id');
    this.photo = await this.photoService.getPhotoById(id);
  }
}
