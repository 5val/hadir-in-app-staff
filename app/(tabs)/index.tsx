import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function HomeScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      // Minta izin lokasi
      let { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        Alert.alert("Izin Ditolak", "Aplikasi butuh akses lokasi untuk absen.");
      }
      // Minta izin gallery
      if (!mediaPermission || mediaPermission.status !== 'granted') {
        await requestMediaPermission();
      }
    })();
  }, [mediaPermission]);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        setPhotoUri(photo.uri);
        
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      } catch (err) {
        Alert.alert("Error", "Gagal mengambil gambar.");
      }
    }
  };

  const handleSaveToGallery = async () => {
    if (!photoUri || !location) return;

    setIsSaving(true);
    try {
      // 1. Pastikan izin gallery diberikan
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error("Izin menyimpan ke gallery ditolak.");
      }

      // 2. Simpan foto ke Gallery (Folder DCIM/Camera)
      // MediaLibrary akan otomatis mengurus lokasi penyimpanan yang tepat di Android
      const asset = await MediaLibrary.createAssetAsync(photoUri);
      
      // 3. (Opsional) Masukkan ke album spesifik bernama "HadirIn"
      const albumName = 'HadirIn_Absen';
      const album = await MediaLibrary.getAlbumAsync(albumName);
      if (album === null) {
        await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      Alert.alert(
        "Berhasil!", 
        `Foto absen tersimpan di Gallery.\nLokasi: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
      );
      setPhotoUri(null);
    } catch (error: any) {
      Alert.alert("Gagal Simpan", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!cameraPermission) return <View />;
  if (!cameraPermission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>Izin kamera diperlukan</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={requestCameraPermission}>
          <Text style={{ color: 'white' }}>Beri Izin</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!photoUri ? (
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
              <View style={styles.captureInternal} />
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImg} />
          <Text style={styles.locationTxt}>
            📍 Lokasi: {location?.latitude.toFixed(5)}, {location?.longitude.toFixed(5)}
          </Text>
          
          {isSaving ? (
            <ActivityIndicator size="large" color="#34A853" />
          ) : (
            <>
              <TouchableOpacity style={styles.btnSave} onPress={handleSaveToGallery}>
                <Text style={styles.btnText}>Simpan ke Gallery HP</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setPhotoUri(null)}>
                <Text style={{ color: 'red', marginTop: 15 }}>Batal / Foto Ulang</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 40 },
  captureBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 5, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  captureInternal: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white' },
  previewContainer: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', padding: 20 },
  previewImg: { width: '100%', height: '55%', borderRadius: 15, marginBottom: 15, backgroundColor: '#ddd' },
  locationTxt: { fontSize: 16, fontWeight: 'bold', marginBottom: 25, color: '#333' },
  btnPrimary: { backgroundColor: '#000', padding: 15, borderRadius: 10, width: 200, alignItems: 'center' },
  btnSave: { backgroundColor: '#34A853', padding: 18, borderRadius: 12, width: '100%', alignItems: 'center', elevation: 3 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});