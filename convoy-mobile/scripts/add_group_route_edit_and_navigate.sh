#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/convoy/convoy-mobile

# 1) Native maps dependency (Expo-managed)
npx expo install react-native-maps

# 2) Reusable map picker (native + web fallback)
mkdir -p src/components

cat > src/components/PlacePickerModal.native.tsx <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, View, Text as RNText } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

export type PickedPlace = { label?: string; lat: number; lng: number };

type Props = {
  visible: boolean;
  title: string;
  initial?: PickedPlace;
  onCancel: () => void;
  onConfirm: (p: PickedPlace) => void;
};

export default function PlacePickerModal(props: Props) {
  const { visible, title, initial, onCancel, onConfirm } = props;

  const initialRegion: Region = useMemo(() => {
    const lat = initial?.lat ?? 19.0760;
    const lng = initial?.lng ?? 72.8777;
    return { latitude: lat, longitude: lng, latitudeDelta: 0.08, longitudeDelta: 0.08 };
  }, [initial?.lat, initial?.lng]);

  const [pin, setPin] = useState<PickedPlace>(() => ({
    lat: initial?.lat ?? 19.0760,
    lng: initial?.lng ?? 72.8777,
    label: initial?.label ?? "",
  }));

  useEffect(() => {
    if (!visible) return;
    setPin({
      lat: initial?.lat ?? 19.0760,
      lng: initial?.lng ?? 72.8777,
      label: initial?.label ?? "",
    });
  }, [visible, initial?.lat, initial?.lng, initial?.label]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={s.c}>
        <View style={s.hdr}>
          <RNText style={s.h}>{title}</RNText>
          <RNText style={s.p}>Long-press to place pin, or drag pin.</RNText>
        </View>

        <View style={s.mapWrap}>
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            onLongPress={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setPin((p) => ({ ...p, lat: latitude, lng: longitude }));
            }}
          >
            <Marker
              draggable
              coordinate={{ latitude: pin.lat, longitude: pin.lng }}
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setPin((p) => ({ ...p, lat: latitude, lng: longitude }));
              }}
            />
          </MapView>
        </View>

        <View style={s.actions}>
          <Pressable style={[s.btn, s.btnGhost]} onPress={onCancel}>
            <RNText style={s.btnText}>Cancel</RNText>
          </Pressable>
          <Pressable style={[s.btn, s.btnSolid]} onPress={() => onConfirm(pin)}>
            <RNText style={s.btnText}>Confirm</RNText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  hdr: { padding: 14, borderBottomWidth: 1, borderBottomColor: "rgba(148,163,184,0.2)" },
  h: { color: "white", fontSize: 18, fontWeight: "900" },
  p: { color: "#94A3B8", marginTop: 4 },
  mapWrap: { flex: 1 },
  actions: { flexDirection: "row", gap: 10, padding: 14 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  btnGhost: { backgroundColor: "rgba(148,163,184,0.15)" },
  btnSolid: { backgroundColor: "rgba(37,99,235,0.95)" },
  btnText: { color: "white", fontWeight: "900" },
});
EOF

cat > src/components/PlacePickerModal.web.tsx <<'EOF'
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export type PickedPlace = { label?: string; lat: number; lng: number };

export default function PlacePickerModalWeb() {
  return (
    <View style={s.c}>
      <Text style={s.h}>Map picker</Text>
      <Text style={s.p}>Map picker is available on Android/iOS only.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617", justifyContent: "center", padding: 16 },
  h: { color: "white", fontSize: 20, fontWeight: "900", marginBottom: 8 },
  p: { color: "#94A3B8" },
});
EOF

# 3) Create the edit-route screen for a group (start/end points stored on group doc)
mkdir -p "app/group/[id]"

cat > "app/group/[id]/edit-route.tsx" <<'EOF'
import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Appbar, Button, Card, Text } from "react-native-paper";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../src/firebase";
import PlacePickerModal, { PickedPlace } from "../../../src/components/PlacePickerModal";

type GroupRoute = {
  startPoint?: { label?: string; lat: number; lng: number };
  endPoint?: { label?: string; lat: number; lng: number };
};

export default function EditGroupRouteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = String(id);
  const router = useRouter();

  const [startPoint, setStartPoint] = useState<PickedPlace | null>(null);
  const [endPoint, setEndPoint] = useState<PickedPlace | null>(null);

  const [pick, setPick] = useState<null | "start" | "end">(null);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => !!startPoint?.lat && !!endPoint?.lat, [startPoint, endPoint]);

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload: GroupRoute = {
        startPoint: { ...startPoint! },
        endPoint: { ...endPoint! },
      };
      await updateDoc(doc(db, "groups", groupId), {
        ...payload,
        updatedAt: serverTimestamp(),
      } as any);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.c}>
      <Appbar.Header style={{ backgroundColor: "#020617" }}>
        <Appbar.BackAction color="#F9FAFB" onPress={() => router.back()} />
        <Appbar.Content title="Edit route" titleStyle={{ color: "#F9FAFB" }} />
      </Appbar.Header>

      <View style={s.body}>
        <Card style={s.card}>
          <Card.Content style={{ gap: 10 }}>
            <Text style={s.label}>Start point</Text>
            <Text style={s.value}>
              {startPoint ? `${startPoint.lat.toFixed(5)}, ${startPoint.lng.toFixed(5)}` : "Not set"}
            </Text>
            <Button mode="outlined" onPress={() => setPick("start")}>
              Pick start on map
            </Button>

            <Text style={[s.label, { marginTop: 10 }]}>End point</Text>
            <Text style={s.value}>
              {endPoint ? `${endPoint.lat.toFixed(5)}, ${endPoint.lng.toFixed(5)}` : "Not set"}
            </Text>
            <Button mode="outlined" onPress={() => setPick("end")}>
              Pick end on map
            </Button>

            <Button mode="contained" disabled={!canSave || saving} loading={saving} onPress={save}>
              Save
            </Button>
          </Card.Content>
        </Card>
      </View>

      <PlacePickerModal
        visible={pick !== null}
        title={pick === "start" ? "Pick start point" : "Pick end point"}
        initial={pick === "start" ? startPoint ?? undefined : endPoint ?? undefined}
        onCancel={() => setPick(null)}
        onConfirm={(p) => {
          if (pick === "start") setStartPoint(p);
          if (pick === "end") setEndPoint(p);
          setPick(null);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  body: { padding: 16 },
  card: { backgroundColor: "#0B1120", borderRadius: 18 },
  label: { color: "#94A3B8" },
  value: { color: "#F9FAFB" },
});
EOF

# 4) Patch your group details screen to add Edit + Navigate buttons in the Appbar
TARGET="app/group/[id].tsx"
if [ ! -f "$TARGET" ]; then
  echo "ERROR: Expected $TARGET to exist. If your file is elsewhere, paste its path."
  exit 1
fi

python - <<'PY'
from pathlib import Path
p = Path("app/group/[id].tsx")
s = p.read_text(encoding="utf-8")

# ensure Linking import
s = s.replace(
  'import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";',
  'import { View, StyleSheet, FlatList, TouchableOpacity, Linking } from "react-native";'
)

# add edit + navigate actions near your existing map action
needle = '<Appbar.Action icon="map-outline" color="#F9FAFB" onPress={() => router.push(`/group/${groupId}/map`)} />'
if needle not in s:
  raise SystemExit("Could not find the map-outline Appbar.Action line to patch.")

insert = needle + """

        <Appbar.Action
          icon="pencil-outline"
          color="#F9FAFB"
          onPress={() => router.push(`/group/${groupId}/edit-route`)}
        />

        <Appbar.Action
          icon="navigation-variant"
          color="#F9FAFB"
          onPress={() => {
            const end = (group as any)?.endPoint;
            if (!end?.lat || !end?.lng) return;
            const url = `https://www.google.com/maps/dir/?api=1&destination=${end.lat},${end.lng}&dir_action=navigate`;
            Linking.openURL(url).catch(() => {});
          }}
        />
"""
s = s.replace(needle, insert)
p.write_text(s, encoding="utf-8")
print("Patched app/group/[id].tsx: added Edit route + Navigate actions")
PY

rm -rf .expo node_modules/.cache
echo "Done. Start Expo with: npx expo start --tunnel --clear"
