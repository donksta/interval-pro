# Interval Pro — personal iPhone Tabata timer

A free, no-account, no-advertising interval timer designed as an installable web app (PWA). It is designed to be added to the iPhone Home Screen from Safari.

## Features
- Classic Tabata and HIIT presets
- Adjustable preparation, work, rest, rounds, sets and between-set rest
- Circular countdown, start/pause, reset and skip
- Optional spoken cues and sound beeps
- Saved workout presets and local workout history
- Offline caching after first load
- Dark, gym-friendly layout

## Important iPhone notes
- iOS does not let a normal website guarantee uninterrupted timers while suspended or locked. For best reliability, keep Interval Pro open and the screen awake during a workout.
- Voice and audio playback are subject to iOS Safari audio policies. Tap Start once to enable audio.
- Workout data is stored locally in the browser on this device. Clearing Safari website data can erase it.
- This PWA is free and has no subscriptions, ads, trial, login or analytics.

## Run on Windows for testing
You can test locally on your PC:
1. Install Python 3 if needed.
2. Open PowerShell in this folder.
3. Run: `python -m http.server 8000`
4. Open `http://localhost:8000` in your PC browser.

## Put it on your iPhone
To install on iPhone, the app must be served over HTTPS:
1. Create a free GitHub account if you do not already have one.
2. Create a new public repository named `interval-pro`.
3. Upload all files and folders from this project to the repository root.
4. In GitHub, open **Settings → Pages**.
5. Under Build and deployment, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
6. Wait for GitHub Pages to publish the site. Open the published HTTPS address on your iPhone in **Safari**.
7. Tap **Share → Add to Home Screen → Add**.

This is a personal-use PWA, not an App Store binary. A native App Store app would require a Mac/Xcode build and Apple's distribution process.
