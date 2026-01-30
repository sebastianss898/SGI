// TemperaturaEquiposForm.js
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

const TIPOS_EQUIPO = [
  { key: "refrigerador", label: "Refrigerador", icon: "❄️" },
  { key: "congelador", label: "Congelador", icon: "🧊" },
];

const TURNOS = ["AM", "PM"];

// Rangos de temperatura según el documento
const RANGOS_TEMPERATURA = {
  refrigerador: { min: 0, max: 4, unidad: "°C" },
  congelador: { min: -14, max: 0, unidad: "°C" },
};

const INITIAL_FORM_STATE = {
  fecha: obtenerFechaActual(),
  hora: obtenerHoraActual(),
  tipoEquipo: "",
  turno: "",
  temperatura: "",
  responsable: "",
  observaciones: "",
};

const TemperaturaEquiposForm = () => {
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

  // Estados para selectores
  const [mostrarEquipos, setMostrarEquipos] = useState(false);

  // Validar si un valor cumple con el rango permitido
  const cumpleRango = (valor, tipo) => {
    const num = Number(valor);
    return (
      num >= RANGOS_TEMPERATURA[tipo].min &&
      num <= RANGOS_TEMPERATURA[tipo].max
    );
  };

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

    if (!form.tipoEquipo) {
      Alert.alert("Error", "Debe seleccionar el tipo de equipo");
      return false;
    }

    if (!form.turno) {
      Alert.alert("Error", "Debe seleccionar el turno (AM/PM)");
      return false;
    }

    if (!form.temperatura.trim() || isNaN(form.temperatura)) {
      Alert.alert("Error", "La temperatura debe ser un número válido");
      return false;
    }

    const temp = Number(form.temperatura);

    if (!form.responsable.trim()) {
      Alert.alert("Error", "El responsable es obligatorio");
      return false;
    }

    // Advertencia si no cumple rangos
    if (!cumpleRango(temp, form.tipoEquipo)) {
      const rango = RANGOS_TEMPERATURA[form.tipoEquipo];
      Alert.alert(
        "⚠️ Advertencia",
        `La temperatura está fuera del rango permitido para ${form.tipoEquipo}:\n` +
          `Rango: ${rango.min}°C a ${rango.max}°C\n` +
          `Temperatura registrada: ${temp}°C\n\n` +
          `¿Desea continuar?`,
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
      const temp = Number(form.temperatura);
      const registro = {
        ...form,
        temperatura: temp,
        temperaturaCumple: cumpleRango(temp, form.tipoEquipo),
      };

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

  const handleInputChange = (campo, value) => {
    setForm({ ...form, [campo]: value });
  };

  const selectTurno = (turno) => {
    setForm({ ...form, turno });
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

  // Obtener estadísticas por tipo de equipo
  const obtenerEstadisticas = () => {
    const refrigeradores = registros.filter(
      (r) => r.tipoEquipo === "refrigerador"
    );
    const congeladores = registros.filter(
      (r) => r.tipoEquipo === "congelador"
    );

    return {
      totalRefrigeradores: refrigeradores.length,
      refrigeradoresOk: refrigeradores.filter((r) => r.temperaturaCumple)
        .length,
      totalCongeladores: congeladores.length,
      congeladoresOk: congeladores.filter((r) => r.temperaturaCumple).length,
    };
  };

  const stats = obtenerEstadisticas();

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
              REGISTRO TOMA DE TEMPERATURA DE EQUIPOS DE FRÍO
            </Text>
            <Text style={styles.version}>Versión: 01 | Fecha: Julio 2025</Text>
          </View>

          {/* Información normativa */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Rangos Permitidos</Text>
            <Text style={styles.infoText}>
              ❄️ Refrigeración: 0°C a 4°C
            </Text>
            <Text style={styles.infoText}>
              🧊 Congelación: -14°C a 0°C
            </Text>
            <Text style={[styles.infoTitle, { marginTop: 10 }]}>
              📊 Instrucciones
            </Text>
            <Text style={styles.infoText}>
              • Tomar temperatura 2 veces al día (AM/PM)
            </Text>
            <Text style={styles.infoText}>
              • Verificar el correcto funcionamiento
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

          {/* Estadísticas */}
          {registros.length > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>❄️</Text>
                <Text style={styles.statTitle}>Refrigeradores</Text>
                <Text style={styles.statValue}>
                  {stats.refrigeradoresOk}/{stats.totalRefrigeradores}
                </Text>
                <Text style={styles.statLabel}>Dentro del rango</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🧊</Text>
                <Text style={styles.statTitle}>Congeladores</Text>
                <Text style={styles.statValue}>
                  {stats.congeladoresOk}/{stats.totalCongeladores}
                </Text>
                <Text style={styles.statLabel}>Dentro del rango</Text>
              </View>
            </View>
          )}

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

            {/* Tipo de Equipo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Equipo</Text>
              <TouchableOpacity
                onPress={() => setMostrarEquipos(!mostrarEquipos)}
                style={[styles.input, { justifyContent: "center" }]}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                  {form.tipoEquipo
                    ? `${
                        TIPOS_EQUIPO.find((e) => e.key === form.tipoEquipo)
                          ?.icon
                      } ${
                        TIPOS_EQUIPO.find((e) => e.key === form.tipoEquipo)
                          ?.label
                      }`
                    : "Seleccionar"}
                </Text>
              </TouchableOpacity>
            </View>

            {mostrarEquipos && (
              <View style={styles.pickerContainer}>
                {TIPOS_EQUIPO.map((equipo) => (
                  <TouchableOpacity
                    key={equipo.key}
                    style={[
                      styles.pickerButton,
                      form.tipoEquipo === equipo.key &&
                        styles.pickerButtonActive,
                    ]}
                    onPress={() => {
                      handleInputChange("tipoEquipo", equipo.key);
                      setMostrarEquipos(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        form.tipoEquipo === equipo.key &&
                          styles.pickerTextActive,
                      ]}
                    >
                      {equipo.icon} {equipo.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Mostrar rango esperado según tipo de equipo */}
            {form.tipoEquipo && (
              <View style={styles.rangoInfo}>
                <Text style={styles.rangoInfoText}>
                  📊 Rango esperado:{" "}
                  {RANGOS_TEMPERATURA[form.tipoEquipo].min}°C a{" "}
                  {RANGOS_TEMPERATURA[form.tipoEquipo].max}°C
                </Text>
              </View>
            )}

          // Reemplaza la sección del Turno en el formulario:

{/* Turno */}
<View style={styles.inputGroup}>
  <Text style={styles.label}>Turno</Text>
  <View style={styles.turnoContainer}>
    {TURNOS.map((turno) => (
      <TouchableOpacity
        key={turno}
        style={[
          styles.turnoButton,
          form.turno === turno && styles.turnoButtonActive,
        ]}
        onPress={() => selectTurno(turno)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.turnoText,
            form.turno === turno && styles.turnoTextActive,
          ]}
        >
          {turno}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

            {/* Temperatura */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Temperatura (°C)</Text>
              <TextInput
                placeholder="Ej: 2 o -10"
                value={form.temperatura}
                onChangeText={(value) =>
                  handleInputChange("temperatura", value)
                }
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>

            {/* Responsable */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Responsable</Text>
              <TextInput
                placeholder="Nombre del responsable"
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
                      {TIPOS_EQUIPO.find((e) => e.key === reg.tipoEquipo)?.icon}{" "}
                      {TIPOS_EQUIPO.find((e) => e.key === reg.tipoEquipo)?.label}
                    </Text>
                    <Text style={styles.registroAreas}>{reg.turno}</Text>
                  </View>

                  <View style={styles.registroBody}>
                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Fecha y Hora:</Text>
                      <Text style={styles.registroText}>
                        {reg.fecha} - {reg.hora}
                      </Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Temperatura:</Text>
                      <Text
                        style={[
                          styles.registroTextBig,
                          reg.temperaturaCumple
                            ? styles.textCumple
                            : styles.textNoCumple,
                        ]}
                      >
                        {reg.temperatura}°C{" "}
                        {reg.temperaturaCumple ? "✓" : "✗"}
                      </Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Rango esperado:</Text>
                      <Text style={styles.registroTextSmall}>
                        {RANGOS_TEMPERATURA[reg.tipoEquipo].min}°C a{" "}
                        {RANGOS_TEMPERATURA[reg.tipoEquipo].max}°C
                      </Text>
                    </View>

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

export default TemperaturaEquiposForm;