import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment'
import { RestResponse } from '../interfaces/rest-response';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
  baseUrl = environment.baseUrl + "/member";
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
  ) { }

  login(username: string): Promise<any> {
    return Preferences.set({
      key: this.HAS_LOGGED_IN,
      value: "1",
    }).then(() => {
      this.setUsername(username);
      return window.dispatchEvent(new CustomEvent('user:login'));
    });
  }

  setUsername(username: string): Promise<any> {
    return Preferences.set({
      key: 'username',
      value: username
    })
  }

  isLoggedIn(): Promise<boolean> {
    return Preferences.get({
      key: this.HAS_LOGGED_IN
    }).then((res) => {
      return res.value === "1";
    });
  }

  logout(): Promise<any> {
    return Preferences.remove({
      key: this.HAS_LOGGED_IN
    }).then(() => {
      return Preferences.remove({
        key: 'username'
      });
    }).then(() => {
      window.dispatchEvent(new CustomEvent('user:logout'));
    });
  }

  signup(user: UserOptions) {
    return this.http.post(this.baseUrl + "/create", {
      membercode: user.username,
      password: user.password
    }, this.httpOptions)
    .pipe((resp) => {
      // if (resp.code !== 200) {
      //   return resp;
      // }
      Preferences.set({
        key: this.HAS_LOGGED_IN,
        value: "1"
      }).then(() => {
        this.setUsername(user.username);
        window.dispatchEvent(new CustomEvent('user:signup'));
      });
      return resp;
    })
  }

  getUsername(): Promise<string> {
    return Preferences.get({
      key: 'username'}
      ).then((res) => {
      return res.value;
    });
  }
}

export interface UserOptions {
  username: string;
  password: string;
}

