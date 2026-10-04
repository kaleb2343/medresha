import { Stack, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AllMap from "../components/AllMap";
import { Place, getPlaces } from "../store";
import { colors } from "../theme";

export default function MapScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loaded, setLoaded] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      getPlaces().then((list) => {
        setPlaces(
          list.filter(
            (place) =>
              typeof place.lat === "number" && typeof place.lng === "number"
          )
        );
        setLoaded(true);
      });
    }, [])
  );

  function handleOpen(id: string) {
    router.push({ pathname: "/place/[id]", params: { id } });
  }

  return (
    <View
      style={[styles.container, { paddingBottom: 16 + insets.bottom }]}
    >
      <Stack.Screen options={{ title: "My map" }} />

      {loaded && places.length === 0 ? (
        <Text style={styles.empty}>No places with a pin yet.</Text>
      ) : (
        <AllMap places={places} onOpen={handleOpen} />
      )}

      <Text style={styles.legend}>
        Wine pin = Pending. Faded pin = Done. Tap a pin to see it.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  empty: {
    flex: 1,
    fontSize: 16,
    color: colors.mutedText,
    textAlign: "center",
    marginTop: 40,
  },
  legend: {
    fontSize: 13,
    color: colors.mutedText,
    textAlign: "center",
    marginTop: 10,
  },
});