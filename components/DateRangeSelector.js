import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";

const DateRangeSelector = ({ onSelectRange }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApply = () => {
    if (!startDate || !endDate) {
      Alert.alert("Error", "Please enter both start and end dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert("Error", "Please enter valid dates in YYYY-MM-DD format.");
      return;
    }

    if (start > end) {
      Alert.alert("Error", "Start date cannot be after end date.");
      return;
    }

    onSelectRange(start, end);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Start Date (YYYY-MM-DD):</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={startDate}
        onChangeText={setStartDate}
      />
      <Text style={styles.label}>End Date (YYYY-MM-DD):</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={endDate}
        onChangeText={setEndDate}
      />
      <Button title="Apply Date Range" onPress={handleApply} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});

export default DateRangeSelector;
