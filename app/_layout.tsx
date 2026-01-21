import {
   DarkTheme,
   DefaultTheme,
   ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { BrandColors, NeutralColors } from "@/constants/theme";
import { OfficeProvider } from "@/context/OfficeContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Custom theme yang sesuai dengan branding Hadir-In
const HadirInLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: BrandColors.navy,
    background: NeutralColors.white,
    card: NeutralColors.white,
    text: NeutralColors.slate900,
    border: NeutralColors.slate200,
    notification: BrandColors.cyan,
  },
};

const HadirInDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: BrandColors.cyan,
    background: NeutralColors.slate900,
    card: NeutralColors.slate800,
    text: NeutralColors.slate50,
    border: NeutralColors.slate700,
    notification: BrandColors.cyan,
  },
};

export const unstable_settings = {
  initialRouteName: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <OfficeProvider>
      <ThemeProvider
        value={colorScheme === "dark" ? HadirInDarkTheme : HadirInLightTheme}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="home"
            options={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
              headerShown: true,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </OfficeProvider>
  );
}
