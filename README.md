# Medresha (መድረሻ)

**Save the exact door. Find it again anytime.**

Medresha is a simple Android app for delivery people in Addis Ababa. Addis has few street addresses, so drivers often hear "blue gate, behind the pharmacy" and get lost. Medresha works like a notebook with a map: drop a pin on the exact door, write a short note, and find it again next time.

## What it does

- Save a place with a name, a note, an optional phone number, and a pin on the map
- Drop the pin with one tap, or use your phone's location and see how accurate it is
- Open a full-screen map to place the pin on the exact door, and search for a street or landmark
- See all your places in one list, with Pending and Done counts
- See all your places together on one map, with your own position as a blue dot
- Open a place to see its note and pin, then call the number, open it in Google Maps, or share it
- Edit a place, mark it as Done, or delete it
- Places are saved on the phone, so no account or server is needed

## Built with

- React Native and Expo (Expo Router, TypeScript)
- AsyncStorage for saving data on the phone
- Expo Location for the "Use my location" button
- Leaflet and OpenStreetMap inside a WebView for the map
- EAS Build for the Android APK

## Run it on your computer

1. Install the tools: `npm install`
2. Start the app: `npx expo start` (add `--tunnel` if your phone is on a different network)
3. Open the link in the Expo Go app on your phone

## Status

Work in progress. The Android APK works on a real phone. Next: the final logo and icon, a landing page, and a public download.

## Credits

Map data and place search from OpenStreetMap contributors. Map display by Leaflet.

## Rights

Copyright 2026 Kaleb Dawit. All rights reserved.