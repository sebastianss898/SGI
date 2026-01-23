import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({

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

   checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkboxLabel: {
    fontSize: 15,
    color: '#2c3e50',
  },
  checkboxChecked: {
  backgroundColor: "#3498db", // Verde cuando está seleccionado
},

  /* puedes seguir moviendo TODO el StyleSheet aquí */
});

