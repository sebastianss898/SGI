import React, { useState } from "react";
import { guardarRegistroFirestore } from "../services/controlAguaService";
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

import styles from "../styles/globalStyles.styles";
import DateTimePicker from "@react-native-community/datetimepicker";

import { crearRegistro } from "../models/controlAgua";
import { generarPDF } from "../services/pdfGenerator";
import { SafeAreaView } from "react-native-safe-area-context";

// Rangos permitidos según resolución 2115/2007
const RANGOS = {
  cloro: { min: 0.3, max: 2.0, unidad: "mg/l" },
  ph: { min: 6.5, max: 9.0, unidad: "" },
};

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

const FORM_FIELDS = [
  {
    key: "fecha",
    label: "Fecha",
    placeholder: "DD/MM/AAAA",
    keyboardType: "numeric",
    type: "date",
  },
  {
    key: "hora",
    label: "Hora",
    placeholder: "HH:MM",
    keyboardType: "default",
    type: "time",
  },
  {
    key: "lugar",
    label: "Lugar de la toma",
    placeholder: "Ej: Cocina",
    keyboardType: "default",
    type: "text",
  },
  {
    key: "cloro",
    label: "Cloro (mg/l)",
    placeholder: "0.3 - 2.0",
    keyboardType: "decimal-pad",
    type: "number",
  },
  {
    key: "ph",
    label: "pH",
    placeholder: "6.5 - 9.0",
    keyboardType: "decimal-pad",
    type: "number",
  },
  {
    key: "responsable",
    label: "Responsable",
    placeholder: "Nombre completo",
    keyboardType: "default",
    type: "text",
  },
];

const obtenerMesActual = () =>
  new Date().toLocaleString("es-CO", { month: "long" });
const obtenerAnioActual = () => new Date().getFullYear();

const INITIAL_FORM_STATE = {
  fecha: obtenerFechaActual(),
  hora: obtenerHoraActual(),
  lugar: "",
  cloro: "",
  ph: "",
  responsable: "",
};

const GestionResiduosCloro = () => {
  const [mes, setMes] = useState(obtenerMesActual());
  const [anio, setAnio] = useState(obtenerAnioActual());
  const [registros, setRegistros] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para DateTimePicker
  const [fechaDate, setFechaDate] = useState(new Date());
  const [horaDate, setHoraDate] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarReloj, setMostrarReloj] = useState(false);

  // Validar si un valor cumple con el rango permitido
  const cumpleRango = (valor, tipo) => {
    const num = Number(valor);
    return num >= RANGOS[tipo].min && num <= RANGOS[tipo].max;
  };

  // Validación del formulario
  const validarFormulario = () => {
    for (let campo in form) {
      if (!form[campo].trim()) {
        Alert.alert(
          "Error",
          `El campo ${FORM_FIELDS.find((f) => f.key === campo)?.label || campo} es obligatorio`
        );
        return false;
      }
    }

    const cloro = Number(form.cloro);
    const ph = Number(form.ph);

    if (isNaN(cloro) || cloro < 0) {
      Alert.alert("Error", "El valor de cloro debe ser un número positivo");
      return false;
    }

    if (isNaN(ph) || ph < 0 || ph > 14) {
      Alert.alert("Error", "El pH debe estar entre 0 y 14");
      return false;
    }

    // Advertencia si no cumple rangos normativos
    if (!cumpleRango(cloro, "cloro")) {
      Alert.alert(
        "⚠️ Advertencia",
        `El cloro está fuera del rango permitido (${RANGOS.cloro.min} - ${RANGOS.cloro.max} mg/l)\n¿Desea continuar?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Guardar igual", onPress: () => guardarRegistro() },
        ]
      );
      return false;
    }

    if (!cumpleRango(ph, "ph")) {
      Alert.alert(
        "⚠️ Advertencia",
        `El pH está fuera del rango permitido (${RANGOS.ph.min} - ${RANGOS.ph.max})\n¿Desea continuar?`,
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
      lugar: form.lugar,
      responsable: form.responsable,

      cloro: Number(form.cloro),
      cloroCumple: cumpleRango(form.cloro, "cloro"),
      cumpleCloro: cumpleRango(form.cloro, "cloro"),
      cloroRango: {
        min: RANGOS.cloro.min,
        max: RANGOS.cloro.max,
        unidad: RANGOS.cloro.unidad,
      },

      ph: Number(form.ph),
      phCumple: cumpleRango(form.ph, "ph"),
      cumplePh: cumpleRango(form.ph, "ph"),
      phRango: {
        min: RANGOS.ph.min,
        max: RANGOS.ph.max,
        unidad: RANGOS.ph.unidad,
      },

      mes,
      anio,
      createdAt: new Date(),
    };

    // 🔥 Guardar en Firestore
    await guardarRegistroFirestore(mes, anio, registro);

    // 🧾 Guardar para tabla local
    setRegistros((prev) => [...prev, registro]);

    Alert.alert("✓ Éxito", "Registro guardado con rangos y validación");

    setForm(INITIAL_FORM_STATE);
    setFechaDate(new Date());
    setHoraDate(new Date());
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "No se pudo guardar en Firebase");
  } finally {
    setIsLoading(false);
  }
};



  const guardar = () => {
    if (!validarFormulario()) return;
    guardarRegistro();
  };

  const exportarPDF = async () => {
    if (!registros.length) {
      Alert.alert("Aviso", "No hay registros para exportar");
      return;
    }

    try {
      setIsLoading(true);
      const uri = await generarPDF(mes, anio, registros);
      Alert.alert("✓ PDF Generado", `Archivo guardado en:\n${uri}`);
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el PDF");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
            Control de Cloro Residual y pH del Agua Potable
          </Text>
          <Text style={styles.version}>Versión: 01 | Fecha: Junio 2025</Text>
        </View>

        {/* Información normativa */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Procedimiento</Text>
          <Text style={styles.infoText}>
            • Se realizará dos veces a la semana
          </Text>
          <Text style={styles.infoText}>
            • Punto de muestra: cualquier punto de distribución
          </Text>

          <Text style={styles.infoTitle}>
            📊 Rangos Permitidos (Res. 2115/2007)
          </Text>
          <Text style={styles.infoText}>
            • Cloro residual: {RANGOS.cloro.min} - {RANGOS.cloro.max} mg/l
          </Text>
          <Text style={styles.infoText}>
            • pH: {RANGOS.ph.min} - {RANGOS.ph.max}
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

          {FORM_FIELDS.map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>

              {field.type === "date" ? (
                <TouchableOpacity
                  onPress={() => setMostrarCalendario(true)}
                  style={[styles.input, { justifyContent: "center" }]}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                    📅 {form.fecha}
                  </Text>
                </TouchableOpacity>
              ) : field.type === "time" ? (
                <TouchableOpacity
                  onPress={() => setMostrarReloj(true)}
                  style={[styles.input, { justifyContent: "center" }]}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                    🕐 {form.hora}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TextInput
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChangeText={(value) => handleInputChange(field.key, value)}
                  keyboardType={field.keyboardType}
                  style={styles.input}
                  placeholderTextColor="#95a5a6"
                />
              )}
            </View>
          ))}

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

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={guardar}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>✓ Guardar Registro</Text>
          </TouchableOpacity>
        </View>

        {/* Tabla de registros */}
        {registros.length > 0 && (
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Registros del Mes</Text>

            {/* Header de tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.cellFecha, styles.headerText]}>
                Fecha
              </Text>
              <Text style={[styles.tableCell, styles.cellHora, styles.headerText]}>
                Hora
              </Text>
              <Text style={[styles.tableCell, styles.cellLugar, styles.headerText]}>
                Lugar
              </Text>
              <Text style={[styles.tableCell, styles.cellValor, styles.headerText]}>
                Cloro
              </Text>
              <Text style={[styles.tableCell, styles.cellValor, styles.headerText]}>
                pH
              </Text>
              <Text style={[styles.tableCell, styles.cellResp, styles.headerText]}>
                Resp.
              </Text>
            </View>

            {/* Filas de datos */}
            {registros.map((reg, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.cellFecha]}>
                  {reg.fecha}
                </Text>
                <Text style={[styles.tableCell, styles.cellHora]}>
                  {reg.hora}
                </Text>
                <Text
                  style={[styles.tableCell, styles.cellLugar]}
                  numberOfLines={1}
                >
                  {reg.lugar}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.cellValor,
                    reg.cloroCumple ? styles.cumple : styles.noCumple,
                  ]}
                >
                  {reg.cloro}
                  {reg.cloroCumple ? " ✓" : " ✗"}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.cellValor,
                    reg.phCumple ? styles.cumple : styles.noCumple,
                  ]}
                >
                  {reg.ph}
                  {reg.phCumple ? " ✓" : " ✗"}
                </Text>
                <Text
                  style={[styles.tableCell, styles.cellResp]}
                  numberOfLines={1}
                >
                  {reg.responsable.split(" ")[0]}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Botón exportar */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonSecondary,
            (!registros.length || isLoading) && styles.buttonDisabled,
          ]}
          onPress={exportarPDF}
          disabled={!registros.length || isLoading}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.buttonText,
              styles.buttonTextSecondary,
              (!registros.length || isLoading) && styles.buttonTextDisabled,
            ]}
          >
            {isLoading ? "Generando PDF..." : "📄 Exportar PDF del Mes"}
          </Text>
          
        </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GestionResiduosCloro;