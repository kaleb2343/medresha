import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { colors } from "../theme";
import { LEAFLET_CSS, LEAFLET_JS } from "./leafletAssets";

type Props = {
  onPick?: (lat: number, lng: number) => void;
  lat?: number | null;
  lng?: number | null;
  readOnly?: boolean;
};

function buildHtml(lat: number | null, lng: number | null, readOnly: boolean) {
  const hasPin = lat !== null && lng !== null;
  const centerLat = lat ?? 9.03;
  const centerLng = lng ?? 38.74;
  const zoom = hasPin ? 16 : 13;

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>${LEAFLET_CSS}</style>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; }
</style>
</head>
<body>
<div id="map"></div>
<script>${LEAFLET_JS}</script>
<script>
  var readOnly = ${readOnly};
  var map = L.map("map").setView([${centerLat}, ${centerLng}], ${zoom});
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  var pinIcon = L.divIcon({
    className: "",
    html: '<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg"><path d="M17 0C7.6 0 0 7.6 0 17c0 12.5 17 27 17 27s17-14.5 17-27C34 7.6 26.4 0 17 0z" fill="#7F011F"/><circle cx="17" cy="17" r="7" fill="#F5EBD0"/></svg>',
    iconSize: [34, 44],
    iconAnchor: [17, 44]
  });

  var marker = null;
  if (${hasPin}) {
    marker = L.marker([${centerLat}, ${centerLng}], { icon: pinIcon }).addTo(map);
  }

  map.on("click", function (e) {
    if (readOnly) {
      return;
    }
    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker(e.latlng, { icon: pinIcon }).addTo(map);
    }
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng })
    );
  });
</script>
</body>
</html>
`;
}

export default function PinMap({
  onPick,
  lat = null,
  lng = null,
  readOnly = false,
}: Props) {
  const source = useMemo(
    () => ({ html: buildHtml(lat, lng, readOnly) }),
    [lat, lng, readOnly]
  );

  function handleMessage(event: WebViewMessageEvent) {
    if (readOnly || !onPick) return;
    try {
      const data = JSON.parse(event.nativeEvent.data);
      onPick(data.lat, data.lng);
    } catch {
      // ignore bad messages
    }
  }

  return (
    <View style={styles.box}>
      <WebView
        originWhitelist={["*"]}
        source={source}
        onMessage={handleMessage}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    minHeight: 180,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.card,
  },
  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: colors.mutedText,
  },
});