import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  updatePassword,
  updateEmail,
  deleteUser,
  User as FirebaseUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, setDoc, getDoc, deleteDoc, Timestamp } from '@angular/fire/firestore';
import { ThemeService } from './theme.service';
import type { User, UserPreferences, UserStats } from '@core/models/models';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  measurementSystem: 'metric',
  notifications: {
    emailUpdates: true,
    brewReminders: false,
  },
};

const DEFAULT_STATS: UserStats = {
  totalBrews: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastBrewDate: null,
  averageRating: 0,
  totalBeans: 0,
  totalEquipment: 0,
  totalBrewMethods: 0,
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  private _firebaseUser = signal<FirebaseUser | null>(null);
  private _userProfile = signal<User | null>(null);
  private _loading = signal(true);
  private _error = signal<string | null>(null);

  currentUser = computed(() => this._userProfile());
  loading = computed(() => this._loading());
  error = computed(() => this._error());
  isAuthenticated = computed(() => !!this._firebaseUser());

  constructor() {
    authState(this.auth).subscribe(async (user) => {
      this._firebaseUser.set(user);

      if (user) {
        await this.loadUserProfile(user);
        // Apply user's theme preference
        const userProfile = this._userProfile();
        if (userProfile?.preferences?.theme) {
          this.themeService.setTheme(userProfile.preferences.theme);
        }
      } else {
        this._userProfile.set(null);
      }

      this._loading.set(false);
    });
  }

  private async loadUserProfile(firebaseUser: FirebaseUser): Promise<void> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        this._userProfile.set(userDoc.data() as User);
      } else {
        const newUser = await this.createUserProfile(firebaseUser);
        this._userProfile.set(newUser);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      this._error.set('Failed to load user profile');
    }
  }

  private async createUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      photoURL: firebaseUser.photoURL,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      preferences: DEFAULT_PREFERENCES,
      stats: DEFAULT_STATS,
      isAdmin: false,
    };

    await setDoc(doc(this.firestore, 'users', firebaseUser.uid), user);
    return user;
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.loadUserProfile(credential.user);
      this.router.navigate(['/']);
    } catch (err: unknown) {
      const error = err as { code?: string };
      this._error.set(this.getErrorMessage(error.code || ''));
      this._loading.set(false);
      throw err;
    }
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(credential.user, { displayName });
      await this.loadUserProfile(credential.user);
      this.router.navigate(['/']);
    } catch (err: unknown) {
      const error = err as { code?: string };
      this._error.set(this.getErrorMessage(error.code || ''));
      this._loading.set(false);
      throw err;
    }
  }

  async signInWithGoogle(): Promise<void> {
    this._error.set(null);

    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      this._loading.set(true);
      await this.loadUserProfile(credential.user);
      this.router.navigate(['/']);
    } catch (err: unknown) {
      const error = err as { code?: string };
      this._error.set(this.getErrorMessage(error.code || ''));
      this._loading.set(false);
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
    this._userProfile.set(null);
    this.router.navigate(['/auth/login']);
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const user = this._userProfile();
    if (!user) return;

    const updated: User = {
      ...user,
      preferences: { ...user.preferences, ...preferences },
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(this.firestore, 'users', user.id), updated, { merge: true });
    this._userProfile.set(updated);

    // Apply theme if changed
    if (preferences.theme) {
      this.themeService.setTheme(preferences.theme);
    }
  }

  async updateUserProfile(data: { displayName?: string; photoURL?: string }): Promise<void> {
    const firebaseUser = this._firebaseUser();
    const userProfile = this._userProfile();
    if (!firebaseUser || !userProfile) return;

    if (data.displayName) {
      await updateProfile(firebaseUser, { displayName: data.displayName });
    }

    const updated: User = {
      ...userProfile,
      displayName: data.displayName || userProfile.displayName,
      photoURL: data.photoURL !== undefined ? data.photoURL : userProfile.photoURL,
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(this.firestore, 'users', userProfile.id), updated, { merge: true });
    this._userProfile.set(updated);
  }

  async updateUserEmail(newEmail: string, currentPassword: string): Promise<void> {
    const firebaseUser = this._firebaseUser();
    if (!firebaseUser || !firebaseUser.email) throw new Error('Not authenticated');

    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
    await updateEmail(firebaseUser, newEmail);

    const userProfile = this._userProfile();
    if (userProfile) {
      const updated: User = {
        ...userProfile,
        email: newEmail,
        updatedAt: Timestamp.now(),
      };
      await setDoc(doc(this.firestore, 'users', userProfile.id), updated, { merge: true });
      this._userProfile.set(updated);
    }
  }

  async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    const firebaseUser = this._firebaseUser();
    if (!firebaseUser || !firebaseUser.email) throw new Error('Not authenticated');

    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
    await updatePassword(firebaseUser, newPassword);
  }

  async deleteAccount(password: string): Promise<void> {
    const firebaseUser = this._firebaseUser();
    const userProfile = this._userProfile();
    if (!firebaseUser || !firebaseUser.email || !userProfile) throw new Error('Not authenticated');

    const credential = EmailAuthProvider.credential(firebaseUser.email, password);
    await reauthenticateWithCredential(firebaseUser, credential);

    // Delete Firestore user document
    await deleteDoc(doc(this.firestore, 'users', userProfile.id));

    // Delete Firebase Auth user
    await deleteUser(firebaseUser);

    this._userProfile.set(null);
    this.router.navigate(['/auth/login']);
  }

  private getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/weak-password': 'Password is too weak',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-credential': 'Invalid credentials',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/popup-closed-by-user': 'Sign in cancelled',
      'auth/requires-recent-login': 'Please sign in again to perform this action',
    };

    return messages[code] || 'An error occurred. Please try again.';
  }
}
