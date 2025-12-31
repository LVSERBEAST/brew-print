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
  User as FirebaseUser,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import type { User, UserPreferences, UserStats } from '@core/models';

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultWaterTemp: 93,
  defaultRatio: 16,
  theme: 'system',
  measurementSystem: 'metric',
};

const DEFAULT_STATS: UserStats = {
  totalBrews: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastBrewDate: null,
  averageRating: 0,
  totalBeans: 0,
  totalEquipment: 0,
  totalMethods: 0,
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

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
      } else {
        this._userProfile.set(null);
      }

      this._loading.set(false);
    });
  }

  private async loadUserProfile(firebaseUser: FirebaseUser): Promise<void> {
    try {
      const userDoc = await getDoc(
        doc(this.firestore, 'users', firebaseUser.uid)
      );

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
      displayName:
        firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      photoURL: firebaseUser.photoURL,
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: DEFAULT_PREFERENCES,
      stats: DEFAULT_STATS,
    };

    await setDoc(doc(this.firestore, 'users', firebaseUser.uid), user);
    return user;
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const credential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      await this.loadUserProfile(credential.user);
      this.router.navigate(['/']);
    } catch (err: any) {
      this._error.set(this.getErrorMessage(err.code));
      this._loading.set(false);
      throw err;
    }
  }

  async signUpWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const credential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      await updateProfile(credential.user, { displayName });
      await this.loadUserProfile(credential.user);
      this.router.navigate(['/']);
    } catch (err: any) {
      this._error.set(this.getErrorMessage(err.code));
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
    } catch (err: any) {
      this._error.set(this.getErrorMessage(err.code));
      this._loading.set(false);
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
    this._userProfile.set(null);
    this.router.navigate(['/auth/login']);
  }

  async updatePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    const user = this._userProfile();
    if (!user) return;

    const updated: User = {
      ...user,
      preferences: { ...user.preferences, ...preferences },
      updatedAt: new Date(),
    };

    await setDoc(doc(this.firestore, 'users', user.id), updated, {
      merge: true,
    });
    this._userProfile.set(updated);
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
    };

    return messages[code] || 'An error occurred. Please try again.';
  }
}
