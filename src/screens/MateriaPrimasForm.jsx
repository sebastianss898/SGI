// MateriaPrimasForm.js
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

const obtenerMesActual = () =>
  new Date().toLocaleString("es-CO", { month: "long" });
const obtenerAnioActual = () => new Date().getFullYear();

const UNIDADES_MEDIDA = [
  "Kg",
  "g",
  "L",
  "ml",
  "Unidades",
  "Cajas",
  "Paquetes",
  "Libras",
];

const CONDICIONES_ORGANOLEPTICAS = [
  { key: "color", label: "Color" },
  { key: "olor", label: "Olor" },
  { key: "sabor", label: "Sabor" },
];

const INITIAL_FORM_STATE = {
  fecha: obtenerFechaActual(),
  producto: "",
  cantidad: "",
  unidadMedida: "",
  temperatura: "",
  proveedor: "",
  fechaVencimiento: "",
  lote: "",
  colorCumple: true,
  olorCumple: true,
  saborCumple: true,
  cumpleGeneral: true,
  responsable: "",
  observaciones: "",
};

const MateriaPrimasForm = () => {
  const [mes, setMes] = useState(obtenerMesActual());
  const [anio, setAnio] = useState(obtenerAnioActual());
  const [registros, setRegistros] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para DateTimePicker
  const [fechaDate, setFechaDate] = useState(new Date());
  const [fechaVencimientoDate, setFechaVencimientoDate] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarCalendarioVencimiento, setMostrarCalendarioVencimiento] =
    useState(false);

  // Estados para selector de unidad
  const [mostrarUnidades, setMostrarUnidades] = useState(false);

  // Validación del formulario
  const validarFormulario = () => {
    if (!form.fecha.trim()) {
      Alert.alert("Error", "La fecha es obligatoria");
      return false;
    }

    if (!form.producto.trim()) {
      Alert.alert("Error", "El producto es obligatorio");
      return false;
    }

    if (!form.cantidad.trim() || isNaN(form.cantidad)) {
      Alert.alert("Error", "La cantidad debe ser un número válido");
      return false;
    }

    if (!form.unidadMedida) {
      Alert.alert("Error", "Debe seleccionar una unidad de medida");
      return false;
    }

    if (!form.proveedor.trim()) {
      Alert.alert("Error", "El proveedor es obligatorio");
      return false;
    }

    if (!form.fechaVencimiento.trim()) {
      Alert.alert("Error", "La fecha de vencimiento es obligatoria");
      return false;
    }

    if (!form.responsable.trim()) {
      Alert.alert("Error", "El responsable es obligatorio");
      return false;
    }

    // Advertencia si alguna condición organoléptica no cumple
    if (!form.colorCumple || !form.olorCumple || !form.saborCumple) {
      Alert.alert(
        "⚠️ Advertencia",
        "Una o más condiciones organolépticas no cumplen.\n¿Desea continuar?",
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
      const todasCumplen =
        form.colorCumple && form.olorCumple && form.saborCumple;

      const registro = {
        ...form,
        cumpleGeneral: todasCumplen,
        cantidad: Number(form.cantidad),
        temperatura: form.temperatura ? Number(form.temperatura) : null,
      };

      setRegistros([...registros, registro]);
      Alert.alert("✓ Éxito", "Registro guardado correctamente");
      setForm(INITIAL_FORM_STATE);
      setFechaDate(new Date());
      setFechaVencimientoDate(new Date());
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el registro");
      console.error(error);
    }
  };

  const guardar = () => {
    if (!validarFormulario()) return;
    guardarRegistro();
  };

  const toggleCondicion = (campo) => {
    setForm({ ...form, [campo]: !form[campo] });
  };

  const handleInputChange = (campo, value) => {
    setForm({ ...form, [campo]: value });
  };

  // Manejador de cambio de fecha ingreso
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
              REGISTRO INGRESO DE MATERIAS PRIMAS
            </Text>
            <Text style={styles.version}>Versión: 01 | Fecha: Julio 2025</Text>
          </View>

          {/* Información */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Instrucciones</Text>
            <Text style={styles.infoText}>
              • Registre cada ingreso de materia prima
            </Text>
            <Text style={styles.infoText}>
              • Verifique las condiciones organolépticas
            </Text>
            <Text style={styles.infoText}>
              • Incluya fecha de vencimiento y lote
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

            {/* Fecha de Ingreso */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Ingreso</Text>
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

            {/* Producto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Producto</Text>
              <TextInput
                placeholder="Nombre del producto"
                value={form.producto}
                onChangeText={(value) => handleInputChange("producto", value)}
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>

            {/* Cantidad y Unidad de Medida */}
            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Cantidad</Text>
                <TextInput
                  placeholder="0"
                  value={form.cantidad}
                  onChangeText={(value) => handleInputChange("cantidad", value)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#95a5a6"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Unidad</Text>
                <TouchableOpacity
                  onPress={() => setMostrarUnidades(!mostrarUnidades)}
                  style={[styles.input, { justifyContent: "center" }]}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: "#2c3e50", fontSize: 16 }}>
                    {form.unidadMedida || "Seleccionar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Selector de unidades */}
            {mostrarUnidades && (
              <View style={styles.pickerContainer}>
                {UNIDADES_MEDIDA.map((unidad, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerButton,
                      form.unidadMedida === unidad && styles.pickerButtonActive,
                    ]}
                    onPress={() => {
                      handleInputChange("unidadMedida", unidad);
                      setMostrarUnidades(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        form.unidadMedida === unidad && styles.pickerTextActive,
                      ]}
                    >
                      {unidad}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Temperatura */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Temperatura (°C) - Opcional</Text>
              <TextInput
                placeholder="Temperatura de recepción"
                value={form.temperatura}
                onChangeText={(value) =>
                  handleInputChange("temperatura", value)
                }
                keyboardType="decimal-pad"
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>

            {/* Proveedor */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Proveedor</Text>
              <TextInput
                placeholder="Nombre del proveedor"
                value={form.proveedor}
                onChangeText={(value) => handleInputChange("proveedor", value)}
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>

            {/* Fecha de Vencimiento y Lote */}
            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Fecha Vencimiento</Text>
                <TouchableOpacity
                  onPress={() => setMostrarCalendarioVencimiento(true)}
                  style={[styles.input, { justifyContent: "center" }]}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: "#2c3e50", fontSize: 14 }}>
                    📅 {form.fechaVencimiento || "Seleccionar"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Lote</Text>
                <TextInput
                  placeholder="Nº Lote"
                  value={form.lote}
                  onChangeText={(value) => handleInputChange("lote", value)}
                  style={styles.input}
                  placeholderTextColor="#95a5a6"
                />
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

            {/* Condiciones Organolépticas */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Condiciones Organolépticas</Text>
              <Text style={styles.infoText}>
                Marque en verde si cumple, en rojo si no cumple:
              </Text>

              {CONDICIONES_ORGANOLEPTICAS.map((condicion) => (
                <View key={condicion.key} style={styles.condicionRow}>
                  <Text style={styles.condicionLabel}>{condicion.label}</Text>
                  <View style={styles.condicionButtons}>
                    <TouchableOpacity
                      onPress={() =>
                        toggleCondicion(`${condicion.key}Cumple`)
                      }
                      style={[
                        styles.condicionButton,
                        form[`${condicion.key}Cumple`]
                          ? styles.condicionCumple
                          : styles.condicionNoCumple,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.condicionButtonText}>
                        {form[`${condicion.key}Cumple`] ? "C ✓" : "NC ✗"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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
                      !reg.cumpleGeneral && styles.registroHeaderWarning,
                    ]}
                  >
                    <Text style={styles.registroFecha}>
                      📦 {reg.producto}
                    </Text>
                    <Text style={styles.registroAreas}>
                      {reg.cantidad} {reg.unidadMedida}
                    </Text>
                  </View>

                  <View style={styles.registroBody}>
                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Fecha ingreso:</Text>
                      <Text style={styles.registroText}>{reg.fecha}</Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Proveedor:</Text>
                      <Text style={styles.registroText}>{reg.proveedor}</Text>
                    </View>

                    <View style={styles.registroRow}>
                      <Text style={styles.registroLabel}>Vencimiento:</Text>
                      <Text style={styles.registroText}>
                        {reg.fechaVencimiento}
                      </Text>
                    </View>

                    {reg.lote && (
                      <View style={styles.registroRow}>
                        <Text style={styles.registroLabel}>Lote:</Text>
                        <Text style={styles.registroText}>{reg.lote}</Text>
                      </View>
                    )}

                    {reg.temperatura && (
                      <View style={styles.registroRow}>
                        <Text style={styles.registroLabel}>Temperatura:</Text>
                        <Text style={styles.registroText}>
                          {reg.temperatura}°C
                        </Text>
                      </View>
                    )}

                    <Text style={styles.registroLabel}>
                      Condiciones Organolépticas:
                    </Text>
                    <View style={styles.condicionesResumen}>
                      <Text
                        style={[
                          styles.condicionChip,
                          reg.colorCumple
                            ? styles.chipCumple
                            : styles.chipNoCumple,
                        ]}
                      >
                        Color: {reg.colorCumple ? "C ✓" : "NC ✗"}
                      </Text>
                      <Text
                        style={[
                          styles.condicionChip,
                          reg.olorCumple
                            ? styles.chipCumple
                            : styles.chipNoCumple,
                        ]}
                      >
                        Olor: {reg.olorCumple ? "C ✓" : "NC ✗"}
                      </Text>
                      <Text
                        style={[
                          styles.condicionChip,
                          reg.saborCumple
                            ? styles.chipCumple
                            : styles.chipNoCumple,
                        ]}
                      >
                        Sabor: {reg.saborCumple ? "C ✓" : "NC ✗"}
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

export default MateriaPrimasForm;