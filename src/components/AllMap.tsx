import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Place } from "../store";
import { colors } from "../theme";
import { LEAFLET_CSS, LEAFLET_JS } from "./leafletAssets";

type Props = {
  places: Place[];
  onOpen: (id: string) => void;
};

function buildHtml(places: Place[]) {
  const data = places
    .filter(
      (place) =>
        typeof place.lat === "number" && typeof place.lng === "number"
    )
    .map((place) => ({
      id: place.id,
      name: place.name,
      note: place.note,
      lat: place.lat,
      lng: place.lng,
      done: place.done,
    }));
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>${LEAFLET_CSS}</style>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; }
  body { touch-action: none; -webkit-user-select: none; user-select: none; }
  .leaflet-touch .leaflet-bar a {
    width: 48px !important;
    height: 48px !important;
    line-height: 48px !important;
  }
  .leaflet-touch .leaflet-control-zoom-in,
  .leaflet-touch .leaflet-control-zoom-out {
    font-size: 26px !important;
  }
  .leaflet-control-zoom {
    margin-left: 12px !important;
    margin-top: 12px !important;
  }
</style>
</head>
<body>
<div id="map"></div>
<script>${LEAFLET_JS}</script>
<script>
  var places = ${json};
  var map = L.map("map", {
    bounceAtZoomLimits: false,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
    inertiaDeceleration: 6000
  }).setView([9.03, 38.74], 12);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    updateWhenIdle: false,
    updateWhenZooming: false,
    updateInterval: 100,
    keepBuffer: 4,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  function makeIcon(done) {
    var fill = done ? "#B9A98C" : "#7F011F";
    return L.divIcon({
      className: "",
      html: '<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg"><path d="M17 0C7.6 0 0 7.6 0 17c0 12.5 17 27 17 27s17-14.5 17-27C34 7.6 26.4 0 17 0z" fill="' + fill + '"/><circle cx="17" cy="17" r="7" fill="#F5EBD0"/></svg>',
      iconSize: [34, 44],
      iconAnchor: [17, 44],
      popupAnchor: [0, -40]
    });
  }

  var bounds = [];
  places.forEach(function (p) {
    var marker = L.marker([p.lat, p.lng], { icon: makeIcon(p.done) }).addTo(map);

    var box = document.createElement("div");
    var title = document.createElement("div");
    title.style.fontWeight = "bold";
    title.style.fontSize = "15px";
    title.textContent = p.name;
    box.appendChild(title);

    if (p.note) {
      var note = document.createElement("div");
      note.style.margin = "4px 0 8px 0";
      note.textContent = p.note;
      box.appendChild(note);
    }

    var button = document.createElement("button");
    button.textContent = "Open details";
    button.style.background = "#7F011F";
    button.style.color = "#F5EBD0";
    button.style.border = "none";
    button.style.borderRadius = "8px";
    button.style.padding = "8px 12px";
    button.style.fontSize = "14px";
    button.onclick = function () {
      window.ReactNativeWebView.postMessage(JSON.stringify({ open: p.id }));
    };
    box.appendChild(button);

    marker.bindPopup(box);
    bounds.push([p.lat, p.lng]);
  });

  if (bounds.length === 1) {
    map.setView(bounds[0], 16);
  } else if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
  }
</script>
</body>
</html>
`;
}

export default function AllMap({ places, onOpen }: Props) {
  const source = useMemo(() => ({ html: buildHtml(places) }), [places]);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (typeof data.open === "string") {
        onOpen(data.open);
      }
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
        androidLayerType="hardware"
        cacheEnabled
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        overScrollMode="never"
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