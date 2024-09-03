import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { registerBackgroundTask } from "./services/backgroundTasks";
import HomeScreen from "./screens/HomeScreen";
import CSVViewerScreen from "./screens/CSVViewerScreen";
import UsageStatsScreen from "./screens/TestScreen";

// Define the task name
const BACKGROUND_TASK_NAME = "BACKGROUND_FETCH_TASK";

// Task definition
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    // Perform your background fetch task
    console.log("Background task executed");
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.error("Error in background fetch task: ", error);
    return BackgroundFetch.Result.Failed;
  }
});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="CSV Viewer" component={CSVViewerScreen} />
      <Tab.Screen name="Test" component={UsageStatsScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  useEffect(() => {
    // Register the background fetch task when the app starts
    registerBackgroundTask().catch(console.error);

    // Additional setup or cleanup if needed
    return () => {
      // Cleanup or unregister tasks if needed
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
