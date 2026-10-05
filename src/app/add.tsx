import * as Location from "expo-location";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PinMap from "../components/PinMap";
import { addPlace, getPlace, updatePlace } from "../store";
import { colors } from "../theme";

type SearchResult = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

type RawResult = {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
};

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
  const [moveTo, setMoveTo] = useState<{
    lat: number;
    lng: number;
    id: number;
  } | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
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

  async function handleSearch() {
    const text = query.trim();
    if (text === "") return;
    Keyboard.dismiss();
    setSearching(true);
    setSearchMessage("");
    setResults([]);
    try {
      const url =
        "https://nominatim.openstreetmap.org/search?format=json&limit=5" +
        "&countrycodes=et&accept-language=en,am" +
        "&viewbox=38.60,9.15,38.95,8.85&bounded=0" +
        "&q=" +
        encodeURIComponent(text);
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Medresha/1.0 (Android app, kalebdawit)",
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data = (await response.json()) as RawResult[];
      const found: SearchResult[] = (Array.isArray(data) ? data : [])
        .map((item) => ({
          id: String(item.place_id),
          name: String(item.display_name),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }))
        .filter((item) => !isNaN(item.lat) && !isNaN(item.lng));
      if (found.length === 0) {
        setSearchMessage(
          "Nothing found. Try another word, or move the map by hand."
        );
      }
      setResults(found);
    } catch {
      setSearchMessage("Search failed. Check your internet and try again.");
    } finally {
      setSearching(false);
    }
  }

  function handlePickResult(item: SearchResult) {
    setMoveTo({ lat: item.lat, lng: item.lng, id: Date.now() });
    setResults([]);
    setSearchMessage("Now tap the exact door on the map.");
  }

  function openFullMap() {
    setError("");
    setResults([]);
    setSearchMessage("");
    if (lat !== null && lng !== null) {
      setFullStart({ lat, lng });
    } else {
      setFullStart(null);
    }
    setFullMap(true);
  }

  function closeFullMap() {
    setFullMap(false);
    setMoveTo(null);
    setResults([]);
    setSearchMessage("");
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
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.input, styles.searchInput]}
              placeholder="Search a street or landmark"
              placeholderTextColor={colors.mutedText}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <Pressable
              style={[styles.searchButton, searching && styles.buttonBusy]}
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.mapActionText}>Search</Text>
              )}
            </Pressable>
          </View>

          {searchMessage !== "" && (
            <Text style={styles.searchMessage}>{searchMessage}</Text>
          )}

          {results.length > 0 && (
            <ScrollView
              style={styles.resultsBox}
              keyboardShouldPersistTaps="handled"
            >
              {results.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.resultItem}
                  onPress={() => handlePickResult(item)}
                >
                  <Text style={styles.resultText} numberOfLines={2}>
                    {item.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <PinMap
            onPick={handlePick}
            flyTo={flyTo}
            moveTo={moveTo}
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
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
  },
  searchButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 92,
  },
  searchMessage: {
    color: colors.mutedText,
    fontSize: 14,
    marginBottom: 8,
  },
  resultsBox: {
    maxHeight: 190,
    flexGrow: 0,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: 10,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  resultText: {
    fontSize: 14,
    color: colors.text,
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