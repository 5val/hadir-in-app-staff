import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  RefreshControl,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BrandColors, NeutralColors, SemanticColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

// Mock data for staff dashboard
const mockStaffData = {
  name: 'Ahmad Fauzi',
  position: 'Software Engineer',
  department: 'IT & Development',
  avatar: 'AF',
  todayStatus: 'belum-absen', // 'hadir' | 'belum-absen' | 'izin' | 'cuti'
  checkInTime: null,
  checkOutTime: null,
};

const mockAttendanceHistory = [
  { date: 'Senin, 19 Jan 2026', checkIn: '08:05', checkOut: '17:30', status: 'Hadir' },
  { date: 'Jumat, 16 Jan 2026', checkIn: '08:15', checkOut: '17:00', status: 'Hadir' },
  { date: 'Kamis, 15 Jan 2026', checkIn: '09:30', checkOut: '18:00', status: 'Terlambat' },
  { date: 'Rabu, 14 Jan 2026', checkIn: '-', checkOut: '-', status: 'Izin' },
  { date: 'Selasa, 13 Jan 2026', checkIn: '07:55', checkOut: '17:15', status: 'Hadir' },
];

const mockStats = {
  totalHadir: 18,
  totalTerlambat: 2,
  totalIzin: 1,
  totalCuti: 0,
};

const quickActions = [
  { id: 'absen', icon: 'camera-outline', label: 'Absen', color: BrandColors.navy, route: '/(tabs)' },
  { id: 'izin', icon: 'document-text-outline', label: 'Ajukan Izin', color: SemanticColors.warning, route: null },
  { id: 'cuti', icon: 'calendar-outline', label: 'Ajukan Cuti', color: SemanticColors.info, route: null },
  { id: 'riwayat', icon: 'time-outline', label: 'Riwayat', color: BrandColors.lime, route: null },
];

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [staffData] = useState(mockStaffData);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Hadir':
        return { bg: SemanticColors.successBg, color: SemanticColors.success, icon: 'checkmark-circle' };
      case 'Terlambat':
        return { bg: SemanticColors.warningBg, color: SemanticColors.warning, icon: 'time' };
      case 'Izin':
        return { bg: SemanticColors.infoBg, color: SemanticColors.info, icon: 'document-text' };
      case 'Cuti':
        return { bg: `${BrandColors.lime}20`, color: BrandColors.lime, icon: 'calendar' };
      default:
        return { bg: NeutralColors.slate100, color: NeutralColors.slate500, icon: 'help-circle' };
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (action.route) {
      router.push(action.route as any);
    } else {
      // For now, show alert that feature is coming soon
      console.log(`${action.label} clicked`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={[BrandColors.navy, BrandColors.navyDark]}
        style={styles.header}
      >
        {/* Profile Row */}
        <View style={styles.profileRow}>
          <View style={styles.profileInfo}>
            <LinearGradient
              colors={[BrandColors.cyan, BrandColors.lime]}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>{staffData.avatar}</Text>
            </LinearGradient>
            <View style={styles.profileText}>
              <Text style={styles.greeting}>Selamat Datang,</Text>
              <Text style={styles.userName}>{staffData.name}</Text>
              <Text style={styles.userPosition}>{staffData.position}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Clock Card */}
        <View style={styles.clockCard}>
          <Text style={styles.clockTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.clockDate}>{formatDate(currentTime)}</Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BrandColors.navy]}
            tintColor={BrandColors.navy}
          />
        }
      >
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Status Absen Hari Ini */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Hari Ini</Text>
            <View style={styles.statusCard}>
              {staffData.todayStatus === 'belum-absen' ? (
                <View style={styles.notYetCheckedIn}>
                  <View style={styles.statusIconContainer}>
                    <Ionicons name="time-outline" size={32} color={SemanticColors.warning} />
                  </View>
                  <View style={styles.statusTextContainer}>
                    <Text style={styles.statusLabel}>Belum Absen Masuk</Text>
                    <Text style={styles.statusHint}>Silakan lakukan absen untuk mencatat kehadiran</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.checkInButton}
                    onPress={() => router.push('/(tabs)')}
                  >
                    <LinearGradient
                      colors={[BrandColors.navy, BrandColors.cyan]}
                      style={styles.checkInButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="camera" size={18} color="white" />
                      <Text style={styles.checkInButtonText}>Absen Sekarang</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.checkedInStatus}>
                  <View style={styles.timeBox}>
                    <Text style={styles.timeLabel}>Masuk</Text>
                    <Text style={styles.timeValue}>{staffData.checkInTime || '-'}</Text>
                  </View>
                  <View style={styles.statusDivider} />
                  <View style={styles.timeBox}>
                    <Text style={styles.timeLabel}>Keluar</Text>
                    <Text style={styles.timeValue}>{staffData.checkOutTime || '-'}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Menu Cepat</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionItem}
                  onPress={() => handleQuickAction(action)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Monthly Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistik Bulan Ini</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: SemanticColors.successBg }]}>
                <Text style={[styles.statValue, { color: SemanticColors.success }]}>{mockStats.totalHadir}</Text>
                <Text style={styles.statLabel}>Hadir</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: SemanticColors.warningBg }]}>
                <Text style={[styles.statValue, { color: SemanticColors.warning }]}>{mockStats.totalTerlambat}</Text>
                <Text style={styles.statLabel}>Terlambat</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: SemanticColors.infoBg }]}>
                <Text style={[styles.statValue, { color: SemanticColors.info }]}>{mockStats.totalIzin}</Text>
                <Text style={styles.statLabel}>Izin</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: `${BrandColors.lime}20` }]}>
                <Text style={[styles.statValue, { color: BrandColors.limeDark }]}>{mockStats.totalCuti}</Text>
                <Text style={styles.statLabel}>Cuti</Text>
              </View>
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
                const badge = getStatusBadge(item.status);
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.historyItem,
                      index !== mockAttendanceHistory.length - 1 && styles.historyItemBorder,
                    ]}
                  >
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyDate}>{item.date}</Text>
                      <View style={styles.historyTimes}>
                        <View style={styles.historyTimeItem}>
                          <Ionicons name="log-in-outline" size={14} color={NeutralColors.slate400} />
                          <Text style={styles.historyTimeText}>{item.checkIn}</Text>
                        </View>
                        <View style={styles.historyTimeItem}>
                          <Ionicons name="log-out-outline" size={14} color={NeutralColors.slate400} />
                          <Text style={styles.historyTimeText}>{item.checkOut}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.historyBadge, { backgroundColor: badge.bg }]}>
                      <Ionicons name={badge.icon as any} size={12} color={badge.color} />
                      <Text style={[styles.historyBadgeText, { color: badge.color }]}>{item.status}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Bottom Padding */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NeutralColors.slate50,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileText: {
    marginLeft: 14,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
  },
  userPosition: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SemanticColors.error,
  },
  clockCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  clockTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
  },
  clockDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
  },
  scrollView: {
    flex: 1,
    marginTop: -50,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  mainContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NeutralColors.slate800,
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 13,
    color: BrandColors.navy,
    fontWeight: '600',
    marginBottom: 14,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  notYetCheckedIn: {
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: SemanticColors.warningBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusTextContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: NeutralColors.slate800,
  },
  statusHint: {
    fontSize: 13,
    color: NeutralColors.slate500,
    marginTop: 4,
    textAlign: 'center',
  },
  checkInButton: {
    width: '100%',
  },
  checkInButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  checkInButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  checkedInStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBox: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 13,
    color: NeutralColors.slate500,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: NeutralColors.slate800,
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: NeutralColors.slate200,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionItem: {
    width: (width - 64) / 4,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: NeutralColors.slate700,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: NeutralColors.slate600,
    marginTop: 4,
    fontWeight: '500',
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
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
    fontWeight: '600',
    color: NeutralColors.slate800,
    marginBottom: 6,
  },
  historyTimes: {
    flexDirection: 'row',
    gap: 16,
  },
  historyTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyTimeText: {
    fontSize: 13,
    color: NeutralColors.slate500,
  },
  historyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
