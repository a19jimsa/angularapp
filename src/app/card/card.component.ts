import { Component, Input } from '@angular/core';
import { Card } from '../card';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css'],
    standalone: false
})
export class CardComponent {
  @Input() value!: Card;
}
