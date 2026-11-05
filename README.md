# yawmi-releases

Android builds of «يومي». When the app opens it reads
`https://raw.githubusercontent.com/mode11h19-cell/yawmi-releases/main/latest.json` and, if `versionCode` is higher
than its own, offers the update in-app.

- `yawmi.apk`: the current build, always signed with the same key.
- `latest.json`: `versionCode`, `versionName`, `url` (raw link to `yawmi.apk`), `sha256` (checked before installing), `notes`.

To publish: replace both files in one commit on `main`. Source and build kit live in the project files (`yawmi/android`).
