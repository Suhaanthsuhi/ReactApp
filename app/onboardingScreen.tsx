import {
  Image,
  StyleSheet,
  Platform,
  Alert,
  Button,
  ScrollView,
} from "react-native";
import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SymbolView } from "expo-symbols";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { usePermissions } from "expo-media-library";
import { useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function OnboardingScreen() {
  const [cameraPermissions, requestCameraPermissions] = useCameraPermissions();
  const [microphonePermissions, requestMicrophonePermissions] =
    useMicrophonePermissions();
  const [mediaLibraryPermissions, requestMediaLibraryPermissions] =
    usePermissions();

  async function handleContinue() {
    const allPermissions = await requestAllPermissions();
    if (allPermissions) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("To continue please provide permissions");
    }
  }

  async function requestAllPermissions() {
    const cameraStatus = await requestCameraPermissions();
    if (!cameraStatus.granted) {
      Alert.alert("Error", "Camera permissions is required");
      return false;
    }

    const microphoneStatus = await requestMicrophonePermissions();
    if (!microphoneStatus.granted) {
      Alert.alert("Error", "Microphone permissions is required");
      return false;
    }

    const mediaLibraryStatus = await requestMediaLibraryPermissions();
    if (!mediaLibraryStatus.granted) {
      Alert.alert("Error", "Media Library permissions is required");
      return false;
    }

    await AsyncStorage.setItem("hasOpened", "true");
    return true;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <ThemedView style={styles.headerContainer}>
        <SymbolView
          name="camera.circle"
          size={250}
          type="hierarchical"
          tintColor={Colors.dark.icon}
          animationSpec={{
            effect: {
              type: "bounce",
            },
          }}
          fallback={
            <Image
              source={require("@/assets/images/partial-react-logo.png")}
              style={styles.reactLogo}
            />
          }
        />
      </ThemedView>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">AI Scanner!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Camera Permissions</ThemedText>
        <ThemedText>
          To continue allow camera permissions. You can go to settings and turn
          it on as well.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Microphone Permissions</ThemedText>
        <ThemedText>
          To continue allow microphone permissions. You can go to settings and
          turn it on as well.
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.stepContainer, { marginBottom: 20 }]}>
        <ThemedText type="subtitle">
          Step 3: Media Library Permissions
        </ThemedText>
        <ThemedText>
          To continue allow media library permissions. You can go to settings
          and turn it on as well.
        </ThemedText>
      </ThemedView>

      <Button title="Continue" onPress={handleContinue}></Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    justifyContent: "flex-start",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    marginTop: 5,
    gap: 5,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  logo: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  button: {},
});
