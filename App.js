import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider, AuthContext } from "./src/context/AuthContext";

import LoginScreen from "./src/screens/LoginScreen";
import MenuScreen from "./src/screens/MenuScreen";
import GestionResiduosCloro from "./src/screens/GestionResiduosCloro";
import LimpiezaDesinfeccionForm from "./src/screens/LimpiezaDesinfeccion";
import MateriaPrimasForm from "./src/screens/MateriaPrimasForm";
import MuestrasAlimentosForm from "./src/screens/MuestrasAlimentosForm";
import TemperaturaEquiposForm from "./src/screens/TemperaturaEquiposForm";
import ControlPlagasForm from "./src/screens/ControlPlagasForm";


const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="GestionResiduosCloro" component={GestionResiduosCloro} />
      <Stack.Screen name="MateriaPrimasForm" component={MateriaPrimasForm} />
      <Stack.Screen name="MuestrasAlimentosForm" component={MuestrasAlimentosForm} />
      <Stack.Screen name="TemperaturaEquiposForm" component={TemperaturaEquiposForm} />
      <Stack.Screen name="ControlPlagasForm" component={ControlPlagasForm} />

      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="LimpiezaDesinfeccionForm" component={LimpiezaDesinfeccionForm} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
