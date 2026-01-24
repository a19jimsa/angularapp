import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-brush-image',
  imports: [],
  templateUrl: './brush-image.component.html',
  styleUrl: './brush-image.component.css',
})
export class BrushImageComponent {
  @Input() images: HTMLImageElement[] = [];
  @Output() selected = new EventEmitter<HTMLImageElement>();

  onClick(index: number) {
    this.selected.emit(this.images[index]);
  }
}
