import AsyncStorage from "@react-native-async-storage/async-storage";

export type Place = {
  id: string;
  name: string;
  note: string;
  done: boolean;
  lat?: number | null;
  lng?: number | null;
};

const STORAGE_KEY = "delivery-pin-places";

async function savePlaces(places: Place[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}

export async function getPlaces(): Promise<Place[]> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return [];
    }
    return JSON.parse(saved) as Place[];
  } catch {
    return [];
  }
}

export async function getPlace(id: string): Promise<Place | null> {
  const all = await getPlaces();
  const found = all.find((place) => place.id === id);
  return found ?? null;
}

export async function addPlace(
  name: string,
  note: string,
  lat: number | null,
  lng: number | null
): Promise<void> {
  const current = await getPlaces();
  const newPlace: Place = {
    id: Date.now().toString(),
    name,
    note,
    done: false,
    lat,
    lng,
  };
  await savePlaces([newPlace, ...current]);
}

export async function toggleDone(id: string): Promise<void> {
  const current = await getPlaces();
  const updated = current.map((place) =>
    place.id === id ? { ...place, done: !place.done } : place
  );
  await savePlaces(updated);
}

export async function deletePlace(id: string): Promise<void> {
  const current = await getPlaces();
  const updated = current.filter((place) => place.id !== id);
  await savePlaces(updated);
}