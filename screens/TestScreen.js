// screens/UsageStatsScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  checkForPermission,
  queryUsageStats,
  showUsageAccessSettings,
  EventFrequency,
} from "@brighthustle/react-native-usage-stats-manager";

const UsageStatsScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);

  const requestPermission = async () => {
    const permission = await checkForPermission();
    if (!permission) {
      showUsageAccessSettings(""); // Open the settings screen for the user
    }
    setHasPermission(permission);
  };

  const fetchUsageStats = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(7, 0, 0, 0); // Set to 7 AM

      const endOfDay = new Date(currentDate);
      endOfDay.setHours(8, 0, 0, 0); // Set to 8 AM

      const startMilliseconds = startOfDay.getTime();
      const endMilliseconds = endOfDay.getTime();

      console.log(
        `Fetching stats from ${startOfDay.toLocaleString()} to ${endOfDay.toLocaleString()}`
      );

      const result = await queryUsageStats(
        EventFrequency.INTERVAL_DAILY,
        startMilliseconds,
        endMilliseconds
      );

      console.log("Fetched raw stats: ", result); // Log raw data for debugging

      // Check if totalTimeInForeground is actually zero or if there's an issue with the data itself
      Object.keys(result).forEach((packageName) => {
        console.log(
          `App: ${packageName}, Foreground Time: ${result[packageName].totalTimeInForeground}`
        );
      });

      const formattedStats = formatUsageStats(result);
      setStats(formattedStats);
    } catch (error) {
      console.error("Error fetching usage stats: ", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Converts to a human-readable string based on the locale
  };

  const formatUsageStats = (stats) => {
    return Object.keys(stats).map((packageName) => {
      const entry = stats[packageName];
      const appName = entry.appName;

      // Convert milliseconds to a readable format
      const firstTimeUsed = formatTimestamp(entry.firstTimeStamp);
      const lastTimeUsed = formatTimestamp(entry.lastTimeUsed);
      const lastTimeStamp = formatTimestamp(entry.lastTimeStamp);

      // Convert totalTimeInForeground from milliseconds to minutes
      const totalTimeInForegroundMinutes = entry.totalTimeInForeground / 60000; // Convert milliseconds to minutes

      return {
        appName,
        firstTimeUsed,
        lastTimeUsed,
        lastTimeStamp,
        totalTimeInForeground: Math.round(totalTimeInForegroundMinutes), // Round to nearest minute
      };
    });
  };

  useEffect(() => {
    const initialize = async () => {
      await requestPermission();
      if (hasPermission) {
        await fetchUsageStats();
      }
    };

    initialize();
  }, [hasPermission]);

  const renderStats = () => {
    if (!stats.length) {
      return <Text>No usage stats available.</Text>;
    }

    return stats.map((stat, index) => (
      <View key={index} style={styles.statItem}>
        <Text style={styles.appName}>{stat.appName}</Text>
        <Text style={styles.appUsage}>
          First Time Used: {stat.firstTimeUsed}
        </Text>
        <Text style={styles.appUsage}>Last Time Used: {stat.lastTimeUsed}</Text>
        <Text style={styles.appUsage}>
          Last Timestamp: {stat.lastTimeStamp}
        </Text>
        <Text style={styles.appUsage}>
          Total Time in Foreground: {stat.totalTimeInForeground} minutes
        </Text>
      </View>
    ));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : hasPermission ? (
          <View>
            <Text style={styles.header}>Usage Stats:</Text>
            {renderStats()}
          </View>
        ) : (
          <Text>Permission not granted. Please check the settings.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  content: {
    width: "100%",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statItem: {
    marginVertical: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  appUsage: {
    fontSize: 14,
  },
});

export default UsageStatsScreen;
