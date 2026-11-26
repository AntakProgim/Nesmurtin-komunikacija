import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  getDocFromServer,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Blueprint validation constants (synchronized verbatim with firebase-blueprint.json)
const TEMPLATE_ID_PATTERN = /^[a-zA-Z0-9_\-]+$/;
const TEMPLATE_ID_MAX_LEN = 64;
const USER_ID_MAX_LEN = 128;

export interface TemplateStats {
  templateId: string;
  ratingSum: number;
  ratingCount: number;
  isPublic: boolean;
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export function subscribeTemplateStats(
  onUpdate: (statsMap: Record<string, TemplateStats>) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'templateStats';
  const q = query(collection(db, path), where('isPublic', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const map: Record<string, TemplateStats> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          typeof data.templateId === 'string' &&
          typeof data.ratingSum === 'number' &&
          typeof data.ratingCount === 'number'
        ) {
          map[data.templateId] = {
            templateId: data.templateId,
            ratingSum: data.ratingSum,
            ratingCount: data.ratingCount,
            isPublic: Boolean(data.isPublic)
          };
        }
      });
      onUpdate(map);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export function subscribeUserRatings(
  uid: string,
  onUpdate: (ratingsMap: Record<string, number>) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'templateRatings';
  const q = query(collection(db, path), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const map: Record<string, number> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (typeof data.templateId === 'string' && typeof data.stars === 'number') {
          map[data.templateId] = data.stars;
        }
      });
      onUpdate(map);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function submitTemplateRating(templateId: string, stars: number): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Norėdami įvertinti šabloną, pirmiausia prisijunkite su Google paskyra.');
  }
  if (!user.emailVerified) {
    throw new Error('Jūsų Google paskyros el. paštas nėra patvirtintas.');
  }

  // Defensive blueprint constraint checks
  const cleanTemplateId = templateId.trim();
  const cleanStars = Math.round(stars);
  if (
    !cleanTemplateId ||
    cleanTemplateId.length > TEMPLATE_ID_MAX_LEN ||
    !TEMPLATE_ID_PATTERN.test(cleanTemplateId)
  ) {
    throw new Error('Netinkamas šablono identifikatorius.');
  }
  if (user.uid.length > USER_ID_MAX_LEN || !TEMPLATE_ID_PATTERN.test(user.uid)) {
    throw new Error('Netinkamas vartotojo identifikatorius.');
  }
  if (!Number.isInteger(cleanStars) || cleanStars < 1 || cleanStars > 5) {
    throw new Error('Įvertinimas turi būti nuo 1 iki 5 žvaigždučių.');
  }

  const ratingDocId = `${cleanTemplateId}__${user.uid}`;
  const ratingRef = doc(db, 'templateRatings', ratingDocId);
  const statsRef = doc(db, 'templateStats', cleanTemplateId);

  try {
    await runTransaction(db, async (transaction) => {
      const [existingRatingSnap, existingStatsSnap] = await Promise.all([
        transaction.get(ratingRef),
        transaction.get(statsRef)
      ]);

      const now = serverTimestamp();

      if (existingRatingSnap.exists()) {
        const prevStars = Number(existingRatingSnap.data().stars || 0);
        if (prevStars === cleanStars) {
          return; // No change needed
        }
        const prevSum = existingStatsSnap.exists() ? Number(existingStatsSnap.data().ratingSum || 0) : prevStars;
        const prevCount = existingStatsSnap.exists() ? Number(existingStatsSnap.data().ratingCount || 1) : 1;
        const nextSum = Math.max(prevCount, prevSum - prevStars + cleanStars);

        transaction.update(ratingRef, {
          stars: cleanStars,
          updatedAt: now
        });

        if (existingStatsSnap.exists()) {
          transaction.update(statsRef, {
            ratingSum: nextSum,
            ratingCount: prevCount,
            updatedAt: now
          });
        } else {
          transaction.set(statsRef, {
            templateId: cleanTemplateId,
            ratingSum: cleanStars,
            ratingCount: 1,
            isPublic: true,
            updatedAt: now
          });
        }
      } else {
        transaction.set(ratingRef, {
          templateId: cleanTemplateId,
          userId: user.uid,
          stars: cleanStars,
          createdAt: now,
          updatedAt: now
        });

        if (existingStatsSnap.exists()) {
          const prevSum = Number(existingStatsSnap.data().ratingSum || 0);
          const prevCount = Number(existingStatsSnap.data().ratingCount || 0);
          transaction.update(statsRef, {
            ratingSum: prevSum + cleanStars,
            ratingCount: prevCount + 1,
            updatedAt: now
          });
        } else {
          transaction.set(statsRef, {
            templateId: cleanTemplateId,
            ratingSum: cleanStars,
            ratingCount: 1,
            isPublic: true,
            updatedAt: now
          });
        }
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `templateRatings/${ratingDocId}`);
  }
}
