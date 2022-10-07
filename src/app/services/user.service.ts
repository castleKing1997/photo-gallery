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
  token = "";

  constructor(
    private http: HttpClient,
  ) {
  }

  async login(user: UserOptions): Promise<RestResponse> {
    console.log("Dsaxa", user);
    return this.http.post(this.baseUrl + "/login", user,
      this.httpOptions).toPromise()
      .then((resp: RestResponse) => {
        console.log(resp)
        if (resp.code !== 200) {
          throw "登录失败";
        }
        Preferences.set({
          key: this.HAS_LOGGED_IN,
          value: "1"
        })
          .then(() => {
            this.token = resp.data["tokenHead"] + " " + resp.data["token"]
            Preferences.set({
              key: 'token',
              value: this.token
            })
          })
          .then(() => {
            window.dispatchEvent(new CustomEvent('user:login'));
          });
        return resp
      })
  }

  async updateUserInfo(id: number, params: any): Promise<RestResponse> {
    return this.http.post(this.baseUrl + "/update?eid=" + id, params,
      this.httpOptions).toPromise()
      .then((resp: RestResponse) => {
        console.log(resp)
        if (resp.code !== 200) {
          throw "更新失败";
        }
        return resp;
      })
  }

  async isLoggedIn(): Promise<boolean> {
    return Preferences.get({
      key: this.HAS_LOGGED_IN
    })
      .then((res) => {
        return res.value === "1";
      })
  }

  async logout(): Promise<any> {
    return Preferences.remove({
      key: this.HAS_LOGGED_IN
    })
      .then(() => {
        return Preferences.remove({
          key: 'username'
        });
      })
      .then(() => {
        return Preferences.remove({
          key: 'token'
        });
      })
      .then(() => {
        window.dispatchEvent(new CustomEvent('user:logout'));
      });
  }

  async signup(user: UserOptions): Promise<RestResponse> {
    return this.http.post(this.baseUrl + "/create", {
      membercode: user.username,
      membername: user.username,
      password: user.password
    }, this.httpOptions).toPromise()
      .then((resp: RestResponse) => {
        console.log(resp)
        if (resp.code !== 200) {
          throw "注册失败";
        }
        Preferences.set({
          key: this.HAS_LOGGED_IN,
          value: "1"
        })
          .then(() => {
            window.dispatchEvent(new CustomEvent('user:signup'));
          })
          .then(() => {
            this.login(user);
          });
        return resp
      });
  }


  async getUserInfo(): Promise<RestResponse> {
    return this.http.get(this.baseUrl + "/info", this.httpOptions).toPromise()
      .then((resp: RestResponse) => {
        return resp;
      })
  }

  async setToken(): Promise<void> {
    return Preferences.get({ key: 'token' })
      .then(res => {
        this.token = res.value;
      })
  }

  getToken(): string {
    return this.token
  }
}

export interface UserOptions {
  username: string;
  password: string;
}

export interface UserDetail {
  id: number;
  usercode: string;
  username: string;
  email: string;
  avatar: string;
  gender: string;
}

