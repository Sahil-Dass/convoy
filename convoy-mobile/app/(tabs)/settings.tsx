import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Appbar, List, Switch, Button, Divider, Text } from "react-native-paper";
import { useAuth } from "../../src/auth/AuthProvider";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = React.useState(true);
  const [units, setUnits] = React.useState(true); // true = metric

  return (
    <View style={s.c}>
      <Appbar.Header style={{ backgroundColor: "#020617" }}>
        <Appbar.BackAction color="#F9FAFB" onPress={() => router.back()} />
        <Appbar.Content title="Settings" titleStyle={{ color: "#F9FAFB" }} />
      </Appbar.Header>

      <ScrollView>
        <List.Section>
          <List.Subheader style={{color: "#F97316"}}>Display</List.Subheader>
          <List.Item
            title="Units of Measure"
            description={units ? "Metric (km, m)" : "Imperial (mi, ft)"}
            titleStyle={{color: "white"}}
            descriptionStyle={{color: "#94A3B8"}}
            right={() => <Switch value={units} onValueChange={setUnits} color="#F97316" />}
          />
        </List.Section>
        <Divider style={{backgroundColor: "#1E293B"}} />

        <List.Section>
          <List.Subheader style={{color: "#F97316"}}>Account</List.Subheader>
          <List.Item
             title="Email"
             description={user?.email}
             titleStyle={{color: "white"}}
             descriptionStyle={{color: "#94A3B8"}}
             left={props => <List.Icon {...props} icon="email-outline" color="#94A3B8"/>}
          />
          <List.Item
             title="Privacy Controls"
             titleStyle={{color: "white"}}
             left={props => <List.Icon {...props} icon="lock-outline" color="#94A3B8"/>}
             right={props => <List.Icon {...props} icon="chevron-right" color="#94A3B8"/>}
          />
        </List.Section>

        <View style={{padding: 20, marginTop: 20}}>
          <Button mode="outlined" textColor="#EF4444" style={{borderColor: "#EF4444"}} onPress={() => { signOut(); router.replace("/auth"); }}>
            Log Out
          </Button>
          <Text style={{textAlign: "center", color: "#475569", marginTop: 20, fontSize: 12}}>Version 1.0.0 (Build 2025)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" }
});
