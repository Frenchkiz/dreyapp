import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

export default function SalesRepDashboard() {
  const [customers, setCustomers] = useState<
    { id: number; name: string; phone: string; address: string }[]
  >([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<
    { id: number; name: string; price: number; quantity: number }[]
  >([]);

  const [products, setProducts] = useState([
    { id: 1, name: "Laptop", price: 500 },
    { id: 2, name: "Smartphone", price: 300 },
    { id: 3, name: "Headphones", price: 50 },
    { id: 4, name: "Keyboard", price: 40 },
  ]);

  const [reports, setReports] = useState<{ id: number; text: string }[]>([]);
  const [newReport, setNewReport] = useState("");

   // Fetch customers from backend
   useEffect(() => {
    fetch("http://172.20.10.7/dreyapp/getCustomers.php")
      .then((response) => response.json())
      .then((data) => setCustomers(data))
      .catch((error) => console.error("Error fetching customers:", error));
  }, []);

  // Fetch products from backend
  useEffect(() => {
    fetch("http://172.20.10.7/dreyapp/getProducts.php")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // Fetch reports from backend
  useEffect(() => {
    fetch("http://172.20.10.7/dreyapp/getReports.php")
      .then((response) => response.json())
      .then((data) => setReports(data))
      .catch((error) => console.error("Error fetching reports:", error));
  }, []);


  const addCustomer = () => {
    if (newCustomer.name && newCustomer.phone && newCustomer.address) {
      fetch("http://172.20.10.7/dreyapp/addCustomer.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setCustomers([...customers, { id: data.id, ...newCustomer }]);
            setNewCustomer({ name: "", phone: "", address: "" });
            Alert.alert("Success", "Customer added!");
          } else {
            Alert.alert("Error", "Failed to add customer.");
          }
        })
        .catch((error) => console.error("Error adding customer:", error));
    } else {
      Alert.alert("Error", "Please fill in all fields.");
    }
  };

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setSelectedProducts([]); // Reset product selection
  };

  const selectProduct = (product: any) => {
    const existingProduct = selectedProducts.find((p) => p.id === product.id);
    if (existingProduct) {
      Alert.alert("Product already selected!", "You can update the quantity.");
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: quantity } : p))
    );
  };

  const removeProduct = (id: number) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  const totalAmount = selectedProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  const sendInvoiceToAdmin = () => {
    if (!selectedCustomer || selectedProducts.length === 0) {
      Alert.alert("Error", "Please select a customer and at least one product.");
      return;
    }

    const invoiceData = {
      customer_id: selectedCustomer.id,
      products: selectedProducts,
      total: totalAmount,
    };

    fetch("http://172.20.10.7/dreyapp/sendInvoice.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          Alert.alert("Success", "Invoice sent to Admin Dashboard!");
        } else {
          Alert.alert("Error", "Failed to send invoice.");
        }
      })
      .catch((error) => console.error("Error sending invoice:", error));
  };


  const submitReport = () => {
    if (newReport.trim() === "") {
      Alert.alert("Error", "Report cannot be empty.");
      return;
    }

    fetch("http://172.20.10.7/dreyapp/sendReport.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newReport }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setReports([...reports, { id: data.id, text: newReport }]);
          setNewReport("");
          Alert.alert("Success", "Report sent to Admin!");
        } else {
          Alert.alert("Error", "Failed to send report.");
        }
      })
      .catch((error) => console.error("Error sending report:", error));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sales Rep Dashboard</Text>

      {/* Register Customer Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Register New Customer</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={newCustomer.name}
          onChangeText={(text) => setNewCustomer({ ...newCustomer, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={newCustomer.phone}
          onChangeText={(text) => setNewCustomer({ ...newCustomer, phone: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={newCustomer.address}
          onChangeText={(text) => setNewCustomer({ ...newCustomer, address: text })}
        />
        <TouchableOpacity style={styles.button} onPress={addCustomer}>
          <Text style={styles.buttonText}>Add Customer</Text>
        </TouchableOpacity>
      </View>

      {/* List of Registered Customers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registered Customers</Text>
        {customers.length === 0 ? (
          <Text>No customers registered yet.</Text>
        ) : (
          customers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              style={[
                styles.customerItem,
                selectedCustomer?.id === customer.id ? styles.selectedCustomer : null,
              ]}
              onPress={() => selectCustomer(customer)}
            >
              <Text style={styles.customerText}>
                {customer.name} - {customer.phone}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Show Selected Customer Details */}
      {selectedCustomer && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Customer</Text>
          <Text>Name: {selectedCustomer.name}</Text>
          <Text>Phone: {selectedCustomer.phone}</Text>
          <Text>Address: {selectedCustomer.address}</Text>

          {/* Product Selection */}
          <Text style={styles.sectionTitle}>Select Products</Text>
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productItem}
              onPress={() => selectProduct(product)}
            >
              <Text>{product.name} - ${product.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Invoice Section */}
      {selectedProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice</Text>
          {selectedProducts.map((product) => (
            <View key={product.id} style={styles.invoiceItem}>
              <Text>{product.name}</Text>
              <Text>Qty:</Text>
              <TextInput
                style={styles.quantityInput}
                keyboardType="numeric"
                value={product.quantity.toString()}
                onChangeText={(text) => updateQuantity(product.id, Number(text))}
              />
              <TouchableOpacity onPress={() => removeProduct(product.id)}>
                <Text style={styles.removeText}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Text style={styles.totalAmount}>Total: ${totalAmount}</Text>
          <TouchableOpacity style={styles.button} onPress={sendInvoiceToAdmin}>
            <Text style={styles.buttonText}>Send Invoice to Admin</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reporting System */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Send Report</Text>
        <TextInput
          style={styles.input}
          placeholder="Write your report..."
          multiline
          value={newReport}
          onChangeText={setNewReport}
        />
        <TouchableOpacity style={styles.button} onPress={submitReport}>
          <Text style={styles.buttonText}>Submit Report</Text>
        </TouchableOpacity>

        {/* Report List */}
        <Text style={styles.sectionTitle}>Submitted Reports</Text>
        {reports.length === 0 ? (
          <Text>No reports submitted yet.</Text>
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.reportItem}>
              <Text>{report.text}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#007BFF" },
  section: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
  button: { backgroundColor: "#007BFF", padding: 12, borderRadius: 5, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  reportItem: { padding: 10, borderBottomWidth: 1, borderColor: "#ddd", marginVertical: 5 },
  customerItem: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 5,
  },
  selectedCustomer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 5,
    padding: 2
  },
  customerText: {
    fontSize: 14,
    color: "#333",
  },
  productItem: {
    padding: 10,
    backgroundColor: "#e6e6e6",
    borderRadius: 5,
    marginBottom: 10,
  },
  invoiceItem: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    width: 50,
    textAlign: "center",
  },
  removeText: {
    color: "red",
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 10,
  },
});
