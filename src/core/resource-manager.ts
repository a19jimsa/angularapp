import { Keyframe } from 'src/app/animation-creator/animation-creator.component';
import { Skeleton } from 'src/components/skeleton';
import { States } from 'src/components/state';

type Animations = {
  name: string;
};

export class ResourceManager {
  private static animations: Map<string, any> = new Map();
  private static effects: Map<string, Keyframe[]> = new Map();

  public static async loadAllAnimation(): Promise<void> {
    try {
      // Vänta på att bonelist.json laddas
      const res = await fetch('/assets/json/list.json');
      const files: Animations[] = await res.json();

      // Skapa en array av fetch-promises
      const fetchPromises = files.map(async (file: Animations) => {
        const response = await fetch(
          `/assets/json/animations/${file.name}.json`
        );
        const data = await response.json();
        ResourceManager.animations.set(file.name, data);
      });

      // Vänta på att alla fetch-anrop slutförs
      await Promise.all(fetchPromises);
      console.log('Alla animationer har laddats!');
    } catch (error) {
      console.error('Fel vid laddning av animationer:', error);
    }
  }

  public static getAnimation(skeleton: Skeleton, state: States): Keyframe[] {
    const keyframes = this.animations.get(skeleton.resource)[
      state
    ] as Keyframe[];
    if (!keyframes) {
      console.log("Couldn't find animation");
      return [];
    }
    skeleton.animationDuration = keyframes[keyframes.length - 1].time;
    skeleton.startTime = performance.now();
    return keyframes;
  }

  public static async loadAllEffects(): Promise<void> {
    try {
      const res = await fetch('/assets/json/effects/effects.json');
      const data = await res.json();
      ResourceManager.effects = new Map<string, Keyframe[]>(
        Object.entries(data)
      );
    } catch (error) {
      console.log(error);
    }
  }

  public static getEffect(effect: string): Keyframe[] {
    const keyframes = this.effects.get(effect);
    if (!keyframes) {
      console.log("Couldn't find effect " + effect);
      return [];
    }
    return keyframes;
  }
}
