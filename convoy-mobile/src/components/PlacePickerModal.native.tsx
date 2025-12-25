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
