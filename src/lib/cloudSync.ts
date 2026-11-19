import { deleteApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  getFirestore,
  onSnapshot,
  runTransaction,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { FirebaseWebConfig } from './firebaseConfig';
import {
  PricingConfigSchema,
  SavedOfferSchema,
  UserProfileSchema,
} from './schemas';
import { PricingConfig, SavedOffer, UserProfile } from '@/types/offer';

export type CloudConnectionState = 'local' | 'connecting' | 'synced' | 'error';

export interface CloudSyncStatus {
  state: CloudConnectionState;
  projectId?: string;
  lastSyncedAt?: string;
  error?: string;
}

const WORKSPACE_COLLECTION = 'workspaces';
const WORKSPACE_ID = 'flexi-home';
const CLOUD_APP_NAME = 'flexi-home-cloud';

let activeDb: Firestore | null = null;
let unsubscribes: Array<() => void> = [];
let currentStatus: CloudSyncStatus = { state: 'local' };

/**
 * Recursively strips `undefined` values because Cloud Firestore rejects
 * documents containing nested properties with value `undefined`.
 */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefined(v);
      }
    }
    return out as T;
  }
  return value;
}

export function getCloudStatusSnapshot(): CloudSyncStatus {
  return currentStatus;
}

export function stopCloudSync(): void {
  for (const unsub of unsubscribes) {
    try {
      unsub();
    } catch {
      // ignore cleanup error
    }
  }
  unsubscribes = [];
  activeDb = null;
  currentStatus = { state: 'local' };
}

export async function pushUserToCloud(user: UserProfile): Promise<boolean> {
  if (!activeDb) return false;
  try {
    await setDoc(
      doc(activeDb, WORKSPACE_COLLECTION, WORKSPACE_ID, 'users', user.id),
      stripUndefined(user)
    );
    return true;
  } catch {
    return false;
  }
}

export async function deleteUserFromCloud(userId: string): Promise<boolean> {
  if (!activeDb) return false;
  try {
    await deleteDoc(
      doc(activeDb, WORKSPACE_COLLECTION, WORKSPACE_ID, 'users', userId)
    );
    return true;
  } catch {
    return false;
  }
}

export async function pushOfferToCloud(offer: SavedOffer): Promise<boolean> {
  if (!activeDb) return false;
  try {
    await setDoc(
      doc(activeDb, WORKSPACE_COLLECTION, WORKSPACE_ID, 'offers', offer.id),
      stripUndefined(offer)
    );
    return true;
  } catch {
    return false;
  }
}

export async function deleteOfferFromCloud(offerId: string): Promise<boolean> {
  if (!activeDb) return false;
  try {
    await deleteDoc(
      doc(activeDb, WORKSPACE_COLLECTION, WORKSPACE_ID, 'offers', offerId)
    );
    return true;
  } catch {
    return false;
  }
}

export async function pushPricingToCloud(
  pricingConfig: PricingConfig
): Promise<boolean> {
  if (!activeDb) return false;
  try {
    await setDoc(
      doc(activeDb, WORKSPACE_COLLECTION, WORKSPACE_ID, 'settings', 'pricing'),
      stripUndefined({
        pricingConfig,
        updatedAt: new Date().toISOString(),
      })
    );
    return true;
  } catch {
    return false;
  }
}

export async function pushCounterToCloud(lastOfferSeq: number): Promise<boolean> {
  if (!activeDb) return false;
  try {
    const safeSeq = Math.max(1, Math.round(lastOfferSeq || 101));
    await setDoc(
      doc(activeDb, WORKSPACE_COLLECTION, WORKSPACE_ID, 'settings', 'counter'),
      {
        lastOfferSeq: safeSeq,
        updatedAt: new Date().toISOString(),
      }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Atomically claims the next sequential offer number (e.g. "26-0102")
 * shared across all team phones via a Firestore transaction.
 */
export async function claimNextCloudOfferNumber(): Promise<string | null> {
  if (!activeDb) return null;
  const counterRef = doc(
    activeDb,
    WORKSPACE_COLLECTION,
    WORKSPACE_ID,
    'settings',
    'counter'
  );
  try {
    const nextSeq = await runTransaction(activeDb, async (tx) => {
      const snap = await tx.get(counterRef);
      const current =
        snap.exists() && typeof snap.data()?.lastOfferSeq === 'number'
          ? snap.data().lastOfferSeq
          : 101;
      const next = Math.max(1, Math.round(current) + 1);
      tx.set(counterRef, {
        lastOfferSeq: next,
        updatedAt: new Date().toISOString(),
      });
      return next;
    });
    const yy = String(new Date().getFullYear()).slice(-2);
    return `${yy}-${String(nextSeq).padStart(4, '0')}`;
  } catch {
    return null;
  }
}

export async function pushFullSnapshotToCloud(payload: {
  users: UserProfile[];
  savedOffers: SavedOffer[];
  pricingConfig: PricingConfig;
  lastOfferSeq: number;
}): Promise<boolean> {
  if (!activeDb) return false;
  try {
    const db = activeDb;
    const nowIso = new Date().toISOString();
    const ops: Array<{ ref: ReturnType<typeof doc>; data: Record<string, unknown> }> = [];

    for (const u of payload.users) {
      ops.push({
        ref: doc(db, WORKSPACE_COLLECTION, WORKSPACE_ID, 'users', u.id),
        data: stripUndefined(u) as unknown as Record<string, unknown>,
      });
    }
    for (const o of payload.savedOffers) {
      ops.push({
        ref: doc(db, WORKSPACE_COLLECTION, WORKSPACE_ID, 'offers', o.id),
        data: stripUndefined(o) as unknown as Record<string, unknown>,
      });
    }
    ops.push({
      ref: doc(db, WORKSPACE_COLLECTION, WORKSPACE_ID, 'settings', 'pricing'),
      data: stripUndefined({
        pricingConfig: payload.pricingConfig,
        updatedAt: nowIso,
      }),
    });
    ops.push({
      ref: doc(db, WORKSPACE_COLLECTION, WORKSPACE_ID, 'settings', 'counter'),
      data: {
        lastOfferSeq: Math.max(1, Math.round(payload.lastOfferSeq || 101)),
        updatedAt: nowIso,
      },
    });

    const CHUNK_SIZE = 400;
    for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
      const batch = writeBatch(db);
      for (const item of ops.slice(i, i + CHUNK_SIZE)) {
        batch.set(item.ref, item.data);
      }
      await batch.commit();
    }
    return true;
  } catch {
    return false;
  }
}

export async function startCloudSync(
  config: FirebaseWebConfig,
  seedData: {
    users: UserProfile[];
    savedOffers: SavedOffer[];
    pricingConfig: PricingConfig;
    lastOfferSeq: number;
  },
  callbacks: {
    onUsers: (users: UserProfile[]) => void;
    onOffers: (offers: SavedOffer[]) => void;
    onPricing: (cfg: PricingConfig) => void;
    onCounter: (seq: number) => void;
    onStatus: (status: CloudSyncStatus) => void;
  }
): Promise<() => void> {
  stopCloudSync();

  const updateStatus = (next: CloudSyncStatus) => {
    currentStatus = next;
    callbacks.onStatus(next);
  };

  updateStatus({ state: 'connecting', projectId: config.projectId });

  try {
    const existing = getApps().find((a) => a.name === CLOUD_APP_NAME);
    if (existing) {
      const opts = existing.options;
      if (
        opts.projectId !== config.projectId ||
        opts.apiKey !== config.apiKey
      ) {
        await deleteApp(existing);
      }
    }

    const app =
      getApps().find((a) => a.name === CLOUD_APP_NAME) ||
      initializeApp(config, CLOUD_APP_NAME);
    const db = getFirestore(app);
    const auth = getAuth(app);

    try {
      await signInAnonymously(auth);
    } catch {
      updateStatus({
        state: 'error',
        projectId: config.projectId,
        error: 'Enable Anonymous Sign-In in Firebase Authentication',
      });
      return () => {};
    }

    activeDb = db;

    // Seed cloud workspace if empty on first connect
    const usersCol = collection(db, WORKSPACE_COLLECTION, WORKSPACE_ID, 'users');
    const initialUsersSnap = await getDocs(usersCol);
    if (initialUsersSnap.empty) {
      await pushFullSnapshotToCloud(seedData);
    }

    const markSynced = () => {
      updateStatus({
        state: 'synced',
        projectId: config.projectId,
        lastSyncedAt: new Date().toISOString(),
      });
    };

    const handleSnapError = (err: Error) => {
      updateStatus({
        state: 'error',
        projectId: config.projectId,
        error: err.message,
      });
    };

    const unsubUsers = onSnapshot(
      usersCol,
      (snap) => {
        const validUsers: UserProfile[] = [];
        snap.forEach((docSnap) => {
          const res = UserProfileSchema.safeParse(docSnap.data());
          if (res.success) validUsers.push(res.data);
        });
        if (validUsers.length > 0) {
          callbacks.onUsers(validUsers);
        }
        markSynced();
      },
      handleSnapError
    );

    const offersCol = collection(
      db,
      WORKSPACE_COLLECTION,
      WORKSPACE_ID,
      'offers'
    );
    const unsubOffers = onSnapshot(
      offersCol,
      (snap) => {
        const validOffers: SavedOffer[] = [];
        snap.forEach((docSnap) => {
          const res = SavedOfferSchema.safeParse(docSnap.data());
          if (res.success) validOffers.push(res.data);
        });
        validOffers.sort((a, b) =>
          (b.updatedAt || '').localeCompare(a.updatedAt || '')
        );
        callbacks.onOffers(validOffers);
        markSynced();
      },
      handleSnapError
    );

    const pricingRef = doc(
      db,
      WORKSPACE_COLLECTION,
      WORKSPACE_ID,
      'settings',
      'pricing'
    );
    const unsubPricing = onSnapshot(
      pricingRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const res = PricingConfigSchema.safeParse(data?.pricingConfig);
          if (res.success) {
            callbacks.onPricing(res.data);
          }
        }
        markSynced();
      },
      handleSnapError
    );

    const counterRef = doc(
      db,
      WORKSPACE_COLLECTION,
      WORKSPACE_ID,
      'settings',
      'counter'
    );
    const unsubCounter = onSnapshot(
      counterRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const seq = docSnap.data()?.lastOfferSeq;
          if (typeof seq === 'number' && seq > 0) {
            callbacks.onCounter(seq);
          }
        }
        markSynced();
      },
      handleSnapError
    );

    unsubscribes = [unsubUsers, unsubOffers, unsubPricing, unsubCounter];
    markSynced();

    return () => {
      stopCloudSync();
    };
  } catch (err) {
    updateStatus({
      state: 'error',
      projectId: config.projectId,
      error: err instanceof Error ? err.message : 'Firebase sync error',
    });
    return () => {};
  }
}
