import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function MenuScreen({ navigation }) {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Desea cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋Plan de saneamiento</Text>

      {/*Con residuos cloro */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("GestionResiduosCloro")}
      >
        <Text style={styles.cardTitle}>
          🧪 Control de Cloro Residual y pH del Agua Potable
        </Text>
        <Text style={styles.cardDesc}>Listado y detalles</Text>
      </TouchableOpacity>

      {/*limpieza y desinfeccion */}
      <TouchableOpacity
        style={styles.card} 
        onPress={() => navigation.navigate("LimpiezaDesinfeccionForm")}
      >
        <Text style={styles.cardTitle}>
          {" "}
          🧽 REGISTRO DE ASEO SERVICIO DE ALIMENTACIÓN
        </Text>
        <Text style={styles.cardDesc}>Listado y detalles</Text>
      </TouchableOpacity>

      {/*REGISTRO INGRESO DE MATERIAS PRIMAS */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("MateriaPrimasForm")}
      >
        <Text style={styles.cardTitle}>
          {" "}
          🍅 REGISTRO INGRESO DE MATERIAS PRIMAS
        </Text>
        <Text style={styles.cardDesc}>Listado y detalles</Text>
      </TouchableOpacity>

      {/*Registro Control Químico de Plagas */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("")}
      >
        <Text style={styles.cardTitle}>
          {" "}
          🐜 Registro Control Químico de Plagas
        </Text>
        <Text style={styles.cardDesc}>Listado y detalles</Text>
      </TouchableOpacity>

      {/*REGISTRO CONTROL MUESTRAS DE ALIMENTOS */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("MuestrasAlimentosForm")}
      >
        <Text style={styles.cardTitle}>
          {" "}
          🔬REGISTRO CONTROL MUESTRAS DE ALIMENTOS
        </Text>
        <Text style={styles.cardDesc}>Listado y detalles</Text>
      </TouchableOpacity>

      {/*REGISTRO TOMA DE TEMPERATURA DE EQUIPOS DE FR */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("TemperaturaEquiposForm")}
      >
        <Text style={styles.cardTitle}>
          ❄️ REGISTRO TOMA DE TEMPERATURA DE EQUIPOS DE FR
        </Text>
        <Text style={styles.cardDesc}>Listado y detalles</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.logout]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>🚪 Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f6fa",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#2c3e50",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#34495e",
  },
  cardDesc: {
    fontSize: 13,
    color: "#7f8c8d",
    marginTop: 4,
  },
  logout: {
    backgroundColor: "#e74c3c",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
