import { Component, OnInit, Input } from '@angular/core';
import { UserPhoto } from 'src/app/services/photo.service';

@Component({
  selector: 'app-dress-card',
  templateUrl: './dress-card.component.html',
  styleUrls: ['./dress-card.component.scss'],
})
export class DressCardComponent implements OnInit {

  @Input() photo?: UserPhoto;
  @Input() handleClick?: Function;
  @Input() handleUpdate?: Function;

  constructor() { }

  ngOnInit() {}

}
