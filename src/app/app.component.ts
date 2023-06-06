import { Component, OnInit, NgModule } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Item } from './item';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  chess = false;
  title = 'todo';

  filter: 'all' | 'active' | 'done' = 'all';

  allItems: Item[] = [];
  myForm!: FormGroup;

  //Dependency inject
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.myForm = this.fb.group({
      todo: ['', [Validators.required, Validators.minLength(5)]],
    });
    let items = localStorage.getItem('items');
    if (items !== null) {
      this.allItems = JSON.parse(items);
    }
  }

  get todo() {
    return this.myForm.get('todo');
  }

  get items() {
    if (this.filter === 'all') {
      return this.allItems;
    }
    return this.allItems.filter((item) =>
      this.filter === 'done' ? item.done : !item.done
    );
  }

  add(description: string) {
    //this.allItems.unshift({ description, done: false });
    this.save();
  }

  delete(i: number) {
    this.allItems.splice(i, 1);
    this.save();
  }

  change(item: Item) {
    this.remove(item);
    this.allItems.unshift(item);
    this.save();
  }

  remove(item: Item) {
    this.allItems.splice(this.allItems.indexOf(item), 1);
    this.save();
  }

  save() {
    localStorage.setItem('items', JSON.stringify(this.allItems));
  }

  changeNav() {
    this.chess = !this.chess;
  }
}
