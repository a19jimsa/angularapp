import { Component } from './component';

export class Splatmap extends Component {
  override type: string = 'Splatmap';
  coords = new Uint8Array();
}
