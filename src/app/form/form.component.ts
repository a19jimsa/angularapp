import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  myForm!: FormGroup;
  //Dependency inject
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
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

  add() {}
}
