import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { List, Switch, Button, Divider, Text, Dialog, Portal, Provider } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";
import { useThemeContext } from "../../src/context/ThemeContext";
import { deleteUser, createUserWithEmailAndPassword, updateProfile, signOut as firebaseSignOut } from "firebase/auth";
import { deleteDoc, doc, collection, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../src/firebase";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { isDark, toggleTheme, theme } = useThemeContext();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace("/auth");
  };

  const handleSeedData = async () => {
    if(!user) return;
    setLoading(true);
    try {
       const activities = [
         { name: "Morning Ride", type: "Ride", distance: 24.5, duration: "1h 12m", elevation: 120, location: "Mumbai, India" },
         { name: "Evening Run", type: "Run", distance: 5.2, duration: "28m 10s", elevation: 15, location: "Juhu Beach" },
         { name: "Sunday Long Ride", type: "Ride", distance: 85.0, duration: "3h 45m", elevation: 450, location: "Lonavala" },
       ];
       for (const act of activities) {
         await addDoc(collection(db, "activities"), {
            ...act,
            createdBy: user.displayName || "Athlete",
            userId: user.uid,
            userPhoto: user.photoURL,
            createdAt: serverTimestamp(),
            likes: Math.floor(Math.random() * 20),
            comments: Math.floor(Math.random() * 5),
         });
       }
       Alert.alert("Success", "Added 3 sample activities for YOU.");
    } catch(e: any) {
       Alert.alert("Error", e.message);
    } finally {
       setLoading(false);
    }
  };

  const handleCreateDummyUsers = async () => {
    Alert.alert(
      "Create 5 Dummy Users?",
      "This will create users (Alice, Bob, etc.) and post rides for them.\n\nNOTE: You will be logged out to create them.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Create & Logout", onPress: async () => {
            setLoading(true);
            try {
              const dummies = [
                { email: "alice@test.com", name: "Alice Racer", img: "https://i.pravatar.cc/300?img=1" },
                { email: "bob@test.com", name: "Bob Climber", img: "https://i.pravatar.cc/300?img=2" },
                { email: "charlie@test.com", name: "Charlie Run", img: "https://i.pravatar.cc/300?img=3" },
                { email: "david@test.com", name: "David Trek", img: "https://i.pravatar.cc/300?img=4" },
                { email: "eve@test.com", name: "Eve Sprinter", img: "https://i.pravatar.cc/300?img=5" },
              ];

              // We must logout current user first to create new ones via client SDK
              await firebaseSignOut(auth);

              for (const d of dummies) {
                try {
                  // 1. Create User
                  const cred = await createUserWithEmailAndPassword(auth, d.email, "123456");
                  // 2. Update Profile
                  await updateProfile(cred.user, { displayName: d.name, photoURL: d.img });
                  // 3. Save to Firestore
                  await setDoc(doc(db, "users", cred.user.uid), {
                    displayName: d.name,
                    email: d.email,
                    photoURL: d.img,
                    onboardingComplete: true
                  });
                  // 4. Post a Ride
                  await addDoc(collection(db, "activities"), {
                    name: `${d.name}'s Ride`,
                    type: "Ride",
                    distance: Math.floor(Math.random() * 40) + 10,
                    duration: "1h 20m",
                    elevation: Math.floor(Math.random() * 300),
                    location: "Mumbai",
                    createdBy: d.name,
                    userId: cred.user.uid,
                    userPhoto: d.img,
                    createdAt: serverTimestamp(),
                    likes: Math.floor(Math.random() * 50),
                    comments: Math.floor(Math.random() * 10)
                  });
                  
                  await firebaseSignOut(auth); // Sign out dummy
                } catch (e: any) {
                   console.log("Skipping " + d.email + " (maybe exists): " + e.message);
                   // Continue to next dummy even if one fails
                }
              }

              Alert.alert("Success", "5 Dummy Users Created.\nLog back in to see their activities!");
              router.replace("/auth");
              
            } catch (e: any) {
              Alert.alert("Error", e.message);
            } finally {
              setLoading(false);
            }
        }}
      ]
    );
  };

  return (
    <Provider>
      <View style={[s.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView>
          <List.Section>
            <List.Subheader style={{color: theme.colors.primary}}>Preferences</List.Subheader>
            <List.Item title="Dark Mode" left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.onSurface} />} right={() => <Switch value={isDark} onValueChange={toggleTheme} color={theme.colors.primary} />} titleStyle={{color: theme.colors.onSurface}} />
            <Divider />
            <List.Item title="Personal Information" left={props => <List.Icon {...props} icon="account-edit" color={theme.colors.onSurface} />} onPress={() => router.push("/(tabs)/edit-profile")} titleStyle={{color: theme.colors.onSurface}} />
          </List.Section>

          <View style={{padding: 20}}>
             {/* Button 1: My Data */}
             <Button mode="outlined" textColor={theme.colors.primary} style={{borderColor: theme.colors.primary, marginBottom: 15}} onPress={handleSeedData} loading={loading}>
               Generate My Activities
             </Button>
             
             {/* Button 2: Dummy Users */}
             <Button mode="contained" buttonColor="#333" style={{marginBottom: 25}} onPress={handleCreateDummyUsers} loading={loading}>
               Create 5 Dummy Users (+Logout)
             </Button>

             <Button mode="outlined" textColor="#EF4444" style={{borderColor: "#EF4444"}} onPress={handleLogout}>Log Out</Button>
             <Text style={{textAlign: "center", marginTop: 20, color: "gray"}}>Version 1.0.5</Text>
          </View>
        </ScrollView>
      </View>
    </Provider>
  );
}
const s = StyleSheet.create({ container: { flex: 1 } });
