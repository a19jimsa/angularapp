import { Component } from './component';

export class Name extends Component {
  override type: string = 'Name';
  value: string;
  constructor(value: string) {
    super();
    this.value = value;
  }

  serialize() {
    return {
      value: this.value,
    };
  }

  deserialize(component: Name) {
    return new Name(component.value);
  }
}
