type Animations = {
  name: string;
};

type AnimationsData = {};

export class Loader {
  private static animations: Map<string, any> = new Map();

  public static async loadAllAnimation(): Promise<void> {
    try {
      // Vänta på att bonelist.json laddas
      const res = await fetch('/assets/json/bonelist.json');
      const files: Animations[] = await res.json();

      // Skapa en array av fetch-promises
      const fetchPromises = files.map(async (file: Animations) => {
        const response = await fetch(`/assets/json/${file.name}.json`);
        const data = await response.json();
        Loader.animations.set(file.name, data);
      });

      // Vänta på att alla fetch-anrop slutförs
      await Promise.all(fetchPromises);
      console.log('Alla animationer har laddats!');
    } catch (error) {
      console.error('Fel vid laddning av animationer:', error);
    }
  }

  public static getBones(bones: string): any {
    const keyframes = this.animations.get(bones);
    if (!keyframes) {
      console.log("Couldn't find animation");
      return [];
    }
    const newKeyframes = JSON.parse(JSON.stringify(keyframes));
    return newKeyframes;
  }
}
