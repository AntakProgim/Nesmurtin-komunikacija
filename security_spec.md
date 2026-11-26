# Firestore Security Specification (Phase 0)

## 1. Data Invariants

1. **Deterministic One-Vote-Per-User Identity**: Every document in `/templateRatings/{ratingId}` MUST have `ratingId == templateId + '__' + request.auth.uid`, and `userId == request.auth.uid`. A user can never create or overwrite another user's rating or vote twice for the same template.
2. **Verified Users Only for Writes**: Every write to `/templateRatings` and `/templateStats` requires an authenticated user with `request.auth.token.email_verified == true`.
3. **Strict Star Range & Schema Keys**: `stars` MUST be an integer between `1` and `5`. No shadow/extra fields are permitted on either collection (`hasAll` + `hasOnly` on create, `affectedKeys().hasOnly(...)` on update).
4. **Atomic Counter Integrity (`getAfter` / `existsAfter`)**:
   - Creating `/templateRatings/{templateId}__{uid}` MUST atomically create or increment `/templateStats/{templateId}` in the same transaction/batch.
   - Updating `/templateRatings/{templateId}__{uid}` MUST atomically adjust `/templateStats/{templateId}.ratingSum` by `(newStars - oldStars)` with `ratingCount` unchanged.
   - Direct tampering with `/templateStats/{templateId}` without a matching atomic write to `/templateRatings/{templateId}__{uid}` is impossible.
5. **Immutable Audit Fields & Server Timestamps**: `templateId`, `userId`, and `createdAt` are immutable after creation. `createdAt` (on create) and `updatedAt` (on create/update) MUST equal `request.time`.
6. **Zero PII & Explicit List Guards**: `/templateStats` stores only public counters (`isPublic == true`) and no user identifiers or emails. `/templateRatings` restricts both `get` and `list` strictly to `existing().userId == request.auth.uid`.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)

1. **Unauthenticated Rating Create**: Anonymous caller tries to create `/templateRatings/tpl-school-safety__anon` with `{ templateId: "tpl-school-safety", userId: "anon", stars: 5, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }`.
2. **Unverified Email Spoof**: Authenticated user with `email_verified: false` attempts to create a valid rating + stats batch.
3. **Identity Spoofing (`userId` mismatch)**: User `uid_A` tries to create `/templateRatings/tpl-school-safety__uid_B` with `{ userId: "uid_B", ... }`.
4. **Deterministic ID Bypass (Double Voting)**: User `uid_A` tries to create `/templateRatings/random-id-123` with `{ templateId: "tpl-school-safety", userId: "uid_A", stars: 5, ... }`.
5. **Out-of-Range Star Rating (Value Poisoning)**: User `uid_A` tries to submit `{ stars: 999 }` or `{ stars: 0 }` or `{ stars: "5" }`.
6. **Shadow Field Injection on Create**: User `uid_A` includes an undeclared ghost field `{ isVerified: true, role: "admin" }` in `/templateRatings` or `/templateStats`.
7. **Orphaned Stats Manipulation (Atomicity Bypass)**: User `uid_A` tries to directly update `/templateStats/tpl-school-safety` setting `ratingSum: 5000, ratingCount: 1000` without an atomic write to `/templateRatings/tpl-school-safety__uid_A`.
8. **Fake Delta Tampering on Stats Update**: User `uid_A` updates their rating from `4` to `5` (`+1`), but tries to increment `templateStats.ratingSum` by `+50` or `ratingCount` by `+10`.
9. **Immutable Field Mutation**: User `uid_A` tries to alter `createdAt` or `templateId` during a rating update.
10. **Client Timestamp Forgery**: User `uid_A` sends a client-fabricated timestamp (`new Date('2020-01-01')`) instead of `request.time` for `createdAt` or `updatedAt`.
11. **Cross-User Rating Scraping (`list` / `get`)**: User `uid_A` tries to `get` `/templateRatings/tpl-school-safety__uid_B` or `list` `/templateRatings` without filtering `where('userId', '==', 'uid_A')`.
12. **Resource / ID Poisoning**: Attacker attempts to write to `/templateStats/{150-char-invalid-id!@#}` or set `templateId` with invalid characters (`../admin`).
