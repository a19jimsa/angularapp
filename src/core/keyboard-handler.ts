export type Key = string;

export class KeyboardHandler {
  public pressedKeys = new Set<Key>();
  constructor() {
    window.addEventListener('keydown', this.onKeyboardDown.bind(this));
    window.addEventListener('keyup', this.onKeyboardUp.bind(this));
  }

  private onKeyboardDown(event: KeyboardEvent) {
    this.pressedKeys.add(event.key);
  }

  private onKeyboardUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);
  }

  get keys() {
    return this.pressedKeys;
  }
}
