import { Component } from './component';

export class Animation extends Component {
  override type: string = 'Animation';
  keyframes = new Array();
  loop: boolean = false;
  speed: number = 0;
  duration: number = 0;
}
