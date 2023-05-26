import { Component, Input } from '@angular/core';
import { Marker } from '../marker';

@Component({
  selector: 'app-circle',
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.css'],
})
export class CircleComponent {
  @Input() value!: Marker;
}
