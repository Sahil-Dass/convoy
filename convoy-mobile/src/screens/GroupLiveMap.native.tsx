import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Text as RNText } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { subscribeMembers } from "../data/groups";
import { useAuth } from "../auth/AuthProvider";

type Member = { uid: string; role: "owner" | "member" };
type UserDoc = {
  displayName?: string;
  lastLocation?: { lat: number; lng: number; updatedAt?: any };
};

export default function GroupLiveMap() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const mapRef = useRef<MapView | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<Record<string, UserDoc>>({});
  const [myRegion, setMyRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (!id) return;
    return subscribeMembers(String(id), (rows: any[]) => setMembers(rows.map((r) => ({ uid: r.uid, role: r.role }))));
  }, [id]);

  // Live subscribe each member's user doc to get lastLocation updates
  useEffect(() => {
    const unsubs: Array<() => void> = [];
    const uids = Array.from(new Set(members.map((m) => m.uid)));

    uids.forEach((uid) => {
      const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
        setUsers((prev) => ({ ...prev, [uid]: (snap.exists() ? (snap.data() as any) : {}) }));
      });
      unsubs.push(unsub);
    });

    return () => unsubs.forEach((u) => u());
  }, [members.map((m) => m.uid).join("|")]);

  const markers = useMemo(() => {
    return members
      .map((m) => {
        const u = users[m.uid] || {};
        const ll = u.lastLocation;
        if (!ll?.lat || !ll?.lng) return null;
        return {
          uid: m.uid,
          role: m.role,
          title: u.displayName || `${m.uid.slice(0, 6)}…`,
          lat: ll.lat,
          lng: ll.lng,
        };
      })
      .filter(Boolean) as Array<{ uid: string; role: string; title: string; lat: number; lng: number }>;
  }, [members, users]);

  async function centerOnMe() {
    const perm = await Location.getForegroundPermissionsAsync();
    if (perm.status !== "granted") return;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const region: Region = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };
    setMyRegion(region);
    mapRef.current?.animateToRegion(region, 400);
  }

  // initial center: try my location; fallback: first marker
  useEffect(() => {
    (async () => {
      await centerOnMe();
    })().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (myRegion) return;
    if (!markers.length) return;
    const first = markers[0];
    const region: Region = {
      latitude: first.lat,
      longitude: first.lng,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    };
    setMyRegion(region);
  }, [markers, myRegion]);

  return (
    <View style={s.c}>
      <MapView
        ref={(r) => (mapRef.current = r)}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          myRegion ?? {
            latitude: 19.0760,
            longitude: 72.8777,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }
        }
      >
        {markers.map((m) => (
          <Marker
            key={m.uid}
            coordinate={{ latitude: m.lat, longitude: m.lng }}
            title={m.title}
            description={m.role}
            pinColor={user?.uid === m.uid ? "#22C55E" : "#3B82F6"}
          />
        ))}
      </MapView>

      <View style={s.top}>
        <RNText style={s.h}>Live Map</RNText>
        <RNText style={s.p}>Members: {members.length} • Markers: {markers.length}</RNText>
      </View>

      <Pressable style={s.fab} onPress={centerOnMe}>
        <RNText style={s.fabText}>Center on me</RNText>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  top: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(2,6,23,0.75)",
    borderColor: "rgba(148,163,184,0.25)",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  h: { color: "white", fontSize: 18, fontWeight: "800" },
  p: { color: "#CBD5E1", marginTop: 2 },
  fab: {
    position: "absolute",
    right: 14,
    bottom: 22,
    backgroundColor: "rgba(37,99,235,0.92)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  fabText: { color: "white", fontWeight: "800" },
});
