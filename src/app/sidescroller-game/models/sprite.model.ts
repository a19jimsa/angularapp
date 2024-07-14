export class Sprite {
  private image = new Image();
  constructor(url: string) {
    this.image.src = url;
  }
}
