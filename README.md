# yawmi-releases

Android builds of «يومي». The app checks
`releases/latest/download/latest.json` when it opens and offers the update in-app.

Each release has two assets: `yawmi.apk` (signed with the same key every time) and `latest.json`
(`versionCode`, `versionName`, `url`, `sha256`, `notes`). Source and build kit live in the project files (`yawmi/android`).
