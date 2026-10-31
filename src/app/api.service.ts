import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = Inject(HttpClient);
  private URL: string = 'https://localhost:7231/';

  public get(url: string): Observable<any> {
    return this.http.get('https://localhost:7231/weatherforecast/');
  }

  public postImage(url: string, postData: any): Observable<any> {
    return this.http.post(this.URL + url, postData);
  }
}
