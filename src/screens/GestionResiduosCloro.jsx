import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

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

  const guardarRegistro = () => {
    try {
      const registro = crearRegistro({
        ...form,
        cloro: Number(form.cloro),
        ph: Number(form.ph),
        cloroCumple: cumpleRango(form.cloro, "cloro"),
        phCumple: cumpleRango(form.ph, "ph"),
      });

      setRegistros([...registros, registro]);
      Alert.alert("✓ Éxito", "Registro guardado correctamente");
      setForm(INITIAL_FORM_STATE);
      setFechaDate(new Date());
      setHoraDate(new Date());
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el registro");
      console.error(error);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  officialHeader: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 4,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  version: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  infoCard: {
    backgroundColor: "#ecf0f1",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#34495e",
    marginLeft: 4,
    marginBottom: 2,
  },
  periodContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 8,
  },
  periodValue: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
    textTransform: "capitalize",
  },
  recordCount: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34495e",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dfe6e9",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#2c3e50",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#34495e",
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  headerText: {
    color: "#fff",
    fontWeight: "600",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  tableCell: {
    fontSize: 12,
    color: "#2c3e50",
    textAlign: "center",
  },
  cellFecha: {
    width: 80,
    fontWeight: "600",
    fontSize: 11,
  },
  cellHora: {
    width: 50,
  },
  cellLugar: {
    flex: 1,
    textAlign: "left",
    paddingLeft: 4,
  },
  cellValor: {
    width: 60,
    fontWeight: "600",
  },
  cellResp: {
    width: 60,
    fontSize: 11,
  },
  cumple: {
    color: "#27ae60",
  },
  noCumple: {
    color: "#e74c3c",
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  buttonPrimary: {
    backgroundColor: "#27ae60",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#3498db",
  },
  buttonDisabled: {
    backgroundColor: "#ecf0f1",
    borderColor: "#bdc3c7",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonTextSecondary: {
    color: "#3498db",
  },
  buttonTextDisabled: {
    color: "#95a5a6",
  },
});

export default GestionResiduosCloro;