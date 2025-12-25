#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/convoy/convoy-mobile

TS="$(date +%Y%m%d_%H%M%S)"
BK="/tmp/convoy_userprofile_fix_$TS"
mkdir -p "$BK"
cp -f src/data/userProfile.ts "$BK/userProfile.ts.bak" 2>/dev/null || true
cp -f "app/(tabs)/_layout.tsx" "$BK/tabs_layout.tsx.bak" 2>/dev/null || true
echo "Backup: $BK"

cat > src/data/userProfile.ts <<'EOF'
import { auth, db } from "../firebase";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  displayName: string;
  onboardingCompleted: boolean;
  termsAcceptedAt?: any;
  locationPermission?: "granted" | "denied" | "unknown";
  settings?: { locationSharingEnabled?: boolean };
  emergencyName?: string;
  emergencyPhone?: string;
  bloodGroup?: string;
  createdAt?: any;
  updatedAt?: any;
};

export function needsOnboarding(profile: UserProfile | null) {
  return !profile || profile.onboardingCompleted !== true;
}

export async function ensureUserProfileDoc(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const displayName =
      auth.currentUser?.displayName ||
      auth.currentUser?.email?.split("@")[0] ||
      "Rider";

    await setDoc(ref, {
      uid,
      displayName,
      onboardingCompleted: false,
      locationPermission: "unknown",
      settings: { locationSharingEnabled: true },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as UserProfile);
  }
}

export function subscribeToUserProfile(uid: string, cb: (p: UserProfile | null) => void) {
  return onSnapshot(doc(db, "users", uid), (snap) =>
    cb(snap.exists() ? (snap.data() as UserProfile) : null)
  );
}

export async function completeOnboarding(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    onboardingCompleted: true,
    termsAcceptedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function setEmergencyDetails(uid: string, patch: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), { ...patch, updatedAt: serverTimestamp() });
}

export async function setLocationPermission(uid: string, status: "granted" | "denied") {
  await updateDoc(doc(db, "users", uid), { locationPermission: status, updatedAt: serverTimestamp() });
}

export async function setLocationSharingEnabled(uid: string, enabled: boolean) {
  await updateDoc(doc(db, "users", uid), {
    settings: { locationSharingEnabled: enabled },
    updatedAt: serverTimestamp(),
  });
}
EOF

# remove invalid Tabs.Screen name "map.web" if present
perl -0777 -i -pe 's/\n\s*<Tabs\.Screen name="map\.web" options=\{\{ href: null \}\} \/>\s*//g' "app/(tabs)/_layout.tsx" || true

rm -rf .expo node_modules/.cache
