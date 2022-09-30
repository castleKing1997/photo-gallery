import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  appPages = [
    {
      title: 'Photo',
      url: '/app/tabs/tab2',
      icon: 'images'
    },
  ];
  loggedIn = false;
  dark = false;
  constructor(
    public userService: UserService,
    public router: Router,
  ) {}

  async ngOnInit() {
    this.checkLoginStatus();
    this.listenForLoginEvents();
  }

  updateLoggedInStatus(loggedIn: boolean) {
    setTimeout(() => {
      this.loggedIn = loggedIn;
    }, 300);
  }

  listenForLoginEvents() {
    window.addEventListener('user:login', () => {
      this.updateLoggedInStatus(true);
    });

    window.addEventListener('user:signup', () => {
      this.updateLoggedInStatus(true);
    });

    window.addEventListener('user:logout', () => {
      this.updateLoggedInStatus(false);
    });
  }

  checkLoginStatus() {
    return this.userService.isLoggedIn().then(loggedIn => {
      return this.updateLoggedInStatus(loggedIn);
    });
  }

  logout() {
    this.userService.logout().then(() => {
      return this.router.navigateByUrl('/app/tabs/tab2');
    });
  }
}
