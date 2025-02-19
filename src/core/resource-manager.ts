import { Keyframe } from 'src/app/animation-creator/animation-creator.component';
import { State } from 'src/components/state';

type Animations = {
  name: string;
};

type AnimationsData = {};

export class ResourceManager {
  private static animations: Map<string, any> = new Map();
  public static async loadAllAnimation(): Promise<void> {
    try {
      fetch('/assets/json/list.json')
        .then((res) => res.json())
        .then((files) => {
          files.forEach((file: Animations) => {
            fetch('/assets/json/animations/' + file.name + '.json')
              .then((res) => res.json())
              .then((data) => {
                ResourceManager.animations.set(file.name, data);
                console.log(ResourceManager.animations);
              });
          });
        });
    } catch (error) {
      console.error(error);
    }
  }

  public static getAnimation(state: State): any {
    const keyframes = this.animations.get(state.resource)[state.state];
    if (!keyframes) {
      console.log("Couldn't find animation");
      return [];
    }
    return keyframes;
  }
}
