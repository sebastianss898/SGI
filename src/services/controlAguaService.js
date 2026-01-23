import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const guardarRegistroFirestore = async (
  mes,
  anio,
  registro
) => {
  const docId = `${anio}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

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
  const docId = `${anio}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const registrosRef = collection(db, "controlAgua", docId, "registros");
  const snap = await getDocs(registrosRef);

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
