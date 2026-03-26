export const crearRegistro = ({
  fecha,
  hora,
  lugar,
  cloro,
  ph,
  responsable,
  mes,
  anio,
}) => ({
  // Mantener `fecha` y `hora` en formato legible
  fecha: fecha || "",
  hora,
  lugar,
  cloro: Number(cloro),
  // Campos con nombres consistentes para la vista
  cloroCumple: Number(cloro) >= 0.3 && Number(cloro) <= 2,
  // Compatibilidad hacia atrás
  cumpleCloro: Number(cloro) >= 0.3 && Number(cloro) <= 2,
  ph: Number(ph),
  phCumple: Number(ph) >= 6.5 && Number(ph) <= 9,
  cumplePh: Number(ph) >= 6.5 && Number(ph) <= 9,
  responsable,
  mes,
  anio,
});
