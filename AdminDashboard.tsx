import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function AdminDashboard() {
  // State to store received reports
  const [reports, setReports] = useState<{ id: number; repName: string; message: string; reply: string }[]>([]);
  // State to store received invoices
  const [invoices, setInvoices] = useState<{ id: number; customer: string; products: string; amount: string }[]>([]);
  // State to store live locations of sales reps
  const [locations, setLocations] = useState<{ id: number; repName: string; location: string }[]>([]);

  // Fetch reports, invoices, and locations from the backend
  useEffect(() => {
    fetchReports();
    fetchInvoices();
    fetchLocations();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("http://172.20.10.7/dreyapp/getReports.php");
      const data = await response.json();
      setReports(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch reports.");
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch("http://172.20.10.7/dreyapp/getInvoices.php");
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch invoices.");
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch("http://172.20.10.7/dreyapp/getLocations.php");
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch locations.");
    }
  };

  // Function to reply to a report and send it to the backend
  const replyToReport = async (id: number, reply: string) => {
    try {
      const response = await fetch("http://172.20.10.7/dreyapp/replyReports.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reply }),
      });

      const result = await response.text();
      if (result === "success") {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === id ? { ...report, reply } : report
          )
        );
        Alert.alert("Reply Sent", `Reply to ${reports.find((r) => r.id === id)?.repName}: ${reply}`);
      } else {
        Alert.alert("Error", "Failed to send reply.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  // Function to generate a PDF invoice
  const generatePDF = async (invoice: any) => {
    const htmlContent = `
      <html>
        <body>
          <h2>Invoice</h2>
          <p><strong>Customer:</strong> ${invoice.customer}</p>
          <p><strong>Products:</strong> ${invoice.products}</p>
          <p><strong>Total Amount:</strong> ${invoice.amount}</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
      Alert.alert("Success", "Invoice PDF generated & ready for sharing!");
    } catch (error) {
      Alert.alert("Error", "Could not generate PDF");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      {/* Reports Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reports from Sales Reps</Text>
        {reports.length === 0 ? (
          <Text>No reports received yet.</Text>
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.card}>
              <Text style={styles.boldText}>From: {report.repName}</Text>
              <Text>Message: {report.message}</Text>
              <Text>Reply: {report.reply || "No reply yet"}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => replyToReport(report.id, "Acknowledged")}
              >
                <Text style={styles.buttonText}>Reply</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Invoices Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoices Received</Text>
        {invoices.length === 0 ? (
          <Text>No invoices received yet.</Text>
        ) : (
          invoices.map((invoice) => (
            <View key={invoice.id} style={styles.card}>
              <Text style={styles.boldText}>Customer: {invoice.customer}</Text>
              <Text>Products: {invoice.products}</Text>
              <Text>Total Amount: {invoice.amount}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => generatePDF(invoice)}
              >
                <Text style={styles.buttonText}>Generate PDF</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Live Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Location of Sales Reps</Text>
        {locations.length === 0 ? (
          <Text>No live locations received yet.</Text>
        ) : (
          locations.map((loc) => (
            <View key={loc.id} style={styles.card}>
              <Text style={styles.boldText}>Rep: {loc.repName}</Text>
              <Text>Location: {loc.location}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0", padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "blue",
  },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "red" },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
  button: { backgroundColor: "blue", padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
  boldText: { fontWeight: "bold" },
});
