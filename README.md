# Medresha (መድረሻ)

**Save the exact door. Find it again anytime.**

Medresha is a simple Android app for delivery people in Addis Ababa. Addis has few street addresses, so drivers often hear "blue gate, behind the pharmacy" and get lost. Medresha works like a notebook with a map: drop a pin on the exact door, write a short note, and find it again next time.

## What it does

- Save a place with a name, a note, and a pin on the map
- See all your places in one list, with Pending and Done counts
- Open a place to see its note and its pin on the map
- Mark a place as Done, or delete it
- Places are saved on the phone, so no account or server is needed

## Built with

- React Native and Expo (Expo Router, TypeScript)
- AsyncStorage for saving data on the phone
- Leaflet and OpenStreetMap inside a WebView for the map
- EAS Build for the Android APK

## Run it on your computer

1. Install the tools: `npm install`
2. Start the app: `npx expo start --tunnel`
3. Open the link in the Expo Go app on your phone

## Status

Work in progress. The first Android APK works on a real phone. Next: logo and icon, a landing page, and a "Use my location" button.

## Credits

Map data from OpenStreetMap contributors.

## Rights

Copyright 2026 Kaleb Dawit. All rights reserved.