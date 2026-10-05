import * as Location from "expo-location";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PinMap from "../components/PinMap";
import { addPlace, getPlace, updatePlace } from "../store";
import { colors } from "../theme";

export default function AddPlaceScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEdit = typeof edit === "string" && edit !== "";

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [ready, setReady] = useState(!isEdit);
  const [fullMap, setFullMap] = useState(false);
  const [fullStart, setFullStart] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [initialPin, setInitialPin] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [flyTo, setFlyTo] = useState<{
    lat: number;
    lng: number;
    id: number;
  } | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!edit) return;
    getPlace(edit).then((found) => {
      if (found) {
        setName(found.name);
        setNote(found.note);
        setPhone(found.phone ?? "");
        if (typeof found.lat === "number" && typeof found.lng === "number") {
          setLat(found.lat);
          setLng(found.lng);
          setInitialPin({ lat: found.lat, lng: found.lng });
        }
      }
      setReady(true);
    });
  }, [edit]);

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

  function openFullMap() {
    setError("");
    if (lat !== null && lng !== null) {
      setFullStart({ lat, lng });
    } else {
      setFullStart(null);
    }
    setFullMap(true);
  }

  function closeFullMap() {
    setFullMap(false);
    if (lat !== null && lng !== null) {
      setFlyTo({ lat, lng, id: Date.now() });
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
    if (isEdit && edit) {
      await updatePlace(edit, name.trim(), note.trim(), lat, lng, phone.trim());
    } else {
      await addPlace(name.trim(), note.trim(), lat, lng, phone.trim());
    }
    router.back();
  }

  return (
    <View
      style={[styles.container, { paddingBottom: 20 + insets.bottom }]}
    >
      <Stack.Screen options={{ title: isEdit ? "Edit place" : "Add place" }} />

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

      <Text style={styles.label}>Phone (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Example: 0911 22 33 44"
        placeholderTextColor={colors.mutedText}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Tap the map to drop a pin</Text>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.mapActionButton, locating && styles.buttonBusy]}
          onPress={handleUseLocation}
          disabled={locating}
        >
          {locating ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.mapActionText}>Use my location</Text>
          )}
        </Pressable>
        <Pressable
          style={[styles.mapActionButton, !ready && styles.buttonBusy]}
          onPress={openFullMap}
          disabled={!ready}
        >
          <Text style={styles.mapActionText}>Full screen</Text>
        </Pressable>
      </View>

      {ready ? (
        <PinMap
          onPick={handlePick}
          flyTo={flyTo}
          lat={initialPin ? initialPin.lat : null}
          lng={initialPin ? initialPin.lng : null}
        />
      ) : (
        <View style={styles.mapWaiting} />
      )}

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

      <Modal
        visible={fullMap}
        animationType="slide"
        onRequestClose={closeFullMap}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <View
          style={[
            styles.fullContainer,
            {
              paddingTop: insets.top + 12,
              paddingBottom: 12 + insets.bottom,
            },
          ]}
        >
          <Text style={styles.fullTitle}>Tap the exact door</Text>

          <PinMap
            onPick={handlePick}
            flyTo={flyTo}
            lat={fullStart ? fullStart.lat : null}
            lng={fullStart ? fullStart.lng : null}
          />

          {accuracy !== null && (
            <Text style={styles.accuracyText}>
              Accuracy: about {Math.round(accuracy)} m
            </Text>
          )}
          {error !== "" && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.fullButtons}>
            <Pressable
              style={[styles.mapActionButton, locating && styles.buttonBusy]}
              onPress={handleUseLocation}
              disabled={locating}
            >
              {locating ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.mapActionText}>My location</Text>
              )}
            </Pressable>
            <Pressable style={styles.doneButton} onPress={closeFullMap}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 10,
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
    height: 70,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  mapActionButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  buttonBusy: {
    opacity: 0.6,
  },
  mapActionText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  mapWaiting: {
    flex: 1,
    minHeight: 180,
    borderRadius: 12,
    backgroundColor: colors.card,
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
  fullContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  fullTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 10,
  },
  fullButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  doneButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  doneButtonText: {
    color: colors.onPrimary,
    fontSize: 17,
    fontWeight: "600",
  },
});