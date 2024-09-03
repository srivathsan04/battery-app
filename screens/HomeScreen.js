import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import * as Brightness from "expo-brightness";
import DeviceInfo from "react-native-device-info";
import { useBatteryLevel } from "expo-battery";
import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Picker } from "@react-native-picker/picker";

const intervalOptions = [
  { label: "5 seconds", value: 5 },
  { label: "10 seconds", value: 10 },
  { label: "30 seconds", value: 30 },
  { label: "30 minutes", value: 30 * 60 },
  { label: "60 minutes", value: 60 * 60 },
];

const HomeScreen = () => {
  const batteryLevel = useBatteryLevel(); // Battery level from expo-battery
  const [hardwareInfo, setHardwareInfo] = useState("");
  const [brightness, setBrightness] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(null);
  const [batteryState, setBatteryState] = useState(null);
  const [saveInterval, setSaveInterval] = useState(30); // Default save interval in seconds

  const fetchDeviceInfo = async () => {
    try {
      const hardware = await DeviceInfo.getHardware();
      setHardwareInfo(hardware);

      const currentBrightness = await Brightness.getBrightnessAsync();
      setBrightness(currentBrightness);

      const locationEnabled = await DeviceInfo.isLocationEnabled();
      setIsLocationEnabled(locationEnabled);

      const netState = await NetInfo.fetch();
      setNetworkInfo(netState);

      const bluetoothConnected =
        await DeviceInfo.isBluetoothHeadphonesConnected();
      setIsBluetoothConnected(bluetoothConnected);

      const powerStateInfo = await DeviceInfo.getPowerState();
      setBatteryState(powerStateInfo.batteryState);
    } catch (error) {
      console.error("Error fetching device info: ", error);
    }
  };

  const saveData = async () => {
    const timestamp = new Date()
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(",", "");
    const wifiStatus = networkInfo ? networkInfo.type : "N/A";
    const data = `${timestamp},${(batteryLevel * 100).toFixed(
      2
    )},${wifiStatus},${batteryState},${isBluetoothConnected ? "Yes" : "No"},${
      isLocationEnabled ? "Yes" : "No"
    },${(brightness * 100).toFixed(2)}\n`;

    const path = `${FileSystem.documentDirectory}usage_data.csv`;

    let existingData = "";
    try {
      existingData = await FileSystem.readAsStringAsync(path);
    } catch (error) {
      // File does not exist, so no existing data
    }

    const header =
      "Timestamp,Battery Level,WiFi Status,Power State,Bluetooth Connected,Location Enabled,Brightness\n";

    let newData;
    if (existingData.length === 0) {
      newData = header + data;
    } else {
      newData = existingData + data;
    }

    await FileSystem.writeAsStringAsync(path, newData);

    Alert.alert("Data Saved", `Data saved to ${path}`);
  };

  const deleteFile = async () => {
    const path = `${FileSystem.documentDirectory}usage_data.csv`;
    try {
      const fileInfo = await FileSystem.getInfoAsync(path);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(path);
        Alert.alert("File Deleted", "The file has been deleted successfully.");
      } else {
        Alert.alert("Error", "No file to delete.");
      }
    } catch (error) {
      console.error("Error deleting file: ", error);
      Alert.alert("Error", "An error occurred while deleting the file.");
    }
  };

  const shareData = async () => {
    const path = `${FileSystem.documentDirectory}usage_data.csv`;
    if (!(await FileSystem.getInfoAsync(path)).exists) {
      Alert.alert("Error", "No data to share");
      return;
    }
    await Sharing.shareAsync(path);
  };

  useEffect(() => {
    // Fetch device info on mount
    fetchDeviceInfo();

    // Set up network info listener
    const networkListener = NetInfo.addEventListener((state) => {
      setNetworkInfo(state);
    });

    // Fetch device info every 5 seconds
    const fetchIntervalId = setInterval(fetchDeviceInfo, 5000); // Every 5 seconds

    // Save data based on user-defined interval
    const saveIntervalId = setInterval(saveData, saveInterval * 1000); // Convert seconds to milliseconds

    // Cleanup listeners and intervals on component unmount
    return () => {
      networkListener();
      clearInterval(fetchIntervalId);
      clearInterval(saveIntervalId);
    };
  }, [saveInterval]); // Dependency array includes saveInterval

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Current Battery Level: {(batteryLevel * 100).toFixed(2)}%
        </Text>
        <Text style={styles.infoText}>
          Hardware Information: {hardwareInfo}
        </Text>
        <Text style={styles.infoText}>
          Current Brightness: {(brightness * 100).toFixed(2)}%
        </Text>
        <Text style={styles.infoText}>
          Location Services Enabled: {isLocationEnabled ? "Yes" : "No"}
        </Text>
        <Text style={styles.infoText}>
          Connection Type: {networkInfo ? networkInfo.type : "N/A"}
        </Text>
        <Text style={styles.infoText}>
          Bluetooth Connected: {isBluetoothConnected ? "Yes" : "No"}
        </Text>
        <Text style={styles.infoText}>Power State: {batteryState}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Reload" onPress={fetchDeviceInfo} />
        <Button title="Save Data" onPress={saveData} />
        <Button title="Share Data" onPress={shareData} />
        <Button title="Delete Data File" onPress={deleteFile} />
      </View>

      <View style={styles.intervalContainer}>
        <Text style={styles.infoText}>Set Save Interval:</Text>
        <Picker
          selectedValue={saveInterval}
          style={styles.picker}
          onValueChange={(itemValue) => setSaveInterval(itemValue)}
        >
          {intervalOptions.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 8,
    color: "#333",
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  intervalContainer: {
    marginTop: 20,
  },
  picker: {
    height: 50,
    width: 200,
  },
});

export default HomeScreen;
