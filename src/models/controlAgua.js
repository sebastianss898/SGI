export const crearRegistro = ({
  dia,
  hora,
  lugar,
  cloro,
  ph,
  responsable
}) => ({
  dia: Number(dia),
  hora,
  lugar,
  cloro,
  cumpleCloro: cloro >= 0.3 && cloro <= 2,
  ph,
  cumplePh: ph >= 6.5 && ph <= 9,
  responsable
});
