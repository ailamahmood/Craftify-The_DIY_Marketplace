import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Tabs, Redirect } from "expo-router";
import { Link } from "expo-router";

export default function App(){
    return(
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-3xl font-pblack">index js</Text>

            <StatusBar style="auto"/>

            <Link href="/Profile">Gfo to i</Link>
            <Link href="/Home">Gfo to home</Link>
        </View>
    );
}
