import { Camera, CameraType } from "expo-camera";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import socket from "./utils/socket";

export default function App() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState(null);

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  async function uploadImage(image) {
    let body = new FormData();
    body.append("files", {
      uri: image,
      name: "image.jpg",
      type: "image/jpg",
    });

    try {
      const response = await fetch("https://esp32.shanmukeshwar.dev/upload", {
        method: "POST",
        body,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const json = await response.text();
      console.log(json);
    } catch (error) {
      console.log(JSON.stringify(error.message));
    }
  }

  async function takePicture() {
    if (camera) {
      const data = await camera.takePictureAsync();
      console.log(data);
      uploadImage(data.uri);
    }
  }

  useEffect(() => {
    if (!camera) return;

    socket.on("capture", (data) => takePicture());
    socket.on("message", (data) => console.log(data));
  }, [socket, camera]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ratio="16:9"
        ref={(ref) => setCamera(ref)}
        style={styles.camera}
        type={type}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
