// ControlPlagasForm.js
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

const obtenerHoraActual = () => {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
};

const obtenerMesActual = () =>
  new Date().toLocaleString("es-CO", { month: "long" });
const obtenerAnioActual = () => new Date().getFullYear();

// Productos comunes de control de plagas
const PRODUCTOS_COMUNES = [
  "Rodenticida",
  "Insecticida",
  "Gel para cucarachas",
  "Cebo para roedores",
  "Spray insecticida",
  "Trampa adhesiva",
  "Repelente",
  "Otro",
];

const INITIAL_FORM_STATE = {
  fecha: obtenerFechaActual(),
  hora: obtenerHoraActual(),
  producto: "",
  lote: "",
  fechaVencimiento: "",
  descripcionProcedimiento: "",
  responsable: "",
  observaciones: "",
};

const ControlPlagasForm = () => {
  const [mes, setMes] = useState(obtenerMesActual());
  const [anio, setAnio] = useState(obtenerAnioActual());
  const [registros, setRegistros] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para DateTimePicker
  const [fechaDate, setFechaDate] = useState(new Date());
  const [fechaVencimientoDate, setFechaVencimientoDate] = useState(new Date());
  const [horaDate, setHoraDate] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarCalendarioVencimiento, setMostrarCalendarioVencimiento] =
    useState(false);
  const [mostrarReloj, setMostrarReloj] = useState(false);

  // Estados para selector
  const [mostrarProductos, setMostrarProductos] = useState(false);

  // Validación del formulario
  const validarFormulario = () => {
    if (!form.fecha.trim()) {
      Alert.alert("Error", "La fecha es obligatoria");
      return false;
    }

    if (!form.hora.trim()) {
      Alert.alert("Error", "La hora es obligatoria");
      return false;
    }

    if (!form.producto.trim()) {
      Alert.alert("Error", "El producto es obligatorio");
      return false;
    }

    if (!form.lote.trim()) {
      Alert.alert("Error", "El lote es obligatorio");
      return false;
    }

    if (!form.fechaVencimiento.trim()) {
      Alert.alert("Error", "La fecha de vencimiento es obligatoria");
      return false;
    }

    if (!form.descripcionProcedimiento.trim()) {
      Alert.alert("Error", "La descripción del procedimiento es obligatoria");
      return false;
    }

    if (!form.responsable.trim()) {
      Alert.alert("Error", "El responsable es obligatorio");
      return false;
    }

    // Verificar si el producto está vencido
    const hoy = new Date();
    const [dia, mes, anio] = form.fechaVencimiento.split("/");
    const fechaVenc = new Date(anio, mes - 1, dia);

    if (fechaVenc < hoy) {
      Alert.alert(
        "⚠️ Advertencia",
        "El producto está vencido.\n¿Desea continuar de todas formas?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Guardar igual", onPress: () => guardarRegistro() },
        ]
      );
      return false;
    }

    return true;
  };

  const guardarRegistro = async () => {
  try {
    setIsLoading(true);

    const registro = {
      fecha: form.fecha,
      hora: form.hora,
      producto: form.producto,
      lote: form.lote,
      fechaVencimiento: form.fechaVencimiento,
      descripcionProcedimiento: form.descripcionProcedimiento,
      responsable: form.responsable,
      observaciones: form.observaciones || "",
      mes,
      anio,
      createdAt: serverTimestamp(),
    };

    // 🔥 Guardar en Firestore
    await addDoc(collection(db, "controlPlagas"), registro);

    // 🧠 Mantener UI local
    setRegistros((prev) => [...prev, registro]);

    Alert.alert("✓ Éxito", "Registro guardado correctamente");

    setForm(INITIAL_FORM_STATE);
    setFechaDate(new Date());
    setFechaVencimientoDate(new Date());
    setHoraDate(new Date());
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

  // Manejador de cambio de fecha vencimiento
  const onChangeFechaVencimiento = (event, selectedDate) => {
    setMostrarCalendarioVencimiento(false);
    if (selectedDate) {
      setFechaVencimientoDate(selectedDate);
      const dia = String(selectedDate.getDate()).padStart(2, "0");
      const mes = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const anio = selectedDate.getFullYear();
      setForm({ ...form, fechaVencimiento: `${dia}/${mes}/${anio}` });
    }
  };

  // Manejador de cambio de hora
  const onChangeHora = (event, selectedTime) => {
    setMostrarReloj(false);
    if (selectedTime) {
      setHoraDate(selectedTime);
      const horas = String(selectedTime.getHours()).padStart(2, "0");
      const minutos = String(selectedTime.getMinutes()).padStart(2, "0");
      setForm({ ...form, hora: `${horas}:${minutos}` });
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
              REGISTRO CONTROL QUÍMICO DE PLAGAS
            </Text>
            <Text style={styles.version}>Versión: 02 | Fecha: Junio 2025</Text>
          </View>

          {/* Información */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Procedimiento</Text>
            <Text style={styles.infoText}>
              Se realizará de acuerdo con el plan de control de plagas
            </Text>
            <Text style={styles.infoText}>
              • Registre cada aplicación de productos
            </Text>
            <Text style={styles.infoText}>
              • Verifique la fecha de vencimiento
            </Text>
            <Text style={styles.infoText}>
              • Incluya descripción detallada del procedimiento
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

            {/* Fecha y Hora */}
            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
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

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Hora</Text>
                <TouchableOpacity
                  onPress={() => setMostrarReloj(true)}
                  style={[styles.input, { justifyContent: "center" }]}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                    🕐 {form.hora}
                  </Text>
                </TouchableOpacity>
              </View>
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

            {/* DateTimePicker para hora */}
            {mostrarReloj && (
              <DateTimePicker
                value={horaDate}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "clock"}
                onChange={onChangeHora}
                locale="es-CO"
                is24Hour={true}
              />
            )}

            {/* Producto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Producto</Text>
              <TouchableOpacity
                onPress={() => setMostrarProductos(!mostrarProductos)}
                style={[styles.input, { justifyContent: "center" }]}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                  {form.producto || "Seleccionar o escribir"}
                </Text>
              </TouchableOpacity>
            </View>

            {mostrarProductos && (
              <View style={styles.pickerContainer}>
                {PRODUCTOS_COMUNES.map((producto, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerButton,
                      form.producto === producto && styles.pickerButtonActive,
                    ]}
                    onPress={() => {
                      handleInputChange("producto", producto);
                      setMostrarProductos(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        form.producto === producto && styles.pickerTextActive,
                      ]}
                    >
                      {producto}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Campo manual si selecciona "Otro" */}
            {form.producto === "Otro" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Especificar Producto</Text>
                <TextInput
                  placeholder="Nombre del producto"
                  onChangeText={(value) => handleInputChange("producto", value)}
                  style={styles.input}
                  placeholderTextColor="#95a5a6"
                />
              </View>
            )}

            {/* Lote y Fecha de Vencimiento */}
            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Lote</Text>
                <TextInput
                  placeholder="Nº de lote"
                  value={form.lote}
                  onChangeText={(value) => handleInputChange("lote", value)}
                  style={styles.input}
                  placeholderTextColor="#95a5a6"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Fecha Vencimiento</Text>
                <TouchableOpacity
                  onPress={() => setMostrarCalendarioVencimiento(true)}
                  style={[styles.input, { justifyContent: "center" }]}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: "#2c3e50", fontSize: 14 }}>
                    📅 {form.fechaVencimiento || "Fecha"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* DateTimePicker para fecha vencimiento */}
            {mostrarCalendarioVencimiento && (
              <DateTimePicker
                value={fechaVencimientoDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                onChange={onChangeFechaVencimiento}
                locale="es-CO"
                minimumDate={new Date()}
              />
            )}

            {/* Descripción del Procedimiento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción del Procedimiento</Text>
              <TextInput
                placeholder="Detalle el procedimiento realizado: áreas tratadas, método aplicado, precauciones, etc."
                value={form.descripcionProcedimiento}
                onChangeText={(value) =>
                  handleInputChange("descripcionProcedimiento", value)
                }
                style={[styles.input, styles.textAreaLarge]}
                placeholderTextColor="#95a5a6"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Responsable */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Responsable</Text>
              <TextInput
                placeholder="Nombre del responsable de la aplicación"
                value={form.responsable}
                onChangeText={(value) =>
                  handleInputChange("responsable", value)
                }
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>

            {/* Observaciones */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Observaciones Adicionales</Text>
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
                      reg.estaVencido && styles.registroHeaderWarning,
                    ]}
                  >
                    <Text style={styles.registroFecha}>
                      🐜 {reg.producto}
                    </Text>
                    <Text style={styles.registroAreas}>
                      {reg.estaVencido ? "⚠️ Vencido" : "✓ Vigente"}
                    </Text>
                  </View>

                  <View style={styles.registroBody}>
                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Fecha y Hora:</Text>
                      <Text style={styles.registroText}>
                        {reg.fecha} - {reg.hora}
                      </Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Lote:</Text>
                      <Text style={styles.registroText}>{reg.lote}</Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Vencimiento:</Text>
                      <Text
                        style={[
                          styles.registroText,
                          reg.estaVencido && styles.textNoCumple,
                        ]}
                      >
                        {reg.fechaVencimiento}
                        {reg.estaVencido ? " ⚠️" : " ✓"}
                      </Text>
                    </View>

                    <Text style={styles.registroLabel}>Procedimiento:</Text>
                    <Text style={styles.registroTextProcedimiento}>
                      {reg.descripcionProcedimiento}
                    </Text>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Responsable:</Text>
                      <Text style={styles.registroText}>{reg.responsable}</Text>
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

export default ControlPlagasForm;