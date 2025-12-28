import { Key, KeyboardHandler } from './keyboard-handler';

export class Keyboard extends KeyboardHandler {
  constructor() {
    super();
  }

  isKeyPressed(key: Key): boolean {
    if (super.keys.has(key)) {
      return true;
    }
    return false;
  }

  isKeyUp(key: Key): boolean {
    if (super.keys.has(key)) {
      return false;
    }
    return true;
  }
}
