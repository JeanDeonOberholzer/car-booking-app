import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function App() {
  const [cars, setCars] = useState([
    { id: "1", make: "Toyota", model: "Corolla", costPerDay: 650 },
  ]);
  const [booking, setBooking] = useState(null);

  const addCar = (make, model, cost) => {
    const c = parseFloat(cost);
    if (!make || !model || isNaN(c) || c <= 0) return;
    const id = Date.now().toString();
    setCars((prev) => [...prev, { id, make, model, costPerDay: c }]);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#e5e7eb",
          contentStyle: { backgroundColor: "#0b1220" },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AddCar">
          {(props) => <AddCarScreen {...props} addCar={addCar} />}
        </Stack.Screen>
        <Stack.Screen name="RentCar">
          {(props) => (
            <RentCarScreen {...props} cars={cars} setBooking={setBooking} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Confirm">
          {(props) => <ConfirmScreen {...props} booking={booking} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function LoginScreen({ navigation }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const onLogin = () => {
    setError("");
    if (!user || !pass) return setError("Please enter your details.");
    if (user === "admin" && pass === "admin") navigation.replace("AddCar");
    else navigation.replace("RentCar");
  };

  return (
    <View style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Let’s get you on the road</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#9aa0a6"
          value={user}
          onChangeText={setUser}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9aa0a6"
          secureTextEntry
          value={pass}
          onChangeText={setPass}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={onLogin}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AddCarScreen({ addCar }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [cost, setCost] = useState("");

  const onAdd = () => {
    if (!make || !model || !cost) return Alert.alert("Please fill everything in.");
    const c = parseFloat(cost);
    if (isNaN(c) || c <= 0) return Alert.alert("Cost must be a positive number.");
    addCar(make.trim(), model.trim(), c);
    setMake("");
    setModel("");
    setCost("");
    Alert.alert("Car added to the list.");
  };

  return (
    <View style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.title}>Add a car</Text>
        <Text style={styles.subtitle}>Keep it short and clear</Text>
        <TextInput
          style={styles.input}
          placeholder="Make (e.g., Toyota)"
          placeholderTextColor="#9aa0a6"
          value={make}
          onChangeText={setMake}
        />
        <TextInput
          style={styles.input}
          placeholder="Model (e.g., Corolla)"
          placeholderTextColor="#9aa0a6"
          value={model}
          onChangeText={setModel}
        />
        <TextInput
          style={styles.input}
          placeholder="Cost per day (e.g., 650)"
          placeholderTextColor="#9aa0a6"
          value={cost}
          onChangeText={setCost}
          keyboardType="numeric"
          inputMode="numeric"
        />
        <Pressable style={styles.button} onPress={onAdd}>
          <Text style={styles.buttonText}>Add car</Text>
        </Pressable>
      </View>
    </View>
  );
}

function RentCarScreen({ navigation, cars, setBooking }) {
  const [selectedId, setSelectedId] = useState(cars[0]?.id ?? null);
  const [days, setDays] = useState("");

  const onBook = () => {
    const d = parseInt(days.trim(), 10);
    if (!selectedId) return Alert.alert("Choose a car first.");
    if (!days) return Alert.alert("Enter how many days.");
    if (isNaN(d) || d <= 0 || d > 60) return Alert.alert("Enter 1–60 days.");

    const car = cars.find((c) => c.id === selectedId);
    const total = car.costPerDay * d;

    Alert.alert(
      "Confirm booking",
      `${car.make} ${car.model}\nDays: ${d}\nTotal: R${total}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            setBooking({ car, days: d, total });
            navigation.navigate("Confirm");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.safe}>
      <Image
        source={require("./assets/images/car-placeholder.jpg")}
        style={styles.banner}
        resizeMode="cover"
      />
      <Text style={styles.title}>Pick your ride</Text>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 8 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedId(item.id)}
            style={[styles.card, item.id === selectedId && styles.cardSelected]}
          >
            <Text style={styles.cardTitle}>{item.make} {item.model}</Text>
            <Text style={styles.cardSub}>R {item.costPerDay} / day</Text>
          </Pressable>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Days (1–60)"
        placeholderTextColor="#9aa0a6"
        value={days}
        onChangeText={setDays}
        keyboardType="numeric"
        inputMode="numeric"
        maxLength={2}
      />
      <Pressable style={styles.button} onPress={onBook}>
        <Text style={styles.buttonText}>Book now</Text>
      </Pressable>
    </View>
  );
}

function ConfirmScreen({ booking }) {
  if (!booking) {
    return (
      <View style={styles.safe}>
        <Text style={styles.title}>No booking yet</Text>
      </View>
    );
  }

  const { car, days, total } = booking;

  return (
    <View style={styles.safe}>
      <Image
        source={require("./assets/images/car-placeholder.jpg")}
        style={styles.banner}
        resizeMode="cover"
      />
      <View style={styles.card}>
        <Text style={styles.title}>You’re all set</Text>
        <Text style={styles.item}>Car: {car.make} {car.model}</Text>
        <Text style={styles.item}>Days: {days}</Text>
        <Text style={styles.item}>Amount due on pickup: R {total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220", padding: 16 },
  banner: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  card: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  title: {
    color: "#e5e7eb",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { color: "#cbd5e1", textAlign: "center", marginBottom: 8 },
  input: {
    backgroundColor: "#0b1220",
    color: "#e5e7eb",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#22d3ee",
    padding: 12,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#0b1220", fontWeight: "800" },
  error: { color: "#ef4444", textAlign: "center" },
  cardSelected: { borderColor: "#22d3ee" },
  cardTitle: { color: "#e5e7eb", fontWeight: "700" },
  cardSub: { color: "#cbd5e1" },
  item: { color: "#cbd5e1", textAlign: "center" },
});
