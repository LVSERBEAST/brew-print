# BrewPrint

Precision coffee tracking app for enthusiasts who want to dial in their perfect brew.

## Tech Stack

- **Framework**: Angular 21.0.0
- **Language**: TypeScript 5.9.0
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting

## Prerequisites

- Node.js 20+
- npm 10+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore, Auth, and Storage enabled

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd brewprint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Update `src/environments/environment.ts` with your Firebase config:
   ```typescript
   export const environment = {
     production: false,
     firebase: {
       apiKey: 'YOUR_API_KEY',
       authDomain: 'YOUR_PROJECT.firebaseapp.com',
       projectId: 'YOUR_PROJECT_ID',
       storageBucket: 'YOUR_PROJECT.appspot.com',
       messagingSenderId: 'YOUR_SENDER_ID',
       appId: 'YOUR_APP_ID',
     },
   };
   ```

   Create `src/environments/environment.prod.ts` with production values.

4. **Run development server**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/`

## Build

```bash
# Development build
npm run build

# Production build
npm run build -- --configuration production
```

## Deploy

### Firebase Hosting

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Initialize Firebase (first time only)**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `dist/brewprint/browser`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

3. **Build for production**
   ```bash
   npm run build -- --configuration production
   ```

4. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

### Quick Deploy (after initial setup)
```bash
npm run build -- --configuration production && firebase deploy --only hosting
```

## Version Management

The app version is stored in `package.json` and displayed in the app via `src/app/shared/constants/constants.ts`.

### Incrementing Version

Use npm's built-in version command:

```bash
# Patch release (0.2.0 → 0.2.1) - bug fixes
npm version patch

# Minor release (0.2.0 → 0.3.0) - new features
npm version minor

# Major release (0.2.0 → 1.0.0) - breaking changes
npm version major
```

### After Version Increment

1. **Update the constants file** (`src/app/shared/constants/constants.ts`):
   ```typescript
   export const APP_VERSION = '0.3.0';  // Match package.json version
   export const APP_VERSION_DISPLAY = `Version ${APP_VERSION} (beta)`;
   ```

2. **Commit the changes**
   ```bash
   git add .
   git commit -m "Bump version to 0.3.0"
   git push
   ```

3. **Tag the release** (optional but recommended)
   ```bash
   git tag v0.3.0
   git push --tags
   ```

### Current Version

**0.2.0 (beta)**

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/         # Route guards
│   │   ├── models/         # TypeScript interfaces
│   │   └── services/       # Angular services
│   ├── features/
│   │   ├── auth/           # Login, Register
│   │   ├── beans/          # Bean CRUD
│   │   ├── brew-logs/      # Brew log CRUD
│   │   ├── dashboard/      # Home dashboard
│   │   ├── equipment/      # Equipment CRUD
│   │   ├── methods/        # Brew method CRUD
│   │   └── profile/        # User profile & settings
│   └── shared/
│       ├── components/     # Shared components (shell)
│       ├── constants/      # App constants
│       ├── pipes/          # Custom pipes
│       ├── ui/             # UI components (button, card, etc.)
│       └── utils/          # Utility functions
├── environments/           # Environment configs
└── styles.scss             # Global styles
```

## Firebase Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /beans/{beanId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    match /equipment/{equipmentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    match /brewMethods/{methodId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    match /brewLogs/{logId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server |
| `npm run build` | Build for development |
| `npm run build -- --configuration production` | Build for production |
| `npm run watch` | Build and watch for changes |
| `npm test` | Run unit tests |
| `npm version patch/minor/major` | Increment version |

## License

Private - All rights reserved.
