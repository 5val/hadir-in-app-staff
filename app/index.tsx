import { Redirect } from "expo-router";

export default function RootIndex() {
    // Redirect ke halaman login saat aplikasi pertama kali dibuka
    return <Redirect href="/login" />;
}
