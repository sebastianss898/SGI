// MuestrasAlimentosForm.js
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
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";


const obtenerFechaActual = () => {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const anio = hoy.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

const obtenerHoraActual = () => {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
};

const obtenerMesActual = () =>
  new Date().toLocaleString("es-CO", { month: "long" });
const obtenerAnioActual = () => new Date().getFullYear();

const TIEMPOS_COMIDA = [
  "Desayuno",
  "Media Mañana",
  "Almuerzo",
  "Merienda",
  "Cena",
];

const TIPOS_ENVASE = [
  "Recipiente con tapa",
  "Bolsa zip",
];

const UBICACIONES = [
  "Nevera Contramuestras",
  "Nevera Principal",
  "Congelador 1",
  "Congelador 2",
];

const INITIAL_FORM_STATE = {
  fecha: obtenerFechaActual(),
  tiempoComida: "",
  nombrePlato: "",
  horaFinalizacion: "",
  horaTomaMuestra: obtenerHoraActual(),
  temperaturaServicio: "",
  tamanoMuestra: "",
  tipoEnvase: "",
  responsable: "",
  ubicacionAlmacenamiento: "",
  fechaEliminacion: "",
  horaEliminacion: "",
  supervisor: "",
  observaciones: "",
};

const MuestrasAlimentosForm = () => {
  const [mes, setMes] = useState(obtenerMesActual());
  const [anio, setAnio] = useState(obtenerAnioActual());
  const [registros, setRegistros] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para DateTimePicker
  const [fechaDate, setFechaDate] = useState(new Date());
  const [fechaEliminacionDate, setFechaEliminacionDate] = useState(new Date());
  const [horaFinalizacionDate, setHoraFinalizacionDate] = useState(new Date());
  const [horaTomaMuestraDate, setHoraTomaMuestraDate] = useState(new Date());
  const [horaEliminacionDate, setHoraEliminacionDate] = useState(new Date());

  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarCalendarioEliminacion, setMostrarCalendarioEliminacion] =
    useState(false);
  const [mostrarRelojFinalizacion, setMostrarRelojFinalizacion] =
    useState(false);
  const [mostrarRelojTomaMuestra, setMostrarRelojTomaMuestra] = useState(false);
  const [mostrarRelojEliminacion, setMostrarRelojEliminacion] = useState(false);

  // Estados para selectores
  const [mostrarTiempos, setMostrarTiempos] = useState(false);
  const [mostrarEnvases, setMostrarEnvases] = useState(false);
  const [mostrarUbicaciones, setMostrarUbicaciones] = useState(false);

  // Calcular fecha de eliminación (72 horas después)
  const calcularFechaEliminacion = () => {
    const fechaActual = fechaDate;
    const fechaElim = new Date(fechaActual.getTime() + 72 * 60 * 60 * 1000);
    const dia = String(fechaElim.getDate()).padStart(2, "0");
    const mes = String(fechaElim.getMonth() + 1).padStart(2, "0");
    const anio = fechaElim.getFullYear();
    const horas = String(fechaElim.getHours()).padStart(2, "0");
    const minutos = String(fechaElim.getMinutes()).padStart(2, "0");

    setForm({
      ...form,
      fechaEliminacion: `${dia}/${mes}/${anio}`,
      horaEliminacion: `${horas}:${minutos}`,
    });
    setFechaEliminacionDate(fechaElim);
    setHoraEliminacionDate(fechaElim);
  };

  // Validación del formulario
  const validarFormulario = () => {
    if (!form.fecha.trim()) {
      Alert.alert("Error", "La fecha es obligatoria");
      return false;
    }

    if (!form.tiempoComida) {
      Alert.alert("Error", "Debe seleccionar el tiempo de comida");
      return false;
    }

    if (!form.nombrePlato.trim()) {
      Alert.alert("Error", "El nombre del plato es obligatorio");
      return false;
    }

    if (!form.horaFinalizacion.trim()) {
      Alert.alert("Error", "La hora de finalización es obligatoria");
      return false;
    }

    if (!form.horaTomaMuestra.trim()) {
      Alert.alert("Error", "La hora de toma de muestra es obligatoria");
      return false;
    }

    if (!form.temperaturaServicio.trim() || isNaN(form.temperaturaServicio)) {
      Alert.alert("Error", "La temperatura debe ser un número válido");
      return false;
    }

    const temp = Number(form.temperaturaServicio);
    if (temp < 60 && form.tiempoComida !== "Desayuno") {
      Alert.alert(
        "⚠️ Advertencia",
        `La temperatura está por debajo de 60°C (${temp}°C).\n¿Desea continuar?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Guardar igual", onPress: () => guardarRegistro() },
        ],
      );
      return false;
    }

    if (!form.tamanoMuestra.trim()) {
      Alert.alert("Error", "El tamaño de la muestra es obligatorio");
      return false;
    }

    if (!form.tipoEnvase) {
      Alert.alert("Error", "Debe seleccionar el tipo de envase");
      return false;
    }

    if (!form.responsable.trim()) {
      Alert.alert("Error", "El responsable es obligatorio");
      return false;
    }

    if (!form.ubicacionAlmacenamiento) {
      Alert.alert("Error", "Debe seleccionar la ubicación de almacenamiento");
      return false;
    }

    if (!form.fechaEliminacion.trim() || !form.horaEliminacion.trim()) {
      Alert.alert("Error", "La fecha y hora de eliminación son obligatorias");
      return false;
    }

    if (!form.supervisor.trim()) {
      Alert.alert("Error", "El supervisor es obligatorio");
      return false;
    }

    return true;
  };

  const guardarRegistro = async () => {
  try {
    setIsLoading(true);

    const contadorRef = doc(db, "contadores", "muestras_alimentos");

    const serial = await runTransaction(db, async (transaction) => {
      const contadorDoc = await transaction.get(contadorRef);

      let ultimo = 0;
      if (contadorDoc.exists()) {
        ultimo = contadorDoc.data().ultimo;
      }

      const nuevoSerial = ultimo + 1;

      transaction.set(contadorRef, { ultimo: nuevoSerial }, { merge: true });

      return nuevoSerial;
    });

    const registro = {
      serial, // 👈 SERIAL CONSECUTIVO
      ...form,
      temperaturaServicio: Number(form.temperaturaServicio),
      temperaturaCumple: Number(form.temperaturaServicio) >= 60,
      mes,
      anio,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "muestras_alimentos"), registro);

    setRegistros([...registros, registro]);

    Alert.alert(
      "✓ Éxito",
      `Registro guardado\nSerial Nº ${serial}`
    );

    setForm(INITIAL_FORM_STATE);

    setFechaDate(new Date());
    setFechaEliminacionDate(new Date());
    setHoraFinalizacionDate(new Date());
    setHoraTomaMuestraDate(new Date());
    setHoraEliminacionDate(new Date());

  } catch (error) {
    console.error(error);
    Alert.alert("Error", "No se pudo guardar el registro");
  } finally {
    setIsLoading(false);
  }
};



  const guardar = () => {
    if (!validarFormulario()) return;
    guardarRegistro();
  };

  const handleInputChange = (campo, value) => {
    setForm({ ...form, [campo]: value });
  };

  // Manejadores de fecha y hora
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

  const onChangeFechaEliminacion = (event, selectedDate) => {
    setMostrarCalendarioEliminacion(false);
    if (selectedDate) {
      setFechaEliminacionDate(selectedDate);
      const dia = String(selectedDate.getDate()).padStart(2, "0");
      const mes = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const anio = selectedDate.getFullYear();
      setForm({ ...form, fechaEliminacion: `${dia}/${mes}/${anio}` });
    }
  };

  const onChangeHoraFinalizacion = (event, selectedTime) => {
    setMostrarRelojFinalizacion(false);
    if (selectedTime) {
      setHoraFinalizacionDate(selectedTime);
      const horas = String(selectedTime.getHours()).padStart(2, "0");
      const minutos = String(selectedTime.getMinutes()).padStart(2, "0");
      setForm({ ...form, horaFinalizacion: `${horas}:${minutos}` });
    }
  };

  const onChangeHoraTomaMuestra = (event, selectedTime) => {
    setMostrarRelojTomaMuestra(false);
    if (selectedTime) {
      setHoraTomaMuestraDate(selectedTime);
      const horas = String(selectedTime.getHours()).padStart(2, "0");
      const minutos = String(selectedTime.getMinutes()).padStart(2, "0");
      setForm({ ...form, horaTomaMuestra: `${horas}:${minutos}` });
    }
  };

  const onChangeHoraEliminacion = (event, selectedTime) => {
    setMostrarRelojEliminacion(false);
    if (selectedTime) {
      setHoraEliminacionDate(selectedTime);
      const horas = String(selectedTime.getHours()).padStart(2, "0");
      const minutos = String(selectedTime.getMinutes()).padStart(2, "0");
      setForm({ ...form, horaEliminacion: `${horas}:${minutos}` });
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
              REGISTRO CONTROL MUESTRAS DE ALIMENTOS
            </Text>
            <Text style={styles.version}>
              Versión: 01 | Fecha: Noviembre 2025
            </Text>
          </View>

          {/* Información */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Instrucciones</Text>
            <Text style={styles.infoText}>
              • Tomar muestra al momento del servicio
            </Text>
            <Text style={styles.infoText}>
              • Temperatura mayor a 60°C para platos calientes
            </Text>
            <Text style={styles.infoText}>
              • Muestra de 10-20g por preparación
            </Text>
            <Text style={styles.infoText}>
              • Conservar por 72 horas en refrigeración
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
              <Text style={styles.label}>Fecha del Servicio</Text>
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

            {mostrarCalendario && (
              <DateTimePicker
                value={fechaDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                onChange={onChangeFecha}
                locale="es-CO"
              />
            )}

            {/* Tiempo de Comida */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiempo de Comida</Text>
              <TouchableOpacity
                onPress={() => setMostrarTiempos(!mostrarTiempos)}
                style={[styles.input, { justifyContent: "center" }]}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                  {form.tiempoComida || "Seleccionar"}
                </Text>
              </TouchableOpacity>
            </View>

            {mostrarTiempos && (
              <View style={styles.pickerContainer}>
                {TIEMPOS_COMIDA.map((tiempo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerButton,
                      form.tiempoComida === tiempo && styles.pickerButtonActive,
                    ]}
                    onPress={() => {
                      handleInputChange("tiempoComida", tiempo);
                      setMostrarTiempos(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        form.tiempoComida === tiempo && styles.pickerTextActive,
                      ]}
                    >
                      {tiempo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Nombre del Plato */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Plato/Preparación</Text>
              <TextInput
                placeholder="Ej: Sopa de Verduras, Pollo a la Plancha"
                value={form.nombrePlato}
                onChangeText={(value) =>
                  handleInputChange("nombrePlato", value)
                }
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>

            {/* Horas de Finalización y Toma de Muestra */}
            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Hora de Preparación</Text>
                <TouchableOpacity
                  onPress={() => setMostrarRelojFinalizacion(true)}
                  style={[styles.input, { justifyContent: "center" }]}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                    🕐 {form.horaFinalizacion || "00:00"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Hora Toma De Muestra</Text>
                <TouchableOpacity
                  onPress={() => setMostrarRelojTomaMuestra(true)}
                  style={[styles.input, { justifyContent: "center" }]}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                    🕐 {form.horaTomaMuestra}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {mostrarRelojFinalizacion && (
              <DateTimePicker
                value={horaFinalizacionDate}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "clock"}
                onChange={onChangeHoraFinalizacion}
                locale="es-CO"
                is24Hour={true}
              />
            )}

            {mostrarRelojTomaMuestra && (
              <DateTimePicker
                value={horaTomaMuestraDate}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "clock"}
                onChange={onChangeHoraTomaMuestra}
                locale="es-CO"
                is24Hour={true}
              />
            )}

            {/* Temperatura y Tamaño */}
            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Temperatura (°C)</Text>
                <TextInput
                  placeholder="> 60°C"
                  value={form.temperaturaServicio}
                  onChangeText={(value) =>
                    handleInputChange("temperaturaServicio", value)
                  }
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor="#95a5a6"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Tamaño Muestra</Text>
                <TextInput
                  placeholder="10-20g"
                  value={form.tamanoMuestra}
                  onChangeText={(value) =>
                    handleInputChange("tamanoMuestra", value)
                  }
                  style={styles.input}
                  placeholderTextColor="#95a5a6"
                />
              </View>
            </View>

            {/* Tipo de Envase */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Envase/Rotulado</Text>
              <TouchableOpacity
                onPress={() => setMostrarEnvases(!mostrarEnvases)}
                style={[styles.input, { justifyContent: "center" }]}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                  {form.tipoEnvase || "Seleccionar"}
                </Text>
              </TouchableOpacity>
            </View>

            {mostrarEnvases && (
              <View style={styles.pickerContainer}>
                {TIPOS_ENVASE.map((envase, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerButton,
                      form.tipoEnvase === envase && styles.pickerButtonActive,
                    ]}
                    onPress={() => {
                      handleInputChange("tipoEnvase", envase);
                      setMostrarEnvases(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        form.tipoEnvase === envase && styles.pickerTextActive,
                      ]}
                    >
                      {envase}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Responsable */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Responsable</Text>
              <TextInput
                placeholder="Nombre del operario"
                value={form.responsable}
                onChangeText={(value) =>
                  handleInputChange("responsable", value)
                }
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>

            {/* Ubicación de Almacenamiento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ubicación de Almacenamiento</Text>
              <TouchableOpacity
                onPress={() => setMostrarUbicaciones(!mostrarUbicaciones)}
                style={[styles.input, { justifyContent: "center" }]}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                  {form.ubicacionAlmacenamiento || "Seleccionar"}
                </Text>
              </TouchableOpacity>
            </View>

            {mostrarUbicaciones && (
              <View style={styles.pickerContainer}>
                {UBICACIONES.map((ubicacion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerButton,
                      form.ubicacionAlmacenamiento === ubicacion &&
                        styles.pickerButtonActive,
                    ]}
                    onPress={() => {
                      handleInputChange("ubicacionAlmacenamiento", ubicacion);
                      setMostrarUbicaciones(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        form.ubicacionAlmacenamiento === ubicacion &&
                          styles.pickerTextActive,
                      ]}
                    >
                      {ubicacion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Fecha y Hora de Eliminación */}
            <View style={styles.inputGroup}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.label}>Fecha y Hora de Eliminación</Text>
                <TouchableOpacity
                  style={styles.autoCalculateButton}
                  onPress={calcularFechaEliminacion}
                >
                  <Text style={styles.autoCalculateText}>
                    🔄 Calcular (+72h)
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.rowGroup}>
                <TouchableOpacity
                  onPress={() => setMostrarCalendarioEliminacion(true)}
                  style={[
                    styles.input,
                    { flex: 1, marginRight: 10, justifyContent: "center" },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: "#2c3e50", fontSize: 14 }}>
                    📅 {form.fechaEliminacion || "Fecha"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setMostrarRelojEliminacion(true)}
                  style={[styles.input, { flex: 1, justifyContent: "center" }]}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: "#2c3e50", fontSize: 14 }}>
                    🕐 {form.horaEliminacion || "Hora"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {mostrarCalendarioEliminacion && (
              <DateTimePicker
                value={fechaEliminacionDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                onChange={onChangeFechaEliminacion}
                locale="es-CO"
                minimumDate={new Date()}
              />
            )}

            {mostrarRelojEliminacion && (
              <DateTimePicker
                value={horaEliminacionDate}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "clock"}
                onChange={onChangeHoraEliminacion}
                locale="es-CO"
                is24Hour={true}
              />
            )}

            {/* Supervisor */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Supervisor que Verifica</Text>
              <TextInput
                placeholder="Nombre del supervisor"
                value={form.supervisor}
                onChangeText={(value) => handleInputChange("supervisor", value)}
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>

            {/* Observaciones */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                placeholder="Comentarios adicionales (opcional)"
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

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={guardar}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>✓ Guardar Registro</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de registros */}
          {registros.length > 0 && (
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>Registros del Mes</Text>

              {registros.map((reg, idx) => (
                <View key={idx} style={styles.registroCard}>
                  <View
                    style={[
                      styles.registroHeader,
                      !reg.temperaturaCumple && styles.registroHeaderWarning,
                    ]}
                  >
                    <Text style={styles.registroFecha}>
                      🍽️ {reg.nombrePlato}
                    </Text>
                    <Text style={styles.registroAreas}>{reg.tiempoComida}</Text>
                  </View>

                  <View style={styles.registroBody}>
                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Fecha:</Text>
                      <Text style={styles.registroText}>{reg.fecha}</Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>
                        Hora finalización:
                      </Text>
                      <Text style={styles.registroText}>
                        {reg.horaFinalizacion}
                      </Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Hora toma:</Text>
                      <Text style={styles.registroText}>
                        {reg.horaTomaMuestra}
                      </Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Temperatura:</Text>
                      <Text
                        style={[
                          styles.registroText,
                          reg.temperaturaCumple
                            ? styles.textCumple
                            : styles.textNoCumple,
                        ]}
                      >
                        {reg.temperaturaServicio}°C{" "}
                        {reg.temperaturaCumple ? "✓" : "✗"}
                      </Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Tamaño:</Text>
                      <Text style={styles.registroText}>
                        {reg.tamanoMuestra}
                      </Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Envase:</Text>
                      <Text style={styles.registroText}>{reg.tipoEnvase}</Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Ubicación:</Text>
                      <Text style={styles.registroText}>
                        {reg.ubicacionAlmacenamiento}
                      </Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Eliminación:</Text>
                      <Text style={styles.registroText}>
                        {reg.fechaEliminacion} {reg.horaEliminacion}
                      </Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Responsable:</Text>
                      <Text style={styles.registroText}>{reg.responsable}</Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Supervisor:</Text>
                      <Text style={styles.registroText}>{reg.supervisor}</Text>
                    </View>

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
export default MuestrasAlimentosForm;
