import React, { useRef, useState } from "react";
import { View, StyleSheet, Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import AWS from "aws-sdk";
import pako from "pako"; // Import pako for compression

export default function HomeScreen(): JSX.Element {
  const cameraRef = useRef<CameraView>(null);
  const [streaming, setStreaming] = useState(false);

  // AWS Kinesis Configuration
  const kinesisConfig = {
    region: "your-aws-region", // e.g., "us-east-1"
    accessKeyId: "keyId",
    secretAccessKey: "accessKey",
  };
  const kinesisVideo = new AWS.KinesisVideo(kinesisConfig);

  const startStreaming = async () => {
    if (!cameraRef.current) return;

    const streamName = "stream-name";

    // Capture and stream video frames
    const interval = setInterval(async () => {
      if (!streaming) {
        clearInterval(interval);
        return;
      }

      try {
        const photo = await cameraRef.current?.takePictureAsync({
          base64: true,
        });
        if (!photo?.base64) return;
        console.log(photo.uri);
        console.log("Starting streaming...");

        // Compress the base64 image before sending
        const compressedFrame = pako.gzip(photo.base64); // Compress using gzip

        const frame = Buffer.from(compressedFrame); // Convert to buffer
        // Fetch the PUT_MEDIA endpoint
        const endpointData = await kinesisVideo
          .getDataEndpoint({
            StreamName: streamName,
            APIName: "PUT_MEDIA",
          })
          .promise();

        if (endpointData.DataEndpoint) {
          console.log("DataEndpoint:", endpointData.DataEndpoint);

          const response = await fetch(endpointData.DataEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
            },
            body: frame,
          });

          if (response.ok) {
            console.log("Frame sent successfully:", response.status);
          } else {
            console.error("Error sending frame:", response.statusText);
          }
        } else {
          console.error("DataEndpoint is undefined");
        }
      } catch (error) {
        console.error("Error capturing or sending frame:", error);
      }
    }, 1000 / 30); // 30 FPS
  };

  const stopStreaming = () => {
    setStreaming(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} />
      </View>

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        {!streaming ? (
          <Button title="Start Streaming" onPress={startStreaming} />
        ) : (
          <Button title="Stop Streaming" onPress={stopStreaming} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 4, // Occupies most of the screen
  },
  buttonContainer: {
    backgroundColor: "white",
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
});
