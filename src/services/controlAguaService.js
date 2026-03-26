import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const getMonthNumberFromMes = (mes) => {
  if (!mes) return String(new Date().getMonth() + 1).padStart(2, "0");
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  if (typeof mes === "number") return String(mes).padStart(2, "0");
  if (!isNaN(Number(mes))) return String(Number(mes)).padStart(2, "0");
  const idx = meses.indexOf(String(mes).toLowerCase());
  if (idx >= 0) return String(idx + 1).padStart(2, "0");
  return String(new Date().getMonth() + 1).padStart(2, "0");
};

export const guardarRegistroFirestore = async (
  mes,
  anio,
  registro
) => {
  const docId = `${anio}-${getMonthNumberFromMes(mes)}`;

  const docRef = doc(db, "controlAgua", docId);

  // Crear documento del mes si no existe
  await setDoc(
    docRef,
    {
      mes,
      anio,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Subcolección registros
  await addDoc(collection(docRef, "registros"), {
    ...registro,
    timestamp: serverTimestamp(),
  });
};

export const obtenerRegistrosMes = async (mes, anio) => {
  const docId = `${anio}-${getMonthNumberFromMes(mes)}`;
  const registrosRef = collection(db, "controlAgua", docId, "registros");
  const snap = await getDocs(registrosRef);

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
