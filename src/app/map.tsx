import * as Location from "expo-location";
import { Stack, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AllMap from "../components/AllMap";
import { Place, getPlaces } from "../store";
import { colors } from "../theme";

export default function MapScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [me, setMe] = useState<{
    lat: number;
    lng: number;
    id: number;
  } | null>(null);
  const [fitId, setFitId] = useState(0);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
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

  async function handleMyLocation() {
    setMessage("");
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setMessage("Location is off for this app.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setMe({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        id: Date.now(),
      });
    } catch {
      setMessage("Could not get your location. Turn on GPS and try again.");
    } finally {
      setLocating(false);
    }
  }

  function handleShowAll() {
    setMessage("");
    setFitId(Date.now());
  }

  const hasPlaces = places.length > 0;

  return (
    <View
      style={[styles.container, { paddingBottom: 16 + insets.bottom }]}
    >
      <Stack.Screen options={{ title: "My map" }} />

      {loaded && !hasPlaces ? (
        <Text style={styles.empty}>No places with a pin yet.</Text>
      ) : (
        <AllMap
          places={places}
          onOpen={handleOpen}
          me={me}
          fitId={fitId}
        />
      )}

      {hasPlaces && (
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.mapButton, locating && styles.busy]}
            onPress={handleMyLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.mapButtonText}>My location</Text>
            )}
          </Pressable>
          <Pressable style={styles.mapButton} onPress={handleShowAll}>
            <Text style={styles.mapButtonText}>Show all</Text>
          </Pressable>
        </View>
      )}

      {message !== "" && <Text style={styles.message}>{message}</Text>}

      <Text style={styles.legend}>
        Wine pin = Pending. Faded pin = Done. Blue dot = you.
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
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  mapButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    backgroundColor: colors.card,
  },
  busy: {
    opacity: 0.6,
  },
  mapButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  message: {
    color: colors.error,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  legend: {
    fontSize: 13,
    color: colors.mutedText,
    textAlign: "center",
    marginTop: 10,
  },
});