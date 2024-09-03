import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export const createCSV = async (data) => {
  let csvContent = "data:text/csv;charset=utf-8,";
  data.forEach((rowArray) => {
    let row = rowArray.join(",");
    csvContent += row + "\r\n";
  });

  const fileUri = FileSystem.documentDirectory + "data.csv";
  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return fileUri;
};

export const shareCSV = async (uri) => {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  } else {
    alert("Sharing is not available on this device");
  }
};
