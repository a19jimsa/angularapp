import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  public getPosts(url: string): Observable<any> {
    return this.http.get(url);
  }

  public createPost(url: string, postData: any): Observable<any> {
    return this.http.post(url, postData);
  }
}
