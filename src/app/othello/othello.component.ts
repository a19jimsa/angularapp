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
  undoArray: Marker[] = new Array();
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
    this.undoArray = new Array();
    for (let i = 0; i < 64; i++) {
      this.markers.push({ id: i, color: 'green' });
    }
    this.markers.splice(27, 1, { id: 27, color: 'white' });
    this.markers.splice(28, 1, { id: 28, color: 'black' });
    this.markers.splice(35, 1, { id: 35, color: 'black' });
    this.markers.splice(36, 1, { id: 36, color: 'white' });
    this.xIsNext = false;
    let clonedArray = JSON.parse(JSON.stringify(this.markers));
    this.undoArray = clonedArray;
  }

  makeMove(idx: number) {
    let clonedArray = JSON.parse(JSON.stringify(this.markers));
    this.undoArray = clonedArray;
    if (this.markers[idx].color === 'green') {
      let coord = this.convertToYCoord(idx);
      let offsets = [-1, -7, -8, -9, 9, 8, 7, 1];
      let right = 8 - coord - 1;
      let left = coord;
      let num = 8;
      for (let i = 0; i < offsets.length; i++) {
        if (i == 0) {
          num = left;
        } else if (i == 1) {
          num = right;
        } else if (i == 3) {
          num = left;
        } else if (i == 4) {
          num = right;
        } else if (i == 6) {
          num = left;
        } else if (i == 7) {
          num = right;
        } else {
          num = 8;
        }
        this.createPath(num, offsets[i], idx);
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
      for (let i = 0; i < this.tempMarkers.length; i++) {
        let id = this.tempMarkers[i].id;
        this.markers[id].color = this.player.color;
      }
      this.foundOpposite = true;
    }
    this.tempMarkers = [];
  }
  convertToYCoord(idx: number) {
    let column1 = [0, 1, 2, 3, 4, 5, 6, 7];
    let column2 = [8, 9, 10, 11, 12, 13, 14, 15];
    let column3 = [16, 17, 18, 19, 20, 21, 22, 23];
    let column4 = [24, 25, 26, 27, 28, 29, 30, 31];
    let column5 = [32, 33, 34, 35, 36, 37, 38, 39];
    let column6 = [40, 41, 42, 43, 44, 45, 46, 47];
    let column7 = [48, 49, 50, 51, 52, 53, 54, 55];
    let column8 = [56, 57, 58, 59, 60, 61, 62, 63];

    if (column1.findIndex((value) => value == idx) != -1) {
      return column1.findIndex((value) => value == idx);
    } else if (column2.findIndex((value) => value == idx) != -1) {
      return column2.findIndex((value) => value == idx);
    } else if (column3.findIndex((value) => value == idx) != -1) {
      return column3.findIndex((value) => value == idx);
    } else if (column4.findIndex((value) => value == idx) != -1) {
      return column4.findIndex((value) => value == idx);
    } else if (column5.findIndex((value) => value == idx) != -1) {
      return column5.findIndex((value) => value == idx);
    } else if (column6.findIndex((value) => value == idx) != -1) {
      return column6.findIndex((value) => value == idx);
    } else if (column7.findIndex((value) => value == idx) != -1) {
      return column7.findIndex((value) => value == idx);
    } else if (column8.findIndex((value) => value == idx) != -1) {
      return column8.findIndex((value) => value == idx);
    }
    return -1;
  }

  undo() {
    if (this.undoArray.length > 0) {
      let clonedArray = JSON.parse(JSON.stringify(this.undoArray));
      this.markers = clonedArray;
      this.xIsNext = !this.xIsNext;
    }
  }
}
