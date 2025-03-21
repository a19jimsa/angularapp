import { Keyframe } from 'src/app/animation-creator/animation-creator.component';

type Filename = {
  name: string;
};

export type Animation = {
  [key: string]: Keyframe[];
};

export class ResourceManager {
  private static animations: Map<string, Animation> = new Map();
  private static effects: Map<string, Animation> = new Map();
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

  public static getEffect(effect: string, effectName: string): Keyframe[] {
    const animations = this.animations.get(effect);
    if (!animations) return [];
    return animations[effectName];
  }

  public static getEffects(): Map<string, Animation> {
    return this.effects;
  }

  public static getAnimations(): Map<string, Animation> {
    return this.animations;
  }

  public static getAllAnimationsFromFile(filename: string) {
    return this.animations.get(filename);
  }

  public static getFilenames() {
    return this.filenames;
  }

  public static saveJSONFile(data: Animation, filename: string) {
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url); // Städa upp
  }
}
