<p align="center">
  <img src="landing/favicon.svg" alt="Medresha logo" width="96" />
</p>

# Medresha (መድረሻ)

**Save the exact door. Find it again anytime.**

Medresha is a simple, free Android app for delivery people in Addis Ababa. Addis has few street addresses, so drivers often hear "blue gate, behind the pharmacy" and get lost. Medresha works like a notebook with a map: drop a pin on the exact door, write a short note, and find it again next time.

**[Download the Android app](https://github.com/kaleb2343/medresha/releases/latest/download/medresha.apk)** · **[Visit the website](https://medresha.vercel.app)** · [All releases](https://github.com/kaleb2343/medresha/releases)

## What it does

- Save a place with a name, a note, an optional phone number, and a pin on the map
- Drop the pin with one tap, or use your phone's location and see how accurate it is
- Open a full-screen map to place the pin on the exact door, and search for a street or landmark
- See all your places in one list, with Pending and Done counts
- See all your places together on one map, with your own position as a blue dot
- Open a place to see its note and pin, then call the number, open it in Google Maps, or share it
- Edit a place, mark it as Done, or delete it
- Places are saved on the phone, so no account or server is needed

## Install (Android)

1. Download `medresha.apk` from the link above (about 23 MB).
2. Open the file. If Android asks, allow installing from your browser.
3. If Google Play Protect shows a warning, tap **More details**, then **Install anyway**. The app is new and not on the Play Store yet.
4. Open Medresha and tap **+** to save your first place.

## Built with

- React Native and Expo (Expo Router, TypeScript)
- AsyncStorage for saving data on the phone
- Expo Location for the "Use my location" button
- Leaflet and OpenStreetMap inside a WebView for the map
- EAS Build for the Android APK
- Plain HTML and CSS for the landing page (`landing/`), hosted on Vercel

## Run it on your computer

1. Install the tools: `npm install`
2. Start the app: `npx expo start` (add `--tunnel` if your phone is on a different network, or `--lan` if both are on the same Wi-Fi)
3. Open the link in the Expo Go app on your phone

## Status 

Version 1.0.0 is out. The Android APK works on real phones, with the final logo and icon.
   
## Credits

Map data and place search from OpenStreetMap contributors. Map display by Leaflet.

## Rights

Copyright 2026 Kaleb Dawit. All rights reserved.