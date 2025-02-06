import { Component } from './component';

export class Element extends Component {
  override type: string = 'Element';
  element: 'fire' | 'ice' | 'water' | 'lightning' | 'light' | 'dark';

  constructor(
    element: 'fire' | 'ice' | 'water' | 'lightning' | 'light' | 'dark'
  ) {
    super();
    this.element = element;
  }
}
