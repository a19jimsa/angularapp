import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Dish } from '../dish';

@Component({
    selector: 'app-calculator',
    templateUrl: './calculator.component.html',
    styleUrls: ['./calculator.component.css'],
    standalone: false
})
export class CalculatorComponent implements OnInit {
  myForm!: FormGroup;
  myDishes!: Dish[];

  //Dependency inject
  constructor(private fb: FormBuilder) {}
  ngOnInit(): void {
    this.myDishes = new Array();
    this.myForm = this.fb.group({
      name: '',
      ingridients: this.fb.array([]),
    });
  }

  get dish() {
    return this.myForm.get('dish') as FormArray;
  }

  get ingridients() {
    return this.myForm.get('ingridients') as FormArray;
  }

  addDish(): void {
    this.myDishes.push(this.myForm.value);
    console.log(this.myDishes);
    this.myForm.reset();
    this.ingridients.clear();
  }

  addIngridient(): void {
    const ingridient = this.fb.group({
      name: '',
      amount: 0,
      calories: 0,
    });

    this.ingridients.push(ingridient);
  }

  deleteIngridient(i: number): void {
    this.ingridients.removeAt(i);
  }

  deleteDish(i: number): void {
    this.myDishes.splice(i, 1);
  }

  editDish(i: number) {
    this.myForm.patchValue(this.myDishes[i]);
  }

  calc(index: number): number {
    let sum: number = 0;
    for (let i = 0; i < this.myDishes[index].ingridients.length; i++) {
      sum += this.myDishes[index].ingridients[i].calories;
    }
    return sum;
  }
}
