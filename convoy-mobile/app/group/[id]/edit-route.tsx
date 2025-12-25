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
