import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors, NeutralColors, SemanticColors } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email atau nama wajib diisi';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password wajib diisi';
    } else if (password.length < 4) {
      newErrors.password = 'Password minimal 4 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulasi login dengan delay
    setTimeout(() => {
      console.log('Login attempt:', { email, password });
      setIsLoading(false);
      // Navigate ke home/tabs setelah login berhasil
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9', '#E0F7FA']}
        style={styles.backgroundGradient}
      />
      
      {/* Decorative Circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <LinearGradient
                colors={[BrandColors.navy, BrandColors.cyan]}
                style={styles.logoContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="finger-print" size={40} color="white" />
              </LinearGradient>
              <Text style={styles.appName}>Hadir-In</Text>
              <Text style={styles.appTagline}>Aplikasi Absensi Staff</Text>
            </View>

            {/* Login Card */}
            <View style={styles.loginCard}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <Text style={styles.welcomeText}>Selamat Datang</Text>
                <Text style={styles.subText}>
                  Masuk ke akun <Text style={styles.brandText}>Hadir-In</Text> Anda
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Email/Nama Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nama atau Email</Text>
                  <View style={[
                    styles.inputWrapper,
                    errors.email && styles.inputError,
                  ]}>
                    <Ionicons 
                      name="mail-outline" 
                      size={20} 
                      color={errors.email ? SemanticColors.error : NeutralColors.slate400} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Masukkan nama atau email Anda"
                      placeholderTextColor={NeutralColors.slate400}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[
                    styles.inputWrapper,
                    errors.password && styles.inputError,
                  ]}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color={errors.password ? SemanticColors.error : NeutralColors.slate400} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Masukkan password Anda"
                      placeholderTextColor={NeutralColors.slate400}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color={NeutralColors.slate400} 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[BrandColors.navy, BrandColors.navyDark]}
                    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="log-in-outline" size={20} color="white" />
                        <Text style={styles.loginButtonText}>Masuk</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Helper Text */}
                <Text style={styles.helperText}>
                  Belum punya akun? Hubungi admin untuk pendaftaran
                </Text>
              </View>

              {/* Demo Info Box */}
              <View style={styles.demoBox}>
                <View style={styles.demoHeader}>
                  <Ionicons name="bulb-outline" size={16} color={BrandColors.cyan} />
                  <Text style={styles.demoTitle}>Demo Login</Text>
                </View>
                <Text style={styles.demoText}>
                  Gunakan email dan password apapun untuk demo. Data akan direset saat aplikasi dimuat ulang.
                </Text>
              </View>
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              © 2026 Hadir-In. Sistem Absensi Karyawan Modern.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NeutralColors.white,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: `${BrandColors.cyan}15`,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${BrandColors.navy}10`,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BrandColors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: NeutralColors.slate900,
    marginTop: 16,
  },
  appTagline: {
    fontSize: 14,
    color: NeutralColors.slate500,
    marginTop: 4,
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: `${NeutralColors.slate200}50`,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: NeutralColors.slate900,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: NeutralColors.slate600,
  },
  brandText: {
    color: BrandColors.navy,
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: NeutralColors.slate700,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeutralColors.white,
    borderWidth: 1,
    borderColor: NeutralColors.slate300,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputError: {
    borderColor: SemanticColors.error,
    backgroundColor: SemanticColors.errorBg,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: NeutralColors.slate900,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: SemanticColors.error,
    marginTop: 4,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    gap: 8,
    shadowColor: BrandColors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: NeutralColors.white,
  },
  helperText: {
    fontSize: 13,
    color: NeutralColors.slate500,
    textAlign: 'center',
    marginTop: 8,
  },
  demoBox: {
    backgroundColor: `${BrandColors.cyan}10`,
    borderWidth: 1,
    borderColor: `${BrandColors.cyan}30`,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.navy,
  },
  demoText: {
    fontSize: 12,
    color: NeutralColors.slate600,
    lineHeight: 18,
  },
  footerText: {
    fontSize: 12,
    color: NeutralColors.slate500,
    textAlign: 'center',
    marginTop: 24,
  },
});
