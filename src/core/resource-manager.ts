import { Keyframe } from 'src/app/animation-creator/animation-creator.component';

type Filename = {
  name: string;
};

type Animation = {
  [key: string]: Keyframe[];
};

export class ResourceManager {
  private static animations: Map<string, Animation> = new Map();
  private static effects: Map<string, any> = new Map();
  private static filenames: string[] = Array();

  public static async loadAllAnimations(): Promise<void> {
    try {
      const res = await fetch('/assets/json/list.json');
      const files: Filename[] = await res.json();
      for (const file in files) {
        this.filenames.push(file);
      }

      const fetchPromises = files.map(async (file) => {
        const response = await fetch(
          `/assets/json/animations/${file.name}.json`
        );
        const data = await response.json();
        console.log(data);
        ResourceManager.animations.set(file.name, data);
      });

      await Promise.all(fetchPromises);
      console.log('Alla animationer har laddats!');
    } catch (error) {
      console.error('Fel vid laddning av animationer:', error);
    }
  }

  public static getAnimation(
    resource: string,
    animationName: string
  ): Keyframe[] {
    const animations = this.animations.get(resource);
    if (!animations) return [];
    return animations[animationName];
  }

  public static getAnimations(resource: string): Animation | null {
    const animation = this.animations.get(resource);
    if (animation) {
      return animation;
    }
    return null;
  }

  public static async loadAllEffects(): Promise<void> {
    try {
      const res = await fetch('/assets/json/effects/effects.json');
      const data = await res.json();
      ResourceManager.effects = new Map<string, any>(Object.entries(data));
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

  public static getFilenames() {
    return this.filenames;
  }
}
