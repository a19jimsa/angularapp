import { Component, OnInit, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.css'],
    standalone: false
})
export class FormComponent implements OnInit {
  @Input() value = '';
  posts!: any[];
  myForm!: FormGroup;
  //Dependency injection
  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPosts();
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(10)]],
      comment: ['', [Validators.required, Validators.minLength(10)]],
    });
  }
  get name() {
    return this.myForm.get('name');
  }

  get comment() {
    return this.myForm.get('comment');
  }

  add() {
    this.http
      .post<any>(this.value, {
        id: 1,
        name: this.name?.value,
        message: this.comment?.value,
      })
      .subscribe((response) => {
        console.log('Inlägg skapat: ', response);
      });
    this.loadPosts();
  }

  loadPosts() {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.http.get(this.value, { headers }).subscribe((response: any) => {
      this.posts = response;
    });
  }
}
