import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AdminDashboard from "@/AdminDashboard";
import SalesRepDashboard from "@/SalesRepDashboard";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "salesRep" | null>(null);
  console.log("App.tsx is running"); // Check if this logs in Metro Bundler

  const users = {
    admin: { email: "kingsleyamaechi2@gmail.com", password: "12345" },
    salesRep: { email: "dreysonglobal@gmail.com", password: "12345" },
  };

  const handleLogin = () => {
    if (email === users.admin.email && password === users.admin.password) {
      setUserRole("admin");
    } else if (email === users.salesRep.email && password === users.salesRep.password) {
      setUserRole("salesRep");
    } else {
      alert("Invalid email or password!");
    }
  };

  if (userRole === "admin") return <AdminDashboard />;
  if (userRole === "salesRep") return <SalesRepDashboard />;
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drey App Login</Text>

      <TextInput style={styles.input} placeholder="Enter Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Enter Password" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

    
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "80%", padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
  button: { backgroundColor: "blue", padding: 10, borderRadius: 5 },
  buttonText: { color: "white", fontWeight: "bold" },
});
