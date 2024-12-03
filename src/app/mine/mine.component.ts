import { Component, Input } from '@angular/core';
import { Mine } from '../mine';

@Component({
    selector: 'app-mine',
    templateUrl: './mine.component.html',
    styleUrls: ['./mine.component.css'],
    standalone: false
})

export class MineComponent {
  @Input() value!: Mine;
}
