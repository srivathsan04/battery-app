// screens/CSVViewerScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  ActivityIndicator,
} from "react-native";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";

const CSVViewerScreen = () => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCsvData = async () => {
    setLoading(true);
    const path = `${FileSystem.documentDirectory}usage_data.csv`;
    try {
      const fileContent = await FileSystem.readAsStringAsync(path);
      Papa.parse(fileContent, {
        header: true,
        complete: (results) => {
          setCsvData(results.data);
          setLoading(false);
        },
        error: (error) => {
          console.error("Error parsing CSV: ", error);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Error reading file: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCsvData();
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Reload" onPress={loadCsvData} color="#007BFF" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {csvData.length > 0 ? (
            csvData.map((row, index) => (
              <View key={index} style={styles.rowContainer}>
                {Object.values(row).map((value, i) => (
                  <Text key={i} style={styles.rowText}>
                    {value}
                  </Text>
                ))}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No data available</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  scrollView: {
    marginTop: 10,
  },
  rowContainer: {
    flexDirection: "row",
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginRight: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#007BFF",
    marginTop: 10,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default CSVViewerScreen;
