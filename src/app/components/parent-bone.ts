import { Component } from './component';

export class ParentBone extends Component {
  override type: string = 'ParentBone';
  boneId: string;

  constructor(boneId: string) {
    super();
    this.boneId = boneId;
  }
}
