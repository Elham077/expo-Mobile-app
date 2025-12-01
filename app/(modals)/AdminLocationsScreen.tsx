import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { onSnapshot, query, collection, where, Timestamp, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "@/config/firebase.client";

// Type for each shared location
type SharedLocationType = {
  id: string;
  uid: string;
  displayName: string;
  coords: { latitude: number; longitude: number };
  address?: string;
  createdAt: any;
};

const AdminLocationsMapScreen = () => {
  const [locations, setLocations] = useState<SharedLocationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const oneDayAgo = Timestamp.fromDate(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const q = query(
      collection(firestore, "sharedLocations"),
      where("createdAt", ">", oneDayAgo)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setLocations(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert("هشدار", "آیا از حذف موقعیت اطمینان دارید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(firestore, "sharedLocations", id));
        },
      },
    ]);
  };

  const handleMoreInfo = (loc: SharedLocationType) => {
    Alert.alert(
      `جزییات ${loc.displayName}`,
      `\nآدرس: ${loc.address}\nموقعیت: ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}\nزمان: ${loc.createdAt.toDate().toLocaleString("fa-IR")}`
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  if (locations.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>📭 موقعیتی در ۲۴ ساعت اخیر یافت نشد.</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: locations[0].coords.latitude,
    longitude: locations[0].coords.longitude,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion}
    >
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          coordinate={loc.coords}
          title={loc.displayName}
        >
          <Callout tooltip>
            <View style={styles.calloutBox}>
              <Text style={styles.bold}>{loc.displayName}</Text>
              <Text>📍 {loc.address}</Text>
              <Text>🕒 {loc.createdAt?.toDate().toLocaleString("fa-IR")}</Text>
              <View style={styles.calloutActions}>
                <TouchableOpacity
                  onPress={() => handleDelete(loc.id)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.btnText}>🗑 حذف</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMoreInfo(loc)}
                  style={styles.infoBtn}
                >
                  <Text style={styles.btnText}>🔍 جزییات</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    fontSize: 16,
    color: "#999",
  },
  calloutBox: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    width: 220,
    elevation: 4,
  },
  bold: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  calloutActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  deleteBtn: {
    backgroundColor: "#EF4444",
    padding: 6,
    borderRadius: 6,
  },
  infoBtn: {
    backgroundColor: "#3B82F6",
    padding: 6,
    borderRadius: 6,
  },
  btnText: {
    color: "#fff",
    fontSize: 13,
  },
});

export default AdminLocationsMapScreen;