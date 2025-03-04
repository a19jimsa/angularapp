import { Keyframe } from 'src/app/animation-creator/animation-creator.component';
import { Loader } from 'src/app/loader';
import { Skeleton } from 'src/components/skeleton';
import { State, States } from 'src/components/state';

type Animations = {
  name: string;
};

export class ResourceManager {
  private static animations: Map<string, any> = new Map();

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
    const keyframes = this.animations.get(skeleton.resource)[state];
    if (!keyframes) {
      console.log("Couldn't find animation");
      return [];
    }
    return keyframes;
  }
}
