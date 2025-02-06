import { Keyframe } from 'src/app/animation-creator/animation-creator.component';

type Animations = {
  name: string;
};

export class ResourceManager {
  private static animations: Map<string, Keyframe[]> = new Map();
  public static async loadAllAnimation(): Promise<void> {
    try {
      fetch('/assets/json/list.json')
        .then((res) => res.json())
        .then((files) => {
          files.forEach((file: Animations) => {
            fetch('/assets/json/' + file.name + '.json')
              .then((res) => res.json())
              .then((data: Keyframe[]) => {
                console.log(data);
                ResourceManager.animations.set(file.name, data);
              });
          });
        });
    } catch (error) {
      console.log(error);
    }
  }

  static getAnimation(name: string): Keyframe[] {
    const keyFrames = this.animations.get(name);
    if (!keyFrames) return [];
    return keyFrames;
  }
}
