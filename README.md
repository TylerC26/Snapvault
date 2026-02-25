# SnapVault – Wedding Photo Sharing Gallery

A super simple wedding photo sharing app. Guests can upload photos from their phones right after the event, and everyone can view shared photos in real-time. No user accounts, no logins.

## Tech Stack

- **Frontend:** React + Vite, React Router
- **Backend:** Firebase (Storage + Firestore)
- **Real-time:** Firestore `onSnapshot` listeners
- **Styling:** Tailwind CSS v4
- **Deploy:** Vercel or Firebase Hosting

---

## Firebase Setup

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g. "SnapVault")
3. Enable **Google Analytics** (optional)

### 2. Enable Authentication

1. **Build → Authentication → Get started**
2. **Sign-in method** → Enable **Anonymous**

### 3. Create Firestore Database

1. **Build → Firestore Database → Create database**
2. Start in **test mode** for development (then lock down; see Security Rules below)
3. Choose a region near your users

### 4. Enable Storage

1. **Build → Storage → Get started**
2. Start in **test mode** for development

### 5. Register the web app and get config

1. **Project Settings (gear) → General**
2. Under "Your apps", click the **Web** icon (`</>`)
3. Register app, nickname "SnapVault Web"
4. Copy the `firebaseConfig` object

### 6. Add config to the project

Create a `.env` file in the project root:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Or copy `.env.example` and fill in your values.

---

## Security Rules

Set these manually in Firebase Console after setup.

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventCode}/photos/{photoId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{eventCode}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Local Development

```bash
npm install
npm run dev
```

- App runs at `http://localhost:5173`
- Test code: **TESTWEDDING** (hardcoded in `src/components/EventCodeEntry.jsx`)

To add more event codes, edit `VALID_CODES` in `EventCodeEntry.jsx`. In production, you’d typically store valid codes in Firestore.

---

## Build

```bash
npm run build
```

Output is in `dist/`.

---

## Deployment

### Vercel

1. Push the project to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add env vars: `VITE_FIREBASE_*` keys
4. Deploy (Vercel detects Vite and uses `vercel.json` for SPA routing)

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Init: `firebase init hosting`
   - Public directory: `dist`
   - Single-page app: Yes
   - Don’t overwrite `firebase.json` if it exists
4. Add env vars via a build step (e.g. GitHub Actions) or a `.env.production` committed for Firebase (not ideal; prefer CI secrets)
5. Build and deploy:

```bash
npm run build
firebase deploy
```

---

## Project Structure

```
src/
  components/
    EventCodeEntry.jsx   # Entry screen – enter wedding code
    EventGallery.jsx     # Main gallery – upload + grid + filter
    PhotoUpload.jsx      # Drag-and-drop upload, progress, caption, tags
    PhotoGrid.jsx        # Masonry grid + modal
    PhotoModal.jsx       # Full-screen photo view
  constants/
    tags.js              # Predefined wedding tags
  firebase.js            # Firebase init, auth, db, storage
  utils/
    imageCompression.js  # Client-side image compression
  App.jsx                # Routes
  main.jsx
```

---

## Features

- Event access via code (e.g. `/event/ABC123`)
- Mobile-friendly upload (drag-and-drop, multiple files)
- Upload progress per photo
- Optional caption per upload batch
- **Tagging**: Select tags when uploading (e.g. Ceremony, Reception, First Dance); filter gallery by tag
- Real-time gallery (new photos appear without refresh)
- Full-screen modal for viewing photos
- Client-side image compression before upload
- Photo count display
- Refresh button
- **Delete photos** (password-protected)

---

## Firestore Photo Schema

Each document in `events/{code}/photos` has:

| Field        | Type     | Description                         |
|--------------|----------|-------------------------------------|
| `url`        | string   | Storage download URL                 |
| `storagePath`| string?  | Storage path (for delete)            |
| `guestName`  | string?  | Name of uploader (optional)          |
| `caption`    | string?  | Optional caption                     |
| `tags`       | string[] | Array of tag names (optional)         |
| `timestamp`  | Timestamp| Upload time                          |

### Delete protection

Add `VITE_DELETE_PASSWORD` to `.env` to enable photo deletion. The host/couple sets this password; only users who enter it can delete photos.
# Snapvault
# Snapvault
# Snapvault
