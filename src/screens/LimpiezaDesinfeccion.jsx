// LimpiezaDesinfeccionForm.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "../styles/globalStyles.styles";

import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const obtenerFechaActual = () => {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const anio = hoy.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

const obtenerMesActual = () =>
  new Date().toLocaleString("es-CO", { month: "long" });
const obtenerAnioActual = () => new Date().getFullYear();

const AREAS_LIMPIEZA = [
  { key: "pisos", label: "Pisos" },
  { key: "paredes", label: "Paredes" },
  { key: "techo", label: "Techo" },
  { key: "mesones", label: "Mesones" },
  { key: "puerta", label: "Puerta" },
  { key: "neveras", label: "Neveras" },
  { key: "microondas", label: "Microondas" },
  { key: "estufa", label: "Estufa" },
  { key: "campaExtractora", label: "Campana Extractora" },
  { key: "recipientesResiduos", label: "Recipientes Residuos" },
  { key: "trampaGrasas", label: "Trampa de Grasas" },
  { key: "aseoProfundo", label: "Aseo Profundo" },
];

const INITIAL_FORM_STATE = {
  fecha: obtenerFechaActual(),
  pisos: false,
  paredes: false,
  techo: false,
  mesones: false,
  puerta: false,
  neveras: false,
  microondas: false,
  estufa: false,
  campaExtractora: false,
  recipientesResiduos: false,
  trampaGrasas: false,
  aseoProfundo: false,
  firmaAuxiliar: "",
  firmaSupervisor: "",
  observaciones: "",
};


const LimpiezaDesinfeccionForm = () => {
  const [mes, setMes] = useState(obtenerMesActual());
  const [anio, setAnio] = useState(obtenerAnioActual());
  const [registros, setRegistros] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para DateTimePicker
  const [fechaDate, setFechaDate] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  // Validación del formulario
  const validarFormulario = () => {
    if (!form.fecha.trim()) {
      Alert.alert("Error", "La fecha es obligatoria");
      return false;
    }

    // Verificar que al menos un área esté seleccionada
    const algunaAreaSeleccionada = AREAS_LIMPIEZA.some(
      (area) => form[area.key],
    );

    if (!algunaAreaSeleccionada) {
      Alert.alert("Error", "Debe seleccionar al menos un área de limpieza");
      return false;
    }

    if (!form.firmaAuxiliar.trim()) {
      Alert.alert("Error", "La firma del auxiliar de cocina es obligatoria");
      return false;
    }

    if (!form.firmaSupervisor.trim()) {
      Alert.alert("Error", "La firma del supervisor es obligatoria");
      return false;
    }

    return true;
  };

  const limpiarFormulario = () => {
    setForm({ ...INITIAL_FORM_STATE, fecha: obtenerFechaActual() });
    setFechaDate(new Date());
    setMostrarCalendario(false);
  };

  const guardarRegistro = async () => {
    try {
      setIsLoading(true);

      const areasLimpiadas = AREAS_LIMPIEZA
        .filter((area) => form[area.key])
        .map((a) => a.label);

      const registro = {
        fecha: form.fecha,
        mes,
        anio,
        areasLimpiadas,
        totalAreas: areasLimpiadas.length,
        firmaAuxiliar: form.firmaAuxiliar,
        firmaSupervisor: form.firmaSupervisor,
        observaciones: form.observaciones || "",
        createdAt: serverTimestamp(),
      };

      await addDoc(
        collection(db, "limpiezaDesinfeccion", String(anio), mes),
        registro
      );

      // Guardar localmente y limpiar formulario
      setRegistros((prev) => [registro, ...prev]);
      Alert.alert("✓ Éxito", "Registro guardado en Firebase");
      limpiarFormulario();
    } catch (error) {
      console.error("Error Firebase:", error);
      Alert.alert("Error", "No se pudo guardar el registro");
    } finally {
      setIsLoading(false);
    }
  };



  const guardar = () => {
    if (!validarFormulario()) return;
    guardarRegistro();
  };

  const toggleArea = (campo) => {
    setForm({ ...form, [campo]: !form[campo] });
  };

  const handleInputChange = (campo, value) => {
    setForm({ ...form, [campo]: value });
  };

  // Manejador de cambio de fecha
  const onChangeFecha = (event, selectedDate) => {
    setMostrarCalendario(false);
    if (selectedDate) {
      setFechaDate(selectedDate);
      const dia = String(selectedDate.getDate()).padStart(2, "0");
      const mes = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const anio = selectedDate.getFullYear();
      setForm({ ...form, fecha: `${dia}/${mes}/${anio}` });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView>
          {/* Header oficial */}
          <View style={styles.officialHeader}>
            <Text style={styles.companyName}>🏢 ÚRSULA CAFÉ</Text>
            <Text style={styles.documentTitle}>
              REGISTRO DE ASEO SERVICIO DE ALIMENTACIÓN
            </Text>
            <Text style={styles.version}>Versión: 01 | Fecha: Julio 2025</Text>
          </View>

          {/* Información */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Instrucciones</Text>
            <Text style={styles.infoText}>
              • Registre diariamente las áreas limpiadas
            </Text>
            <Text style={styles.infoText}>
              • Marque todas las áreas que fueron aseadas
            </Text>
            <Text style={styles.infoText}>
              • Incluya las firmas del auxiliar y supervisor
            </Text>
          </View>

          {/* Mes y año */}
          <View style={styles.periodContainer}>
            <Text style={styles.periodLabel}>Mes:</Text>
            <Text style={styles.periodValue}>
              {mes} {anio}
            </Text>
            <Text style={styles.recordCount}>
              {registros.length} registro{registros.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Formulario de entrada */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Nuevo Registro</Text>

            {/* Fecha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha</Text>
              <TouchableOpacity
                onPress={() => setMostrarCalendario(true)}
                style={[styles.input, { justifyContent: "center" }]}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                  📅 {form.fecha}
                </Text>
              </TouchableOpacity>
            </View>

            {/* DateTimePicker para fecha */}
            {mostrarCalendario && (
              <DateTimePicker
                value={fechaDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                onChange={onChangeFecha}
                locale="es-CO"
              />
            )}

            {/* Áreas de limpieza */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Áreas Limpiadas</Text>
              <Text style={styles.infoText}>
                Seleccione todas las áreas que se limpiaron:
              </Text>

              {AREAS_LIMPIEZA.map((area) => (
                <TouchableOpacity
                  key={area.key}
                  onPress={() => toggleArea(area.key)}
                  style={styles.checkboxContainer}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      form[area.key] && styles.checkboxChecked,
                    ]}
                  />
                  <Text style={styles.checkboxLabel}>{area.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Firma Auxiliar */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Firma Auxiliar de Cocina</Text>
              <TextInput
                placeholder="Nombre completo del auxiliar"
                value={form.firmaAuxiliar}
                onChangeText={(value) =>
                  handleInputChange("firmaAuxiliar", value)
                }
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>

            {/* Firma Supervisor */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Firma del Supervisor</Text>
              <TextInput
                placeholder="Nombre completo del supervisor"
                value={form.firmaSupervisor}
                onChangeText={(value) =>
                  handleInputChange("firmaSupervisor", value)
                }
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>

            {/* Observaciones */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Observaciones (opcional)</Text>
              <TextInput
                placeholder="Comentarios adicionales"
                value={form.observaciones}
                onChangeText={(value) =>
                  handleInputChange("observaciones", value)
                }
                style={[styles.input, styles.textArea]}
                placeholderTextColor="#95a5a6"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.rowGroup}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonPrimary,
                  isLoading && styles.buttonDisabled,
                  { flex: 1, marginRight: 8 },
                ]}
                onPress={guardar}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text
                  style={
                    isLoading ? [styles.buttonText, styles.buttonTextDisabled] : styles.buttonText
                  }
                >
                  {isLoading ? "Guardando..." : "✓ Guardar Registro"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { flex: 1 }]}
                onPress={limpiarFormulario}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Limpiar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabla de registros */}
          {registros.length > 0 && (
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>Registros del Mes</Text>

              {registros.map((reg, idx) => (
                <View key={idx} style={styles.registroCard}>
                  <View style={styles.registroHeader}>
                    <Text style={styles.registroFecha}>📅 {reg.fecha}</Text>
                    <Text style={styles.registroAreas}>
                      {reg.totalAreas} área{reg.totalAreas !== 1 ? "s" : ""}
                    </Text>
                  </View>

                  <View style={styles.registroBody}>
                    <Text style={styles.registroLabel}>Áreas limpiadas:</Text>
                    <Text style={styles.registroText}>
                      {reg.areasLimpiadas.join(", ")}
                    </Text>

                    <Text style={styles.registroLabel}>Auxiliar:</Text>
                    <Text style={styles.registroText}>{reg.firmaAuxiliar}</Text>

                    <Text style={styles.registroLabel}>Supervisor:</Text>
                    <Text style={styles.registroText}>
                      {reg.firmaSupervisor}
                    </Text>

                    {reg.observaciones && (
                      <>
                        <Text style={styles.registroLabel}>Observaciones:</Text>
                        <Text style={styles.registroText}>
                          {reg.observaciones}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LimpiezaDesinfeccionForm;
