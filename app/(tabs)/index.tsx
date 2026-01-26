import { GOOGLE_MAPS_API_KEY } from "@/constants/google";
import { BrandColors, NeutralColors, SemanticColors } from "@/constants/theme";
import { useOffice } from "@/context/OfficeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  NativeModules,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// react-native-maps is a native module and will crash in plain Expo Go if
// imported at module load. We'll require it dynamically when needed and
// fallback to a friendly message when it's unavailable.

const { width } = Dimensions.get("window");

const mockStaffData = {
  name: "Ahmad Fauzi",
  position: "Software Engineer",
  department: "IT & Development",
  avatar: "AF",
  todayStatus: "belum-absen",
  checkInTime: null,
  checkOutTime: null,
};

// ... (Mock stats dan history tetap sama seperti kode Anda)

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  //   const [officeLocation, setOfficeLocation] = useState({
  //     lat: "-7.291547",
  //     lng: "112.759209",
  //     radius: "100",
  //   });
  const { officeLocation, setOfficeLocation } = useOffice();
  const insets = useSafeAreaInsets();

  // Map / search states for dummy location picker
  const [mapVisible, setMapVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [markerCoord, setMarkerCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(
    officeLocation?.lat && officeLocation?.lng
      ? { lat: Number(officeLocation.lat), lng: Number(officeLocation.lng) }
      : null,
  );

  // State untuk status absen (null = belum absen, object = sudah absen)
  const [attendanceData, setAttendanceData] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const mockAttendanceHistory = [
    {
      date: "Selasa, 20 Jan 2026",
      checkIn: "07:55",
      checkOut: "17:05",
      status: "Hadir",
    },
    {
      date: "Senin, 19 Jan 2026",
      checkIn: "08:05",
      checkOut: "17:30",
      status: "Hadir",
    },
    {
      date: "Jumat, 16 Jan 2026",
      checkIn: "09:15",
      checkOut: "17:00",
      status: "Terlambat",
    },
    {
      date: "Kamis, 15 Jan 2026",
      checkIn: "-",
      checkOut: "-",
      status: "Izin",
    },
    {
      date: "Rabu, 14 Jan 2026",
      checkIn: "07:50",
      checkOut: "17:15",
      status: "Hadir",
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Request location permission when Home screen mounts (first open after login)
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Izin Lokasi Dibutuhkan",
            "Aplikasi membutuhkan akses lokasi. Mohon aktifkan layanan lokasi pada perangkat Anda.",
            [{ text: "OK" }],
          );
        } else {
          // Warm up: get current position (optional)
          try {
            await Location.getCurrentPositionAsync({});
          } catch (e) {
            // ignore get position errors
          }
        }
      } catch (e) {
        console.warn("Location permission error:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (params.status === "success" && params.ts !== attendanceData?.ts) {
      setAttendanceData({
        time: params.time,
        address: params.address,
        date: new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      });
    }
  }, [params.status, params.ts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  // Fetch autocomplete predictions from Google Places Autocomplete API
  const fetchPredictions = async (input: string) => {
    if (!GOOGLE_MAPS_API_KEY) {
      setPredictions([]);
      return;
    }
    if (!input || input.length < 2) {
      setPredictions([]);
      return;
    }
    setLoadingPredictions(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input,
      )}&key=${GOOGLE_MAPS_API_KEY}&language=id&components=country:id`;
      const res = await fetch(url);
      const json = await res.json();
      setPredictions(json.predictions || []);
    } catch (e) {
      console.warn("Places autocomplete error", e);
      setPredictions([]);
    } finally {
      setLoadingPredictions(false);
    }
  };

  // When user selects a prediction, fetch place details to get coords
  const selectPrediction = async (placeId: string, description: string) => {
    if (!GOOGLE_MAPS_API_KEY) {
      Alert.alert(
        "Google API Key Missing",
        "Silakan set `GOOGLE_MAPS_API_KEY` di `constants/google.ts` untuk mengaktifkan pencarian.",
      );
      return;
    }
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,name,formatted_address`;
      const res = await fetch(url);
      const json = await res.json();
      const loc = json.result?.geometry?.location;
      if (loc) {
        const lat = loc.lat;
        const lng = loc.lng;
        setMarkerCoord({ lat, lng });
        setOfficeLocation({
          lat: String(lat),
          lng: String(lng),
          radius: officeLocation.radius,
        });
        setSearchQuery(description);
        setPredictions([]);
      } else {
        Alert.alert("Tidak dapat mendapatkan lokasi");
      }
    } catch (e) {
      console.warn("Place details error", e);
      Alert.alert("Terjadi kesalahan saat mengambil detail tempat");
    }
  };

  const onMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerCoord({ lat: latitude, lng: longitude });
    setOfficeLocation({
      lat: String(latitude),
      lng: String(longitude),
      radius: officeLocation.radius,
    });
  };

  // Helper to check whether react-native-maps native module is available.
  // Do NOT require('react-native-maps') here because that JS file will attempt
  // to access the native TurboModule at module-load time and crash in Expo Go.
  // Instead check NativeModules for the native implementation.
  const isMapsAvailable = () => {
    try {
      const nm: any = NativeModules;
      return !!(nm && (nm.RNMapsAirModule || nm.AirMapManager || nm.AirMaps));
    } catch (e) {
      return false;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Hadir":
        return {
          bg: SemanticColors.successBg,
          color: SemanticColors.success,
          icon: "checkmark-circle",
        };
      case "Terlambat":
        return {
          bg: SemanticColors.warningBg,
          color: SemanticColors.warning,
          icon: "time",
        };
      case "Izin":
        return {
          bg: SemanticColors.infoBg,
          color: SemanticColors.info,
          icon: "document-text",
        };
      case "Cuti":
        return {
          bg: `${BrandColors.lime}20`,
          color: BrandColors.lime,
          icon: "calendar",
        };
      default:
        return {
          bg: NeutralColors.slate100,
          color: NeutralColors.slate500,
          icon: "help-circle",
        };
    }
  };

  // Navigasi khusus ke halaman absen
  const goToAbsen = () => {
    //  router.push({
    //    pathname: "/absen",
    //    params: {
    //      lat: officeLocation.lat,
    //      lng: officeLocation.lng,
    //      radius: officeLocation.radius,
    //    },
    //  });
    router.push("/absen");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Tetap di Atas */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[BrandColors.navy, BrandColors.navyDark]}
          style={styles.headerGradient}
        >
          <View style={styles.profileRow}>
            <View style={styles.profileInfo}>
              <LinearGradient
                colors={[BrandColors.cyan, BrandColors.lime]}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>{mockStaffData.avatar}</Text>
              </LinearGradient>
              <View style={styles.profileText}>
                <Text style={styles.greeting}>Selamat Datang,</Text>
                <Text style={styles.userName}>{mockStaffData.name}</Text>
                <Text style={styles.userPosition}>
                  {mockStaffData.position}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={22} color="white" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          <View style={styles.clockCard}>
            <Text style={styles.clockTime}>
              {currentTime.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </Text>
            <Text style={styles.clockDate}>
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* ScrollView dengan margin adjustment agar tidak nembus lengkungan */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={BrandColors.navy}
          />
        }
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Status Card - Highlight Utama */}
          {/* <View style={styles.statusSection}>
            <View style={styles.statusCard}>
              <View style={styles.notYetCheckedIn}>
                <View style={styles.statusIconContainer}>
                  <Ionicons
                    name="time-outline"
                    size={32}
                    color={SemanticColors.warning}
                  />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusLabel}>Belum Absen Hari Ini</Text>
                  <Text style={styles.statusHint}>
                    Pastikan Anda berada di area kantor
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.mainCheckInBtn}
                  onPress={goToAbsen}
                >
                  <LinearGradient
                    colors={[BrandColors.navy, "#2A4B7C"]}
                    style={styles.checkInGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.checkInText}>Absen Sekarang</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View> */}

          <View style={styles.statusSection}>
            <View style={styles.statusCard}>
              {!attendanceData ? (
                /* STATE: BELUM ABSEN */
                <View style={styles.notYetCheckedIn}>
                  <View style={styles.statusIconContainer}>
                    <Ionicons
                      name="time-outline"
                      size={32}
                      color={SemanticColors.warning}
                    />
                  </View>
                  <View style={styles.statusNotTextContainer}>
                    <Text style={styles.statusLabel}>Belum Absen Hari Ini</Text>
                    <Text style={styles.statusNotHint}>
                      Pastikan Anda berada di area kantor
                    </Text>
                  </View>

                  <TouchableOpacity onPress={goToAbsen}>
                    <LinearGradient
                      colors={[BrandColors.navy, "#2A4B7C"]}
                      style={styles.checkInGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="camera" size={20} color="white" />
                      <Text style={styles.checkInText}>Absen Sekarang</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                /* STATE: SUDAH ABSEN (REKAP) */
                <View style={styles.checkedIn}>
                  <View
                    style={[
                      styles.statusIconContainer,
                      { backgroundColor: SemanticColors.successBg },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={32}
                      color={SemanticColors.success}
                    />
                  </View>
                  <View style={styles.statusInTextContainer}>
                    <Text
                      style={[
                        styles.statusLabel,
                        { color: SemanticColors.success },
                      ]}
                    >
                      Sudah Absen Masuk
                    </Text>
                    <Text style={styles.statusInHint}>
                      {attendanceData.time}
                    </Text>
                    <Text style={styles.statusInHint}>
                      {attendanceData.date}
                    </Text>
                  </View>

                  <View style={styles.statusBadgeSuccess}>
                    <Text style={styles.statusBadgeText}>TEPAT WAKTU</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Tambahan Info Alamat jika sudah absen */}
            {attendanceData && (
              <View style={styles.locationInfoMini}>
                <Ionicons
                  name="location"
                  size={14}
                  color={NeutralColors.slate400}
                />
                <Text style={styles.locationTextMini} numberOfLines={1}>
                  {attendanceData.address}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Layanan Cepat</Text>
            <View style={styles.quickActionsGrid}>
              {[
                {
                  label: "Absen",
                  icon: "camera",
                  color: BrandColors.navy,
                  action: goToAbsen,
                },
                {
                  label: "Izin",
                  icon: "document-text",
                  color: SemanticColors.warning,
                  action: () => { },
                },
                {
                  label: "Cuti",
                  icon: "calendar",
                  color: SemanticColors.info,
                  action: () => { },
                },
                {
                  label: "Riwayat",
                  icon: "time",
                  color: BrandColors.lime,
                  action: () => { },
                },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickActionItem}
                  onPress={item.action}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: `${item.color}10` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.quickActionLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ringkasan Kehadiran</Text>
            <View style={styles.statsRow}>
              <StatBox
                label="Hadir"
                value="18"
                color={SemanticColors.success}
                bg={SemanticColors.successBg}
              />
              <StatBox
                label="Telat"
                value="2"
                color={SemanticColors.warning}
                bg={SemanticColors.warningBg}
              />
              <StatBox
                label="Izin"
                value="1"
                color={SemanticColors.info}
                bg={SemanticColors.infoBg}
              />
              <StatBox
                label="Cuti"
                value="0"
                color={SemanticColors.error}
                bg={SemanticColors.errorBg}
              />
            </View>
          </View>

          {/* Attendance History */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Riwayat Kehadiran</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.historyCard}>
              {mockAttendanceHistory.map((item, index) => {
                const badge = getStatusBadge(item.status); // Fungsi getStatusBadge tetap menggunakan yang sebelumnya
                return (
                  <View
                    key={index}
                    style={[
                      styles.historyItem,
                      index !== mockAttendanceHistory.length - 1 &&
                      styles.historyItemBorder,
                    ]}
                  >
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyDate}>{item.date}</Text>
                      <View style={styles.historyTimes}>
                        <View style={styles.historyTimeItem}>
                          <Ionicons
                            name="log-in-outline"
                            size={14}
                            color={NeutralColors.slate400}
                          />
                          <Text style={styles.historyTimeText}>
                            {item.checkIn}
                          </Text>
                        </View>
                        <View style={styles.historyTimeItem}>
                          <Ionicons
                            name="log-out-outline"
                            size={14}
                            color={NeutralColors.slate400}
                          />
                          <Text style={styles.historyTimeText}>
                            {item.checkOut}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.historyBadge,
                        { backgroundColor: badge.bg },
                      ]}
                    >
                      <Ionicons
                        name={badge.icon as any}
                        size={12}
                        color={badge.color}
                      />
                      <Text
                        style={[
                          styles.historyBadgeText,
                          { color: badge.color },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* INPUT DUMMY LOCATION SEMENTARA */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: "#FEF3C7",
                padding: 15,
                borderRadius: 15,
                marginHorizontal: 20,
              },
            ]}
          >
            <Text
              style={{ fontWeight: "bold", marginBottom: 12, color: "#92400E" }}
            >
              ⚙️ Titik Absen Dummy (Dev Only)
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dummyLabel}>Latitude</Text>
                <TextInput
                  placeholder="Lat"
                  style={styles.dummyInput}
                  value={officeLocation.lat}
                  onChangeText={(v) =>
                    setOfficeLocation({ ...officeLocation, lat: v })
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dummyLabel}>Longitude</Text>
                <TextInput
                  placeholder="Lng"
                  style={styles.dummyInput}
                  value={officeLocation.lng}
                  onChangeText={(v) =>
                    setOfficeLocation({ ...officeLocation, lng: v })
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dummyLabel}>Radius (m)</Text>
                <TextInput
                  placeholder="Radius"
                  style={styles.dummyInput}
                  value={officeLocation.radius}
                  keyboardType="numeric"
                  onChangeText={(v) =>
                    setOfficeLocation({ ...officeLocation, radius: v })
                  }
                />
              </View>
            </View>

            {/* Tombol untuk menerapkan/set state secara formal */}
            <TouchableOpacity
              style={styles.applyDummyBtn}
              onPress={() => {
                Alert.alert(
                  "Konfigurasi Disimpan",
                  `Titik Absen: ${officeLocation.lat}, ${officeLocation.lng}\nRadius: ${officeLocation.radius}m`,
                );
              }}
            >
              <Ionicons name="save-outline" size={16} color="white" />
              <Text style={styles.applyDummyText}>Terapkan Parameter</Text>
            </TouchableOpacity>

            <View style={{ height: 10 }} />
            <TouchableOpacity
              style={[
                styles.applyDummyBtn,
                { backgroundColor: BrandColors.cyan },
              ]}
              onPress={() => setMapVisible(true)}
            >
              <Ionicons name="map" size={16} color="white" />
              <Text style={styles.applyDummyText}>Buka Peta / Cari Lokasi</Text>
            </TouchableOpacity>

            {/* Map Modal for search + pin */}
            <Modal
              visible={mapVisible}
              animationType="slide"
              onRequestClose={() => setMapVisible(false)}
            >
              <View style={styles.mapModalContainer}>
                {/* Header with SafeArea padding */}
                <LinearGradient
                  colors={[BrandColors.navy, BrandColors.navyDark]}
                  style={[styles.mapModalHeader, { paddingTop: insets.top + 12 }]}
                >
                  <View style={styles.mapModalHeaderRow}>
                    <View style={styles.mapModalSearchContainer}>
                      <Ionicons name="search" size={18} color={NeutralColors.slate400} style={{ marginRight: 8 }} />
                      <TextInput
                        placeholder="Cari tempat atau alamat..."
                        placeholderTextColor={NeutralColors.slate400}
                        value={searchQuery}
                        onChangeText={(t) => {
                          setSearchQuery(t);
                          fetchPredictions(t);
                        }}
                        style={styles.mapModalSearchInput}
                      />
                      {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(""); setPredictions([]); }}>
                          <Ionicons name="close-circle" size={18} color={NeutralColors.slate400} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => setMapVisible(false)}
                      style={styles.mapModalCloseBtn}
                    >
                      <Text style={styles.mapModalCloseBtnText}>Tutup</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>

                {/* Loading Predictions */}
                {loadingPredictions && (
                  <View style={styles.mapModalLoadingPredictions}>
                    <ActivityIndicator size="small" color={BrandColors.navy} />
                  </View>
                )}

                {/* Predictions List */}
                {predictions.length > 0 && (
                  <View style={styles.mapModalPredictionsContainer}>
                    <FlatList
                      data={predictions}
                      keyExtractor={(i) => i.place_id}
                      showsVerticalScrollIndicator={false}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.mapModalPredictionItem}
                          onPress={() =>
                            selectPrediction(item.place_id, item.description)
                          }
                        >
                          <Ionicons name="location-outline" size={18} color={BrandColors.navy} style={{ marginRight: 12 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.mapModalPredictionMainText}>
                              {item.structured_formatting?.main_text}
                            </Text>
                            <Text style={styles.mapModalPredictionSecondaryText} numberOfLines={1}>
                              {item.description}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}

                {/* Map View */}
                <View style={{ flex: 1 }}>
                  {isMapsAvailable() ? (
                    (() => {
                      try {
                        const RNMaps: any = require("react-native-maps");
                        const MapView = RNMaps.default || RNMaps;
                        const { Marker, PROVIDER_GOOGLE } = RNMaps;
                        return (
                          <MapView
                            provider={PROVIDER_GOOGLE}
                            style={{ flex: 1 }}
                            initialRegion={{
                              latitude:
                                markerCoord?.lat ??
                                Number(officeLocation.lat) ??
                                -6.2,
                              longitude:
                                markerCoord?.lng ??
                                Number(officeLocation.lng) ??
                                106.8,
                              latitudeDelta: 0.01,
                              longitudeDelta: 0.01,
                            }}
                            onPress={onMapPress}
                            onPoiClick={(e: any) => {
                              const { coordinate, name } = e.nativeEvent;
                              setMarkerCoord({ lat: coordinate.latitude, lng: coordinate.longitude });
                              setOfficeLocation({
                                lat: String(coordinate.latitude),
                                lng: String(coordinate.longitude),
                                radius: officeLocation.radius,
                              });
                              setSearchQuery(name || "");
                            }}
                          >
                            {markerCoord && (
                              <Marker
                                coordinate={{
                                  latitude: markerCoord.lat,
                                  longitude: markerCoord.lng,
                                }}
                              />
                            )}
                          </MapView>
                        );
                      } catch (e) {
                        return (
                          <View style={styles.mapModalFallbackContainer}>
                            <Ionicons name="map-outline" size={48} color={NeutralColors.slate400} />
                            <Text style={styles.mapModalFallbackText}>
                              Peta tidak tersedia di lingkungan ini.
                            </Text>
                            <Text style={styles.mapModalFallbackSubText}>
                              Buatlah development build atau instal aplikasi dengan dukungan native maps.
                            </Text>
                          </View>
                        );
                      }
                    })()
                  ) : (
                    <View style={styles.mapModalFallbackContainer}>
                      <Ionicons name="map-outline" size={48} color={NeutralColors.slate400} />
                      <Text style={styles.mapModalFallbackText}>
                        Peta tidak tersedia di Expo Go
                      </Text>
                      <Text style={styles.mapModalFallbackSubText}>
                        Buat development build (EAS) atau jalankan pada perangkat dengan modul native react-native-maps ter-install.
                      </Text>
                    </View>
                  )}
                </View>

                {/* Bottom Action Buttons with SafeArea padding */}
                <View style={[
                  styles.mapModalFooter,
                  { paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 24 }
                ]}>
                  <TouchableOpacity
                    style={styles.mapModalApplyBtn}
                    onPress={() => {
                      if (markerCoord) {
                        setOfficeLocation({
                          lat: String(markerCoord.lat),
                          lng: String(markerCoord.lng),
                          radius: officeLocation.radius,
                        });
                      }
                      setMapVisible(false);
                      Alert.alert(
                        "Lokasi Diterapkan",
                        `Lat: ${officeLocation.lat}, Lng: ${officeLocation.lng}`,
                      );
                    }}
                  >
                    <LinearGradient
                      colors={[BrandColors.navy, BrandColors.navyDark]}
                      style={styles.mapModalApplyBtnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="white" />
                      <Text style={styles.mapModalApplyBtnText}>Terapkan Lokasi</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mapModalCancelBtn}
                    onPress={() => setMapVisible(false)}
                  >
                    <Text style={styles.mapModalCancelBtnText}>Batal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          <View style={{ height: 120 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Sub-component untuk Stats agar kode bersih
const StatBox = ({ label, value, color, bg }: any) => (
  <View style={[styles.statBox, { backgroundColor: bg }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NeutralColors.slate50 },
  headerContainer: {
    zIndex: 10,
    backgroundColor: BrandColors.navy,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  profileInfo: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: "white" },
  profileText: { marginLeft: 12 },
  greeting: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  userName: { fontSize: 16, fontWeight: "700", color: "white" },
  userPosition: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  notificationBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    backgroundColor: SemanticColors.error,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: BrandColors.navy,
  },
  clockCard: { alignItems: "center" },
  clockTime: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    letterSpacing: 1,
  },
  clockDate: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },

  //   statusSection: { marginTop: -15, marginBottom: 25, zIndex: 20 },
  //   statusCard: {
  //     backgroundColor: "white",
  //     borderRadius: 24,
  //     padding: 20,
  //     elevation: 4,
  //     shadowColor: "#000",
  //     shadowOffset: { width: 0, height: 4 },
  //     shadowOpacity: 0.1,
  //     shadowRadius: 10,
  //   },
  //   notYetCheckedIn: { alignItems: "center" },
  //   statusIconContainer: {
  //     width: 60,
  //     height: 60,
  //     borderRadius: 20,
  //     backgroundColor: SemanticColors.warningBg,
  //     justifyContent: "center",
  //     alignItems: "center",
  //     marginBottom: 12,
  //   },
  //   statusTextContainer: { alignItems: "center", marginBottom: 20 },
  //   statusLabel: {
  //     fontSize: 16,
  //     fontWeight: "700",
  //     color: NeutralColors.slate800,
  //   },
  //   statusHint: { fontSize: 12, color: NeutralColors.slate500, marginTop: 4 },
  //   mainCheckInBtn: { width: "100%", overflow: "hidden", borderRadius: 16 },
  //   checkInGradient: {
  //     flexDirection: "row",
  //     height: 54,
  //     alignItems: "center",
  //     justifyContent: "center",
  //     gap: 10,
  //   },
  //   checkInText: { color: "white", fontWeight: "700", fontSize: 16 },

  section: { marginBottom: 25 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NeutralColors.slate800,
    marginBottom: 12,
  },
  seeAll: { fontSize: 12, color: BrandColors.navy, fontWeight: "600" },

  quickActionsGrid: { flexDirection: "row", justifyContent: "space-between" },
  quickActionItem: { width: (width - 60) / 4, alignItems: "center" },
  quickActionIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: NeutralColors.slate700,
  },

  statsRow: { flexDirection: "row", gap: 12 },
  statBox: { flex: 1, padding: 15, borderRadius: 20, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },

  historyContainer: { backgroundColor: "white", borderRadius: 20, padding: 15 },
  //   historyItem: {
  //     flexDirection: "row",
  //     justifyContent: "space-between",
  //     alignItems: "center",
  //   },
  //   historyDate: {
  //     fontSize: 14,
  //     fontWeight: "600",
  //     color: NeutralColors.slate800,
  //   },
  historyTime: { fontSize: 12, color: NeutralColors.slate500, marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  historyCard: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 8, // Memberi ruang napas di dalam card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.slate100,
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "600",
    color: NeutralColors.slate800,
    marginBottom: 6,
  },
  historyTimes: {
    flexDirection: "row",
    gap: 16,
  },
  historyTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  historyTimeText: {
    fontSize: 13,
    color: NeutralColors.slate500,
    fontWeight: "500",
  },
  historyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
    minWidth: 85, // Menjaga ukuran badge tetap konsisten
    justifyContent: "center",
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 13,
    color: BrandColors.navy,
    fontWeight: "600",
  },
  dummySection: {
    margin: 20,
    padding: 15,
    backgroundColor: "#FFFBEB",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  dummyTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 10,
  },
  dummyRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  notYetCheckedIn: {
    flexDirection: "column",
    alignItems: "center",
  },
  checkedIn: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FFF9EB",
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  statusNotTextContainer: {
    flex: 1,
    alignItems: "center",
    marginBottom: 18,
  },
  statusInTextContainer: {
    flex: 1,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: NeutralColors.slate900,
  },
  statusNotHint: {
    fontSize: 13,
    textAlign: "center",
    color: NeutralColors.slate500,
    marginTop: 2,
  },
  statusInHint: {
    fontSize: 13,
    color: NeutralColors.slate500,
    marginTop: 2,
  },
  checkInGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  checkInText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  statusBadgeSuccess: {
    backgroundColor: SemanticColors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: SemanticColors.success,
    fontSize: 10,
    fontWeight: "800",
  },
  locationInfoMini: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 10,
    gap: 6,
  },
  locationTextMini: {
    fontSize: 12,
    color: NeutralColors.slate400,
    flex: 1,
  },
  dummyLabel: {
    fontSize: 10,
    color: "#B45309",
    marginBottom: 4,
    fontWeight: "600",
  },
  dummyInput: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
    fontSize: 12,
    color: "#92400E",
  },
  applyDummyBtn: {
    backgroundColor: "#92400E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginTop: 5,
  },
  applyDummyText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
  },
  // Map Modal Styles - Matching app design system
  mapModalContainer: {
    flex: 1,
    backgroundColor: NeutralColors.slate50,
  },
  mapModalHeader: {
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  mapModalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mapModalSearchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NeutralColors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: `${NeutralColors.slate200}50`,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mapModalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: NeutralColors.slate900,
    height: "100%",
  },
  mapModalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mapModalCloseBtnText: {
    color: NeutralColors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  mapModalLoadingPredictions: {
    padding: 12,
    alignItems: "center",
    backgroundColor: NeutralColors.white,
  },
  mapModalPredictionsContainer: {
    maxHeight: 220,
    backgroundColor: NeutralColors.white,
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.slate200,
  },
  mapModalPredictionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.slate100,
  },
  mapModalPredictionMainText: {
    fontSize: 14,
    fontWeight: "600",
    color: NeutralColors.slate800,
    marginBottom: 2,
  },
  mapModalPredictionSecondaryText: {
    fontSize: 12,
    color: NeutralColors.slate500,
  },
  mapModalFallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: NeutralColors.white,
  },
  mapModalFallbackText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: NeutralColors.slate700,
    marginTop: 16,
  },
  mapModalFallbackSubText: {
    textAlign: "center",
    fontSize: 13,
    color: NeutralColors.slate500,
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  mapModalFooter: {
    backgroundColor: NeutralColors.white,
    paddingTop: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: NeutralColors.slate200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  mapModalApplyBtn: {
    flex: 1,
  },
  mapModalApplyBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    gap: 8,
    shadowColor: BrandColors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  mapModalApplyBtnText: {
    color: NeutralColors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  mapModalCancelBtn: {
    flex: 1,
    backgroundColor: NeutralColors.slate100,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: NeutralColors.slate200,
  },
  mapModalCancelBtnText: {
    color: NeutralColors.slate600,
    fontSize: 15,
    fontWeight: "600",
  },
});
