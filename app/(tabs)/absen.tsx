import { BrandColors, NeutralColors, SemanticColors } from "@/constants/theme";
import { useOffice } from "@/context/OfficeContext";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function AttendanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { officeLocation } = useOffice();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>(
    "Mengambil lokasi...",
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      // Request location permission
      let { status: locStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (locStatus !== "granted") {
        Alert.alert(
          "Izin Ditolak",
          "Aplikasi membutuhkan akses lokasi untuk absensi.",
        );
        return;
      }

      // Get current location
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);

        // Get address from coordinates
        const addresses = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (addresses.length > 0) {
          const addr = addresses[0];
          setLocationAddress(
            `${addr.street || ""} ${addr.district || ""}, ${addr.city || addr.region || ""}`,
          );
        }
      } catch (error) {
        console.log("Error getting location:", error);
        setLocationAddress("Lokasi tidak tersedia");
      }

      // Request media permission
      if (!mediaPermission || mediaPermission.status !== "granted") {
        await requestMediaPermission();
      }
    })();

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [mediaPermission]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });
        setPhotoUri(photo.uri);

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      } catch (err) {
        Alert.alert("Error", "Gagal mengambil gambar. Silakan coba lagi.");
      }
    }
  };

  // Fungsi Haversine untuk hitung jarak
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Hasil dalam meter
  };

  const handleSaveAttendance = async () => {
    if (!photoUri || !location) return;

    // 1. Cek Lokasi
    const targetLat = parseFloat(officeLocation.lat as string);
    const targetLng = parseFloat(officeLocation.lng as string);
    const targetRadius = parseFloat(officeLocation.radius as string);

    // LOGIKA PENGECEKAN
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      targetLat,
      targetLng,
    );

    if (distance > targetRadius) {
      const distanceFromArea = Math.round(distance - targetRadius);
      Alert.alert(
        "Di Luar Jangkauan ❌",
        `Anda berjarak ${distanceFromArea} meter dari area absen.`,
      );
      return;
    }

    setIsSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Izin menyimpan ke gallery ditolak.");
      }

      const asset = await MediaLibrary.createAssetAsync(photoUri);

      const albumName = "HadirIn_Absen";
      const album = await MediaLibrary.getAlbumAsync(albumName);
      if (album === null) {
        await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      // Alert.alert(
      //   "Absensi Berhasil! ✅",
      //   `Foto absen tersimpan.\n\n📍 ${locationAddress}\n🕐 ${formatTime(new Date())}`,
      //   [{ text: "OK", onPress: () => setPhotoUri(null) }],
      // );
      Alert.alert(
        "Absensi Berhasil! ✅",
        `Foto absen tersimpan.\n\n📍 ${locationAddress}\n🕐 ${formatTime(new Date())}`,
        [
          {
            text: "Selesai",
            onPress: () => {
              setPhotoUri(null);

              router.replace({
                pathname: "/(tabs)",
                params: {
                  status: "success",
                  time: formatTime(new Date()),
                  address: locationAddress,
                  ts: Date.now(),
                },
              });
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert("Gagal Menyimpan", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Permission request screen
  if (!cameraPermission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandColors.navy} />
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient
          colors={["#F8FAFC", "#F1F5F9", "#E0F7FA"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.permissionContent}>
          <View style={styles.permissionIconContainer}>
            <Ionicons
              name="camera-outline"
              size={48}
              color={BrandColors.navy}
            />
          </View>
          <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
          <Text style={styles.permissionText}>
            Untuk melakukan absensi dengan foto, aplikasi memerlukan akses ke
            kamera Anda.
          </Text>
          <TouchableOpacity
            onPress={requestCameraPermission}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[BrandColors.navy, BrandColors.navyDark]}
              style={styles.permissionButton}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="white"
              />
              <Text style={styles.permissionButtonText}>Beri Izin Kamera</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Photo preview screen
  if (photoUri) {
    // Calculate distance from current location to office location
    const targetLat = parseFloat(officeLocation.lat as string);
    const targetLng = parseFloat(officeLocation.lng as string);
    const targetRadius = parseFloat(officeLocation.radius as string);

    let distance = 0;
    let isWithinRadius = false;

    if (
      location &&
      !isNaN(targetLat) &&
      !isNaN(targetLng) &&
      !isNaN(targetRadius)
    ) {
      distance = calculateDistance(
        location.latitude,
        location.longitude,
        targetLat,
        targetLng,
      );
      isWithinRadius = distance <= targetRadius;
    }

    return (
      <View style={styles.previewContainer}>
        <StatusBar style="dark" />

        {/* Header */}
        <View style={styles.previewHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setPhotoUri(null)}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={NeutralColors.slate800}
            />
          </TouchableOpacity>
          <Text style={styles.previewTitle}>Konfirmasi Absensi</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Photo Preview */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.photoWrapper}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: SemanticColors.infoBg },
                ]}
              >
                <Ionicons
                  name="location"
                  size={18}
                  color={SemanticColors.info}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Lokasi</Text>
                <Text style={styles.infoValue}>{locationAddress}</Text>
                {location && (
                  <Text style={styles.infoCoords}>
                    {location.latitude.toFixed(6)},{" "}
                    {location.longitude.toFixed(6)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: SemanticColors.successBg },
                ]}
              >
                <Ionicons
                  name="time"
                  size={18}
                  color={SemanticColors.success}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Waktu</Text>
                <Text style={styles.infoValue}>{formatTime(currentTime)}</Text>
                <Text style={styles.infoCoords}>{formatDate(currentTime)}</Text>
              </View>
            </View>
          </View>

          {/* Radius Status Card */}
          <View
            style={[
              styles.radiusStatusCard,
              {
                backgroundColor: isWithinRadius
                  ? SemanticColors.successBg
                  : SemanticColors.errorBg,
              },
            ]}
          >
            <View style={styles.radiusStatusHeader}>
              <Ionicons
                name={isWithinRadius ? "checkmark-circle" : "close-circle"}
                size={24}
                color={
                  isWithinRadius ? SemanticColors.success : SemanticColors.error
                }
              />
              <Text
                style={[
                  styles.radiusStatusTitle,
                  {
                    color: isWithinRadius
                      ? SemanticColors.success
                      : SemanticColors.error,
                  },
                ]}
              >
                {isWithinRadius ? "Dalam Radius Absen" : "Di Luar Radius Absen"}
              </Text>
            </View>
            <Text
              style={[
                styles.radiusStatusText,
                {
                  color: isWithinRadius
                    ? SemanticColors.success
                    : SemanticColors.error,
                },
              ]}
            >
              {isWithinRadius
                ? `Anda berada dalam area absen (${Math.round(distance)} meter dari titik pusat, radius ${targetRadius} meter).`
                : `Anda berjarak ${Math.round(distance - targetRadius)} meter dari area absen.`}
            </Text>
            {!isWithinRadius && (
              <Text style={styles.radiusStatusHint}>
                Silakan foto ulang di lokasi yang sesuai.
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isSaving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="large" color={BrandColors.navy} />
                <Text style={styles.savingText}>Menyimpan absensi...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => setPhotoUri(null)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={NeutralColors.slate700}
                  />
                  <Text style={styles.retakeButtonText}>Foto Ulang</Text>
                </TouchableOpacity>

                {isWithinRadius && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSaveAttendance}
                  >
                    <LinearGradient
                      colors={[SemanticColors.success, "#16A34A"]}
                      style={styles.confirmButton}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="white"
                      />
                      <Text style={styles.confirmButtonText}>
                        Simpan Absensi
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Camera screen
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <CameraView style={styles.camera} ref={cameraRef} facing="front">
        {/* Header Overlay */}
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent"]}
          style={styles.headerOverlay}
        >
          <Text style={styles.cameraTitle}>Absensi Foto</Text>
          <Text style={styles.cameraTime}>{formatTime(currentTime)}</Text>
        </LinearGradient>

        {/* Face Guide */}
        <View style={styles.faceGuide}>
          <View style={styles.faceGuideInner} />
        </View>

        {/* Bottom Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.bottomOverlay}
        >
          {/* Location Info */}
          <View style={styles.locationBar}>
            <Ionicons name="location" size={16} color={BrandColors.cyan} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationAddress}
            </Text>
          </View>

          {/* Capture Button */}
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[BrandColors.cyan, BrandColors.lime]}
                style={styles.captureButtonInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="camera" size={32} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.captureHint}>
            Posisikan wajah dalam bingkai, lalu tekan tombol
          </Text>
        </LinearGradient>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: NeutralColors.white,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  permissionContent: {
    alignItems: "center",
    maxWidth: 320,
  },
  permissionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: `${BrandColors.navy}10`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: NeutralColors.slate900,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 15,
    color: NeutralColors.slate600,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    paddingHorizontal: 32,
    borderRadius: 14,
    gap: 10,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  camera: {
    flex: 1,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  cameraTime: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 2,
  },
  faceGuide: {
    position: "absolute",
    top: "25%",
    left: "50%",
    marginLeft: -100,
    width: 200,
    height: 260,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "rgba(77, 208, 225, 0.6)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  faceGuideInner: {
    width: 180,
    height: 240,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
    maxWidth: width - 40,
    gap: 8,
  },
  locationText: {
    fontSize: 13,
    color: "white",
    flex: 1,
  },
  captureContainer: {
    marginBottom: 16,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  captureButtonInner: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  captureHint: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: NeutralColors.slate50,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: NeutralColors.white,
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.slate100,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: NeutralColors.slate100,
    justifyContent: "center",
    alignItems: "center",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: NeutralColors.slate900,
  },
  photoWrapper: {
    padding: 20,
    alignItems: "center",
  },
  previewImage: {
    width: width - 40,
    height: (width - 40) * 1.2,
    borderRadius: 20,
    backgroundColor: NeutralColors.slate200,
  },
  infoCard: {
    backgroundColor: NeutralColors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: NeutralColors.slate500,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: NeutralColors.slate900,
  },
  infoCoords: {
    fontSize: 12,
    color: NeutralColors.slate400,
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: NeutralColors.slate100,
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
    marginBottom: 20,
  },
  savingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  savingText: {
    marginTop: 12,
    fontSize: 14,
    color: NeutralColors.slate600,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    paddingHorizontal: 24,
    backgroundColor: NeutralColors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: NeutralColors.slate200,
    gap: 8,
  },
  retakeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: NeutralColors.slate700,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Radius Status Card Styles
  radiusStatusCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  radiusStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  radiusStatusTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  radiusStatusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  radiusStatusHint: {
    fontSize: 13,
    color: NeutralColors.slate600,
    marginTop: 8,
    fontStyle: "italic",
  },
});
