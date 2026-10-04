import * as Location from "expo-location";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PinMap from "../components/PinMap";
import { addPlace } from "../store";
import { colors } from "../theme";

export default function AddPlaceScreen() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [flyTo, setFlyTo] = useState<{
    lat: number;
    lng: number;
    id: number;
  } | null>(null);
  const insets = useSafeAreaInsets();

  function handlePick(newLat: number, newLng: number) {
    setLat(newLat);
    setLng(newLng);
    setAccuracy(null);
    setError("");
  }

  async function handleUseLocation() {
    setError("");
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setError("Location is off for this app. You can still tap the map.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude, accuracy: meters } = position.coords;
      setLat(latitude);
      setLng(longitude);
      setAccuracy(meters ?? null);
      setFlyTo({ lat: latitude, lng: longitude, id: Date.now() });
    } catch {
      setError("Could not get your location. Turn on GPS and try again.");
    } finally {
      setLocating(false);
    }
  }

  async function handleSave() {
    if (name.trim() === "") {
      setError("Please write a name for this place.");
      return;
    }
    if (lat === null || lng === null) {
      setError("Please tap the map or use your location to drop a pin.");
      return;
    }
    await addPlace(name.trim(), note.trim(), lat, lng);
    router.back();
  }

  return (
    <View
      style={[styles.container, { paddingBottom: 20 + insets.bottom }]}
    >
      <Stack.Screen options={{ title: "Add place" }} />

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Example: Abebe's Shop"
        placeholderTextColor={colors.mutedText}
        value={name}
        onChangeText={(text) => {
          setName(text);
          setError("");
        }}
      />

      <Text style={styles.label}>Note</Text>
      <TextInput
        style={[styles.input, styles.noteInput]}
        placeholder="Example: Blue gate, behind the pharmacy"
        placeholderTextColor={colors.mutedText}
        value={note}
        onChangeText={setNote}
        multiline
      />

      <Text style={styles.label}>Tap the map to drop a pin</Text>

      <Pressable
        style={[styles.locationButton, locating && styles.locationButtonBusy]}
        onPress={handleUseLocation}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.locationButtonText}>Use my location</Text>
        )}
      </Pressable>

      <PinMap onPick={handlePick} flyTo={flyTo} />

      {lat !== null && <Text style={styles.pinSet}>Pin dropped</Text>}
      {accuracy !== null && (
        <Text style={styles.accuracyText}>
          Accuracy: about {Math.round(accuracy)} m
          {accuracy > 30
            ? ". Signal is weak. Go outside or tap the map to fix the pin."
            : ""}
        </Text>
      )}

      {error !== "" && <Text style={styles.errorText}>{error}</Text>}

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  noteInput: {
    height: 80,
    textAlignVertical: "top",
  },
  locationButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    minHeight: 46,
  },
  locationButtonBusy: {
    opacity: 0.6,
  },
  locationButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  pinSet: {
    color: colors.done,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  accuracyText: {
    color: colors.mutedText,
    fontSize: 14,
    marginTop: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 14,
  },
  saveButtonText: {
    color: colors.onPrimary,
    fontSize: 17,
    fontWeight: "600",
  },
});