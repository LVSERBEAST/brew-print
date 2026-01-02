import { Injectable, inject, computed } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  Timestamp,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import {
  Equipment,
  Bean,
  BrewMethod,
  BrewLog,
  BrewFilters,
  PaginationParams,
} from '@core/models/models';
import { sanitizeForFirestore } from '@shared/utils/utils';

type CollectionName = 'beans' | 'equipment' | 'brewMethods' | 'brewLogs';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private userId = computed(() => this.authService.currentUser()?.id);

  // ============================================================================
  // GENERIC CRUD OPERATIONS
  // ============================================================================

  private getCollectionRef(collectionName: CollectionName) {
    return collection(this.firestore, collectionName);
  }

  private getDocRef(collectionName: CollectionName, docId: string) {
    return doc(this.firestore, collectionName, docId);
  }

  private async create<T extends Record<string, unknown>>(
    collectionName: CollectionName,
    data: T
  ): Promise<string> {
    const uid = this.userId();
    if (!uid) throw new Error('User not authenticated');

    const sanitized = sanitizeForFirestore(data);
    const docData = {
      ...sanitized,
      userId: uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(this.getCollectionRef(collectionName), docData);
    return docRef.id;
  }

  private async update<T extends Record<string, unknown>>(
    collectionName: CollectionName,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    const sanitized = sanitizeForFirestore(data as Record<string, unknown>);
    const docRef = this.getDocRef(collectionName, docId);
    await updateDoc(docRef, {
      ...sanitized,
      updatedAt: Timestamp.now(),
    });
  }

  private async delete(
    collectionName: CollectionName,
    docId: string
  ): Promise<void> {
    await deleteDoc(this.getDocRef(collectionName, docId));
  }

  private async getOne<T>(
    collectionName: CollectionName,
    docId: string
  ): Promise<T | null> {
    const docSnap = await getDoc(this.getDocRef(collectionName, docId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as T;
  }

  private async getMany<T>(
    collectionName: CollectionName,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    const uid = this.userId();
    if (!uid) throw new Error('User not authenticated');

    const q = query(
      this.getCollectionRef(collectionName),
      where('userId', '==', uid),
      ...constraints
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  }

  // ============================================================================
  // EQUIPMENT
  // ============================================================================

  async createEquipment(
    data: Omit<Equipment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    return this.create<Record<string, unknown>>(
      'equipment',
      data as unknown as Record<string, unknown>
    );
  }

  async updateEquipment(id: string, data: Partial<Equipment>): Promise<void> {
    return this.update('equipment', id, data as Record<string, unknown>);
  }

  async deleteEquipment(id: string): Promise<void> {
    return this.delete('equipment', id);
  }

  async getEquipment(id: string): Promise<Equipment | null> {
    return this.getOne<Equipment>('equipment', id);
  }

  async getAllEquipment(includeArchived = false): Promise<Equipment[]> {
    const constraints: QueryConstraint[] = [orderBy('name', 'asc')];
    if (!includeArchived) {
      constraints.unshift(where('archived', '==', false));
    }
    return this.getMany<Equipment>('equipment', constraints);
  }

  async getEquipmentByCategory(category: string): Promise<Equipment[]> {
    return this.getMany<Equipment>('equipment', [
      where('category', '==', category),
      where('archived', '==', false),
      orderBy('name', 'asc'),
    ]);
  }

  // ============================================================================
  // BEANS
  // ============================================================================

  async createBean(
    data: Omit<Bean, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    return this.create<Record<string, unknown>>(
      'beans',
      data as unknown as Record<string, unknown>
    );
  }

  async updateBean(id: string, data: Partial<Bean>): Promise<void> {
    return this.update('beans', id, data as Record<string, unknown>);
  }

  async deleteBean(id: string): Promise<void> {
    return this.delete('beans', id);
  }

  async getBean(id: string): Promise<Bean | null> {
    return this.getOne<Bean>('beans', id);
  }

  async getAllBeans(includeArchived = false): Promise<Bean[]> {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    if (!includeArchived) {
      constraints.unshift(where('archived', '==', false));
    }
    return this.getMany<Bean>('beans', constraints);
  }

  async getActiveBeans(): Promise<Bean[]> {
    return this.getMany<Bean>('beans', [
      where('archived', '==', false),
      orderBy('createdAt', 'desc'),
    ]);
  }

  // ============================================================================
  // BREW METHODS
  // ============================================================================

  async createBrewMethod(
    data: Omit<BrewMethod, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    return this.create<Record<string, unknown>>(
      'brewMethods',
      data as unknown as Record<string, unknown>
    );
  }

  async updateBrewMethod(id: string, data: Partial<BrewMethod>): Promise<void> {
    return this.update('brewMethods', id, data as Record<string, unknown>);
  }

  async deleteBrewMethod(id: string): Promise<void> {
    return this.delete('brewMethods', id);
  }

  async getBrewMethod(id: string): Promise<BrewMethod | null> {
    return this.getOne<BrewMethod>('brewMethods', id);
  }

  async getAllBrewMethods(includeArchived = false): Promise<BrewMethod[]> {
    const constraints: QueryConstraint[] = [orderBy('name', 'asc')];
    if (!includeArchived) {
      constraints.unshift(where('archived', '==', false));
    }
    return this.getMany<BrewMethod>('brewMethods', constraints);
  }

  // ============================================================================
  // BREW LOGS
  // ============================================================================

  async createBrewLog(
    data: Omit<BrewLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const id = await this.create<Record<string, unknown>>(
      'brewLogs',
      data as unknown as Record<string, unknown>
    );

    // Update bean weight remaining
    for (const beanId of data.beanIds) {
      const bean = await this.getBean(beanId);
      if (bean && bean.weightRemaining !== undefined) {
        const coffeePerBean = data.params.coffeeGrams / data.beanIds.length;
        await this.updateBean(beanId, {
          weightRemaining: Math.max(0, bean.weightRemaining - coffeePerBean),
        });
      }
    }

    await this.updateUserStats();
    return id;
  }

  async updateBrewLog(id: string, data: Partial<BrewLog>): Promise<void> {
    return this.update('brewLogs', id, data as Record<string, unknown>);
  }

  async deleteBrewLog(id: string): Promise<void> {
    await this.delete('brewLogs', id);
    await this.updateUserStats();
  }

  async getBrewLog(id: string): Promise<BrewLog | null> {
    return this.getOne<BrewLog>('brewLogs', id);
  }

  async getBrewLogs(
    filters: BrewFilters = {},
    pagination?: PaginationParams
  ): Promise<BrewLog[]> {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

    if (filters.beanId) {
      constraints.push(where('beanIds', 'array-contains', filters.beanId));
    }

    if (filters.brewMethodId) {
      constraints.push(where('brewMethodId', '==', filters.brewMethodId));
    }

    if (filters.minRating) {
      constraints.push(where('rating', '>=', filters.minRating));
    }

    if (pagination?.limit) {
      constraints.push(limit(pagination.limit));
    }

    if (pagination?.startAfter) {
      constraints.push(startAfter(pagination.startAfter));
    }

    return this.getMany<BrewLog>('brewLogs', constraints);
  }

  async getBrewLogsByBean(beanId: string): Promise<BrewLog[]> {
    return this.getMany<BrewLog>('brewLogs', [
      where('beanIds', 'array-contains', beanId),
      orderBy('createdAt', 'desc'),
    ]);
  }

  async getBrewLogsByEquipment(equipmentId: string): Promise<BrewLog[]> {
    return this.getMany<BrewLog>('brewLogs', [
      where('equipmentIds', 'array-contains', equipmentId),
      orderBy('createdAt', 'desc'),
    ]);
  }

  async getBrewLogsByBrewMethod(brewMethodId: string): Promise<BrewLog[]> {
    return this.getMany<BrewLog>('brewLogs', [
      where('brewMethodId', '==', brewMethodId),
      orderBy('createdAt', 'desc'),
    ]);
  }

  async getRecentBrewLogs(count: number = 10): Promise<BrewLog[]> {
    return this.getMany<BrewLog>('brewLogs', [
      orderBy('createdAt', 'desc'),
      limit(count),
    ]);
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  private async updateUserStats(): Promise<void> {
    const uid = this.userId();
    if (!uid) return;

    const brewLogs = await this.getBrewLogs();
    const beans = await this.getAllBeans(true);
    const equipment = await this.getAllEquipment(true);
    const brewMethods = await this.getAllBrewMethods(true);

    const { currentStreak, longestStreak, lastBrewDate } =
      this.calculateStreak(brewLogs);

    const ratings = brewLogs.map((b) => b.rating).filter((r) => r > 0);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    const userRef = doc(this.firestore, 'users', uid);
    await updateDoc(userRef, {
      'stats.totalBrews': brewLogs.length,
      'stats.currentStreak': currentStreak,
      'stats.longestStreak': longestStreak,
      'stats.lastBrewDate': lastBrewDate,
      'stats.averageRating': Math.round(averageRating * 10) / 10,
      'stats.totalBeans': beans.length,
      'stats.totalEquipment': equipment.length,
      'stats.totalBrewMethods': brewMethods.length,
      updatedAt: Timestamp.now(),
    });
  }

  private calculateStreak(brewLogs: BrewLog[]): {
    currentStreak: number;
    longestStreak: number;
    lastBrewDate: Timestamp | null;
  } {
    if (brewLogs.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastBrewDate: null };
    }

    // Sort by date descending using Timestamp comparison
    const sorted = [...brewLogs].sort((a, b) => {
      const aTime =
        a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const bTime =
        b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    const lastBrewDate = sorted[0].createdAt;

    // Get unique dates (day level)
    const uniqueDates = [
      ...new Set(
        sorted.map((log) => {
          const d =
            log.createdAt instanceof Timestamp
              ? log.createdAt.toDate()
              : new Date();
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      ),
    ];

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const checkStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;

      if (uniqueDates.includes(checkStr)) {
        currentStreak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = currentStreak;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diffDays = Math.floor(
        (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return { currentStreak, longestStreak, lastBrewDate };
  }

  async getBrewStatistics() {
    const brewLogs = await this.getBrewLogs();
    const beans = await this.getAllBeans();
    const equipment = await this.getAllEquipment();
    const brewMethods = await this.getAllBrewMethods();

    // Rating distribution
    const ratingDistribution: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) {
      ratingDistribution[i] = brewLogs.filter(
        (b) => Math.ceil(b.rating) === i
      ).length;
    }

    // Brews by day (last 30 days)
    const brewsByDay: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = brewLogs.filter((log) => {
        const logDate =
          log.createdAt instanceof Timestamp
            ? log.createdAt.toDate()
            : new Date();
        return logDate.toISOString().split('T')[0] === dateStr;
      }).length;
      brewsByDay.push({ date: dateStr, count });
    }

    // Top beans
    const beanCounts = new Map<string, number>();
    brewLogs.forEach((log) => {
      log.beanIds.forEach((beanId) => {
        beanCounts.set(beanId, (beanCounts.get(beanId) || 0) + 1);
      });
    });
    const topBeans = [...beanCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([beanId, count]) => ({
        beanId,
        name: beans.find((b) => b.id === beanId)?.name || 'Unknown',
        count,
      }));

    // Top equipment
    const equipCounts = new Map<string, number>();
    brewLogs.forEach((log) => {
      log.equipmentIds.forEach((equipmentId) => {
        equipCounts.set(equipmentId, (equipCounts.get(equipmentId) || 0) + 1);
      });
    });
    const topEquipment = [...equipCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([equipmentId, count]) => ({
        equipmentId,
        name: equipment.find((e) => e.id === equipmentId)?.name || 'Unknown',
        count,
      }));

    // Top brew methods
    const methodCounts = new Map<string, number>();
    brewLogs.forEach((log) => {
      if (log.brewMethodId) {
        methodCounts.set(
          log.brewMethodId,
          (methodCounts.get(log.brewMethodId) || 0) + 1
        );
      }
    });
    const topBrewMethods = [...methodCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([brewMethodId, count]) => ({
        brewMethodId,
        name: brewMethods.find((m) => m.id === brewMethodId)?.name || 'Unknown',
        count,
      }));

    // Average brew params
    const avgParams = brewLogs.reduce(
      (acc, log) => {
        acc.coffeeGrams += log.params.coffeeGrams;
        acc.waterGrams += log.params.waterGrams;
        acc.ratio += log.params.ratio;
        acc.brewTimeSeconds += log.params.brewTimeSeconds || 0;
        return acc;
      },
      { coffeeGrams: 0, waterGrams: 0, ratio: 0, brewTimeSeconds: 0 }
    );

    const count = brewLogs.length || 1;

    return {
      totalBrews: brewLogs.length,
      averageRating:
        brewLogs.length > 0
          ? brewLogs.reduce((a, b) => a + b.rating, 0) / brewLogs.length
          : 0,
      ratingDistribution,
      brewsByDay,
      topBeans,
      topEquipment,
      topBrewMethods,
      averageBrewParams: {
        coffeeGrams: Math.round((avgParams.coffeeGrams / count) * 10) / 10,
        waterGrams: Math.round(avgParams.waterGrams / count),
        ratio: Math.round((avgParams.ratio / count) * 10) / 10,
        brewTimeSeconds: Math.round(avgParams.brewTimeSeconds / count),
      },
    };
  }
}
