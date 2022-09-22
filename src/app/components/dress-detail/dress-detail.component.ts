import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';


import { PhotoService, UserPhoto } from 'src/app/services/photo.service';

@Component({
  selector: 'app-dress-detail',
  templateUrl: './dress-detail.component.html',
  styleUrls: ['./dress-detail.component.scss'],
})
export class DressDetailComponent implements OnInit {

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
