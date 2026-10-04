import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PinMap from "../../components/PinMap";
import { Place, deletePlace, getPlace, toggleDone } from "../../store";
import { colors } from "../../theme";

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getPlace(id).then((found) => {
      setPlace(found);
      setLoaded(true);
    });
  }, [id]);

  async function handleToggleDone() {
    if (place === null) return;
    await toggleDone(place.id);
    setPlace({ ...place, done: !place.done });
  }

  async function handleDelete() {
    if (place === null) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deletePlace(place.id);
    router.back();
  }

  if (!loaded) {
    return <View style={styles.container} />;
  }

  if (place === null) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Place details" }} />
        <Text style={styles.note}>This place was not found.</Text>
      </View>
    );
  }

  const hasPin = typeof place.lat === "number" && typeof place.lng === "number";

  return (
    <View
      style={[styles.container, { paddingBottom: 20 + insets.bottom }]}
    >
      <Stack.Screen options={{ title: "Place details" }} />

      <View style={styles.headerRow}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={place.done ? styles.done : styles.pending}>
          {place.done ? "Done" : "Pending"}
        </Text>
      </View>

      <Text style={styles.note}>
        {place.note === "" ? "No note for this place." : place.note}
      </Text>

      {hasPin ? (
        <View style={styles.mapBox}>
          <PinMap lat={place.lat} lng={place.lng} readOnly />
        </View>
      ) : (
        <Text style={styles.noPin}>No pin saved for this place.</Text>
      )}

      <Pressable style={styles.doneButton} onPress={handleToggleDone}>
        <Text style={styles.buttonText}>
          {place.done ? "Mark as pending" : "Mark as done"}
        </Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>
          {confirmDelete ? "Tap again to delete" : "Delete"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    paddingRight: 10,
  },
  note: {
    fontSize: 16,
    color: colors.mutedText,
    marginTop: 8,
    marginBottom: 16,
  },
  noPin: {
    fontSize: 15,
    color: colors.mutedText,
    marginBottom: 16,
  },
  mapBox: {
    flex: 1,
    minHeight: 220,
    marginBottom: 16,
  },
  done: {
    color: colors.done,
    fontWeight: "600",
  },
  pending: {
    color: colors.pending,
    fontWeight: "600",
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 17,
    fontWeight: "600",
  },
  deleteButton: {
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteText: {
    color: colors.error,
    fontSize: 17,
    fontWeight: "600",
  },
});