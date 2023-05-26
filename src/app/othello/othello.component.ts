import { Component, OnInit } from '@angular/core';
import { Marker } from '../marker';

@Component({
  selector: 'app-othello',
  templateUrl: './othello.component.html',
  styleUrls: ['./othello.component.css'],
})
export class OthelloComponent implements OnInit {
  markers!: Marker[];
  xIsNext!: boolean;
  tempMarkers!: Marker[];
  foundOpposite!: boolean;
  constructor() {}

  ngOnInit(): void {
    this.newGame();
  }
  get player() {
    return this.xIsNext ? { color: 'black' } : { color: 'white' };
  }

  newGame() {
    this.tempMarkers = new Array();
    this.markers = new Array();
    for (let i = 0; i < 64; i++) {
      this.markers.push({ id: i, color: 'green' });
    }
    this.markers.splice(27, 1, { id: 27, color: 'white' });
    this.markers.splice(28, 1, { id: 28, color: 'black' });
    this.markers.splice(35, 1, { id: 35, color: 'black' });
    this.markers.splice(36, 1, { id: 36, color: 'white' });
    this.xIsNext = false;
  }

  makeMove(idx: number) {
    console.log('pressed');
    if (this.markers[idx].color === 'green') {
      let offsets = [-1, -7, -8, -9, 9, 8, 7, 1];
      for (let i = 0; i < offsets.length; i++) {
        this.createPath(5, offsets[i], idx);
      }
    }
    if (this.foundOpposite) {
      this.markers[idx].color = this.player.color;
      this.xIsNext = !this.xIsNext;
      this.tempMarkers = [];
      this.foundOpposite = false;
    }
  }
  //Create path for unit
  createPath(num: number, value: number, idx: number) {
    let number = -1;
    let number2 = -1;
    for (let i = 0; i < num; i++) {
      let offset = value * (i + 1);
      if (idx + offset > 63 || idx + offset < 0) break;
      if (this.markers[idx + offset].color === 'green') break;
      if (this.tempMarkers.length < 1) {
        if (this.markers[idx + offset].color === this.player.color) break;
      }
      this.tempMarkers.push({
        id: idx + offset,
        color: this.markers[idx + offset].color,
      });
      if (this.markers[idx + offset].color === this.player.color) {
        break;
      }
    }
    number = this.tempMarkers.findIndex((e) => e.color === this.player.color);
    number2 = this.tempMarkers.findIndex((e) => e.color !== this.player.color);
    if (number != -1 && number2 != -1) {
      console.log(this.tempMarkers);
      for (let i = 0; i < this.tempMarkers.length; i++) {
        let id = this.tempMarkers[i].id;
        this.markers[id].color = this.player.color;
      }
      this.foundOpposite = true;
    }
    this.tempMarkers = [];
  }
}
