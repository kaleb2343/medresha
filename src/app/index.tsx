import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPlaces, Place } from "../store";
import { colors } from "../theme";

export default function HomeScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      getPlaces().then(setPlaces);
    }, [])
  );

  const pendingCount = places.filter((place) => !place.done).length;
  const doneCount = places.length - pendingCount;
  const hasAnyPin = places.some(
    (place) => typeof place.lat === "number" && typeof place.lng === "number"
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.brand}>MEDRESHA · መድረሻ</Text>
          <Text style={styles.title}>My Places</Text>
        </View>
        {hasAnyPin && (
          <Pressable
            style={styles.mapButton}
            onPress={() => router.push("/map")}
          >
            <Text style={styles.mapButtonText}>Map</Text>
          </Pressable>
        )}
      </View>

      {places.length === 0 && (
        <Text style={styles.subtitle}>
          Save the exact door. Find it again anytime.
        </Text>
      )}

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 100 + insets.bottom },
        ]}
        ListHeaderComponent={
          places.length > 0 ? (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: colors.pending }]}>
                  {pendingCount}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: colors.done }]}>
                  {doneCount}
                </Text>
                <Text style={styles.statLabel}>Done</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Your notebook is empty</Text>
            <Text style={styles.emptyStep}>1. Tap the + button</Text>
            <Text style={styles.emptyStep}>2. Write a name and a note</Text>
            <Text style={styles.emptyStep}>3. Drop a pin on the map</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/place/[id]",
                params: { id: item.id },
              })
            }
          >
            <View style={styles.cardText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.note}>{item.note}</Text>
              {typeof item.lat === "number" && (
                <Text style={styles.pinTag}>Pin saved</Text>
              )}
            </View>
            <Text style={item.done ? styles.done : styles.pending}>
              {item.done ? "Done" : "Pending"}
            </Text>
          </Pressable>
        )}
      />

      <Pressable
        style={[styles.addButton, { bottom: 24 + insets.bottom }]}
        onPress={() => router.push("/add")}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  brand: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: colors.mutedText,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 4,
  },
  mapButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: colors.card,
  },
  mapButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    color: colors.mutedText,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 10,
  },
  emptyStep: {
    fontSize: 15,
    color: colors.mutedText,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  cardText: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  note: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: 4,
  },
  pinTag: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 6,
  },
  done: {
    color: colors.done,
    fontWeight: "600",
  },
  pending: {
    color: colors.pending,
    fontWeight: "600",
  },
  addButton: {
    position: "absolute",
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: colors.onPrimary,
    fontSize: 32,
    marginTop: -2,
  },
});