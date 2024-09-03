import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as FileSystem from "expo-file-system";
import * as Brightness from "expo-brightness";
import DeviceInfo from "react-native-device-info";
import { useBatteryLevel } from "expo-battery";
import NetInfo from "@react-native-community/netinfo";

const BACKGROUND_TASK_NAME = "BACKGROUND_FETCH_TASK";

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const hardware = await DeviceInfo.getHardware();
    const currentBrightness = await Brightness.getBrightnessAsync();
    const locationEnabled = await DeviceInfo.isLocationEnabled();
    const netState = await NetInfo.fetch();
    const bluetoothConnected =
      await DeviceInfo.isBluetoothHeadphonesConnected();
    const powerStateInfo = await DeviceInfo.getPowerState();
    const batteryLevel = await useBatteryLevel(); // Ensure this hook is called correctly in background

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
    const wifiStatus = netState ? netState.type : "N/A";
    const data = `${timestamp},${(batteryLevel * 100).toFixed(
      2
    )},${wifiStatus},${powerStateInfo.batteryState},${
      bluetoothConnected ? "Yes" : "No"
    },${locationEnabled ? "Yes" : "No"},${(currentBrightness * 100).toFixed(
      2
    )}\n`;

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

    return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.error("Error in background fetch task: ", error);
    return BackgroundFetch.Result.Failed;
  }
});

export const registerBackgroundTask = async () => {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: 60 * 5, // 5 seconds for testing
    stopOnTerminate: false, // Continue running after the app is terminated
    startOnBoot: true, // Start the task on boot
  });
};
