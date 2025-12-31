import { Injectable, inject, signal, computed } from '@angular/core';
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
  writeBatch,
  DocumentReference,
  QueryConstraint,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import type {
  Bean,
  Equipment,
  Technique,
  BrewLog,
  PaginationParams,
  BrewLogFilters,
  ID,
} from '@core/models';

type CollectionName = 'beans' | 'equipment' | 'techniques' | 'brewLogs';

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

  private getDocRef(collectionName: CollectionName, docId: ID) {
    return doc(this.firestore, collectionName, docId);
  }

  private async create<T>(
    collectionName: CollectionName,
    data: T
  ): Promise<ID> {
    const uid = this.userId();
    if (!uid) throw new Error('User not authenticated');

    const docData = {
      ...data,
      userId: uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(this.getCollectionRef(collectionName), docData);
    return docRef.id;
  }

  private async update<T>(
    collectionName: CollectionName,
    docId: ID,
    data: Partial<T>
  ): Promise<void> {
    const docRef = this.getDocRef(collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  }

  private async delete(
    collectionName: CollectionName,
    docId: ID
  ): Promise<void> {
    await deleteDoc(this.getDocRef(collectionName, docId));
  }

  private async getOne<T>(
    collectionName: CollectionName,
    docId: ID
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

  async createEquipment(data: Equipment): Promise<ID> {
    return this.create<Equipment>('equipment', data);
  }

  async updateEquipment(id: ID, data: Partial<Equipment>): Promise<void> {
    return this.update('equipment', id, data);
  }

  async deleteEquipment(id: ID): Promise<void> {
    return this.delete('equipment', id);
  }

  async getEquipment(id: ID): Promise<Equipment | null> {
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

  async createBean(data: Bean): Promise<ID> {
    return this.create<Bean>('beans', data);
  }

  async updateBean(id: ID, data: Partial<Bean>): Promise<void> {
    return this.update('beans', id, data);
  }

  async deleteBean(id: ID): Promise<void> {
    return this.delete('beans', id);
  }

  async getBean(id: ID): Promise<Bean | null> {
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
      where('weightRemaining', '>', 0),
      orderBy('weightRemaining', 'desc'),
      orderBy('roastDate', 'desc'),
    ]);
  }

  // ============================================================================
  // TECHNIQUES
  // ============================================================================

  async createTechnique(data: Technique): Promise<ID> {
    return this.create<Technique>('techniques', data);
  }

  async updateTechnique(id: ID, data: Partial<Technique>): Promise<void> {
    return this.update('techniques', id, data);
  }

  async deleteTechnique(id: ID): Promise<void> {
    return this.delete('techniques', id);
  }

  async getTechnique(id: ID): Promise<Technique | null> {
    return this.getOne<Technique>('techniques', id);
  }

  async getAllTechniques(includeArchived = false): Promise<Technique[]> {
    const constraints: QueryConstraint[] = [orderBy('name', 'asc')];
    if (!includeArchived) {
      constraints.unshift(where('archived', '==', false));
    }
    return this.getMany<Technique>('techniques', constraints);
  }

  // ============================================================================
  // BREW LOGS
  // ============================================================================

  async createBrewLog(data: BrewLog): Promise<ID> {
    const id = await this.create<BrewLog>('brewLogs', data);

    // Update bean weight remaining
    for (const beanId of data.beanIds) {
      const bean = await this.getBean(beanId);
      if (bean) {
        const coffeePerBean = data.coffeeGrams / data.beanIds.length;
        await this.updateBean(beanId, {
          weightRemaining: bean.weightRemaining
            ? Math.max(0, bean.weightRemaining - coffeePerBean)
            : undefined,
        });
      }
    }

    // Update user stats
    await this.updateUserStats();

    return id;
  }

  async updateBrewLog(id: ID, data: Partial<BrewLog>): Promise<void> {
    return this.update('brewLogs', id, data);
  }

  async deleteBrewLog(id: ID): Promise<void> {
    await this.delete('brewLogs', id);
    await this.updateUserStats();
  }

  async getBrewLog(id: ID): Promise<BrewLog | null> {
    return this.getOne<BrewLog>('brewLogs', id);
  }

  async getBrewLogs(
    filters: BrewLogFilters = {},
    pagination?: PaginationParams
  ): Promise<BrewLog[]> {
    const constraints: QueryConstraint[] = [orderBy('date', 'desc')];

    if (filters.beanId) {
      constraints.push(where('beanIds', 'array-contains', filters.beanId));
    }

    if (filters.techniqueId) {
      constraints.push(where('techniqueId', '==', filters.techniqueId));
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

  async getBrewLogsByBean(beanId: ID): Promise<BrewLog[]> {
    return this.getMany<BrewLog>('brewLogs', [
      where('beanIds', 'array-contains', beanId),
      orderBy('date', 'desc'),
    ]);
  }

  async getBrewLogsByEquipment(equipmentId: ID): Promise<BrewLog[]> {
    // Note: This requires a different query structure due to nested array
    const allLogs = await this.getBrewLogs();
    return allLogs.filter((log) =>
      log.equipmentUsages.some((eu) => eu.equipmentId === equipmentId)
    );
  }

  async getBrewLogsByTechnique(techniqueId: ID): Promise<BrewLog[]> {
    return this.getMany<BrewLog>('brewLogs', [
      where('techniqueId', '==', techniqueId),
      orderBy('date', 'desc'),
    ]);
  }

  async getRecentBrewLogs(count: number = 10): Promise<BrewLog[]> {
    return this.getMany<BrewLog>('brewLogs', [
      orderBy('date', 'desc'),
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
    const techniques = await this.getAllTechniques(true);

    // Calculate streak
    const { currentStreak, longestStreak, lastBrewDate } =
      this.calculateStreak(brewLogs);

    // Calculate average rating
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
      'stats.totalTechniques': techniques.length,
      updatedAt: new Date(),
    });
  }

  private calculateStreak(brewLogs: BrewLog[]): {
    currentStreak: number;
    longestStreak: number;
    lastBrewDate: Date | null;
  } {
    if (brewLogs.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastBrewDate: null };
    }

    // Sort by date descending
    const sorted = [...brewLogs].sort(
      (a, b) => b.date.getDate() - a.date.getDate()
    );

    const lastBrewDate = sorted[0].date;

    // Get unique dates (day level)
    const uniqueDates = [
      ...new Set(
        sorted.map((log) => {
          const d = new Date(log.date);
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
        // Today doesn't count, check from yesterday
        continue;
      } else {
        break;
      }
    }

    // Calculate longest streak (simplified)
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
    const techniques = await this.getAllTechniques();

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
        const logDate = new Date(log.date).toISOString().split('T')[0];
        return logDate === dateStr;
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
      log.equipmentUsages.forEach((eu) => {
        equipCounts.set(
          eu.equipmentId,
          (equipCounts.get(eu.equipmentId) || 0) + 1
        );
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

    // Top techniques
    const techCounts = new Map<string, number>();
    brewLogs.forEach((log) => {
      if (log.techniqueId) {
        techCounts.set(
          log.techniqueId,
          (techCounts.get(log.techniqueId) || 0) + 1
        );
      }
    });
    const topTechniques = [...techCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([techniqueId, count]) => ({
        techniqueId,
        name: techniques.find((t) => t.id === techniqueId)?.name || 'Unknown',
        count,
      }));

    // Average brew params
    const avgParams = brewLogs.reduce(
      (acc, log) => {
        acc.coffeeGrams += log.coffeeGrams;
        acc.waterGrams += log.waterGrams;
        acc.ratio += log.ratio;
        acc.brewTimeSeconds += log.brewTimeSeconds || 0;
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
      topTechniques,
      averageBrewParams: {
        coffeeGrams: Math.round((avgParams.coffeeGrams / count) * 10) / 10,
        waterGrams: Math.round(avgParams.waterGrams / count),
        ratio: Math.round((avgParams.ratio / count) * 10) / 10,
        brewTimeSeconds: Math.round(avgParams.brewTimeSeconds / count),
      },
    };
  }
}
