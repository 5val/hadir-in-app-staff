import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BrandColors, NeutralColors, SemanticColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mock user data
const mockUserData = {
  name: 'Ahmad Fauzi',
  email: 'ahmad.fauzi@company.com',
  phone: '+62 812 3456 7890',
  position: 'Software Engineer',
  department: 'IT & Development',
  employeeId: 'EMP-2024-0156',
  joinDate: '15 Januari 2024',
  avatar: 'AF',
};

const menuItems = [
  {
    id: 'personal',
    title: 'Informasi Pribadi',
    icon: 'person-outline',
    color: BrandColors.navy,
  },
  {
    id: 'attendance',
    title: 'Riwayat Kehadiran',
    icon: 'calendar-outline',
    color: SemanticColors.info,
  },
  {
    id: 'leave',
    title: 'Pengajuan Cuti/Izin',
    icon: 'document-text-outline',
    color: SemanticColors.warning,
  },
  {
    id: 'payslip',
    title: 'Slip Gaji',
    icon: 'wallet-outline',
    color: SemanticColors.success,
  },
  {
    id: 'settings',
    title: 'Pengaturan',
    icon: 'settings-outline',
    color: NeutralColors.slate600,
  },
  {
    id: 'help',
    title: 'Bantuan',
    icon: 'help-circle-outline',
    color: BrandColors.cyan,
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleMenuPress = (menuId: string) => {
    Alert.alert(
      'Segera Hadir',
      'Fitur ini sedang dalam pengembangan dan akan segera tersedia.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <LinearGradient
        colors={[BrandColors.navy, BrandColors.navyDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Profil</Text>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[BrandColors.cyan, BrandColors.lime]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>{mockUserData.avatar}</Text>
          </LinearGradient>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{mockUserData.name}</Text>
            <Text style={styles.profilePosition}>{mockUserData.position}</Text>
            <View style={styles.profileBadge}>
              <Ionicons name="business-outline" size={12} color={BrandColors.cyan} />
              <Text style={styles.profileDepartment}>{mockUserData.department}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color={BrandColors.navy} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Employee Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>ID Karyawan</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{mockUserData.employeeId}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Bergabung Sejak</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{mockUserData.joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index !== menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => handleMenuPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={20} color={SemanticColors.error} />
          </View>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Hadir-In Staff v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2026 Hadir-In. All rights reserved.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  profilePosition: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  profileDepartment: {
    fontSize: 11,
    color: 'white',
    fontWeight: '500',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoDivider: {
    width: 1,
    height: 40,
    backgroundColor: NeutralColors.slate200,
    marginHorizontal: 16,
  },
  menuCard: {
    borderRadius: 20,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.slate100,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.errorBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: SemanticColors.error,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 13,
    color: NeutralColors.slate500,
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: 11,
    color: NeutralColors.slate400,
    marginTop: 4,
  },
});
