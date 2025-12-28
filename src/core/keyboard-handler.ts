export type Key = string;

export class KeyboardHandler {
  public pressedKeys = new Set<Key>();
  constructor() {
    window.addEventListener('keydown', this.onKeyboardDown.bind(this));
    window.addEventListener('keyup', this.onKeyboardUp.bind(this));
  }

  private onKeyboardDown(event: KeyboardEvent) {
    console.log(event.key);
    this.pressedKeys.add(event.key);
  }

  private onKeyboardUp(event: KeyboardEvent) {
    console.log(event.key);
    this.pressedKeys.delete(event.key);
  }

  get keys() {
    return this.pressedKeys;
  }
}
