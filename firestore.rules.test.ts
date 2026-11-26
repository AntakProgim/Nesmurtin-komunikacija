/**
 * Firestore Security Rules Test Specification (Dirty Dozen)
 * Run with Firebase Emulator Suite & @firebase/rules-unit-testing.
 */
import { readFileSync } from 'node:fs';

export const dirtyDozenSecurityCases = [
  {
    id: 1,
    name: 'Unauthenticated rating create is denied',
    auth: null,
    path: 'templateRatings/tpl-school-safety__anon',
    payload: { templateId: 'tpl-school-safety', userId: 'anon', stars: 5 },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Unverified email user write is denied',
    auth: { uid: 'uid_unverified', token: { email_verified: false } },
    path: 'templateRatings/tpl-school-safety__uid_unverified',
    payload: { templateId: 'tpl-school-safety', userId: 'uid_unverified', stars: 5 },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Identity spoofing (userId mismatch) is denied',
    auth: { uid: 'uid_A', token: { email_verified: true } },
    path: 'templateRatings/tpl-school-safety__uid_B',
    payload: { templateId: 'tpl-school-safety', userId: 'uid_B', stars: 4 },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'Non-deterministic ratingId (double-voting bypass) is denied',
    auth: { uid: 'uid_A', token: { email_verified: true } },
    path: 'templateRatings/random-id-123',
    payload: { templateId: 'tpl-school-safety', userId: 'uid_A', stars: 5 },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'Out-of-range star rating (stars: 999 or 0) is denied',
    auth: { uid: 'uid_A', token: { email_verified: true } },
    path: 'templateRatings/tpl-school-safety__uid_A',
    payload: { templateId: 'tpl-school-safety', userId: 'uid_A', stars: 999 },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'Shadow field injection (isVerified / role) is denied',
    auth: { uid: 'uid_A', token: { email_verified: true } },
    path: 'templateRatings/tpl-school-safety__uid_A',
    payload: { templateId: 'tpl-school-safety', userId: 'uid_A', stars: 5, isVerified: true, role: 'admin' },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'Direct orphaned templateStats write without atomic rating is denied',
    auth: { uid: 'uid_A', token: { email_verified: true } },
    path: 'templateStats/tpl-school-safety',
    payload: { templateId: 'tpl-school-safety', ratingSum: 5000, ratingCount: 1000, isPublic: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'Fake delta manipulation on templateStats update is denied',
    auth: { uid: 'uid_A', token: { email_verified: true } },
    path: 'templateStats/tpl-school-safety',
    payload: { ratingSum: 999, ratingCount: 50 },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'Immutable createdAt / templateId mutation on update is denied',
    auth: { uid: 'uid_A', token: { email_verified: true } },
    path: 'templateRatings/tpl-school-safety__uid_A',
    payload: { templateId: 'tpl-delayed-response', stars: 3 },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Client-fabricated timestamp forgery is denied',
    auth: { uid: 'uid_A', token: { email_verified: true } },
    path: 'templateRatings/tpl-school-safety__uid_A',
    payload: { templateId: 'tpl-school-safety', userId: 'uid_A', stars: 4, createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Cross-user rating read / unrestricted list is denied',
    auth: { uid: 'uid_A', token: { email_verified: true } },
    path: 'templateRatings/tpl-school-safety__uid_B',
    payload: null,
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'ID poisoning (>128 chars or invalid chars) is denied',
    auth: { uid: 'uid_A', token: { email_verified: true } },
    path: 'templateStats/' + 'a'.repeat(150),
    payload: { templateId: '../admin', ratingSum: 5, ratingCount: 1, isPublic: true },
    expected: 'PERMISSION_DENIED'
  }
];

export function verifyRulesFilePresent(): boolean {
  const rules = readFileSync('firestore.rules', 'utf8');
  return rules.includes("rules_version = '2';")
    && rules.includes('isValidTemplateStats')
    && rules.includes('isValidTemplateRating')
    && rules.includes('existsAfter');
}
