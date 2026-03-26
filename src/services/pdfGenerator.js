import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";

export async function generarPDF(mes, anio, registros) {
  const filas = registros.map(r => `
    <tr>
      <td>${r.fecha ?? r.dia}</td>
      <td>${r.hora}</td>
      <td>${r.lugar}</td>
      <td>${r.cloro}</td>
      <td>${r.cumpleCloro ? "✔" : "✘"}</td>
      <td>${r.ph}</td>
      <td>${r.cumplePh ? "✔" : "✘"}</td>
      <td>${r.responsable}</td>
    </tr>
  `).join("");

  const html = `
  <html>
    <body style="font-family: Arial; font-size: 12px">
      <h2>ÚRSULA CAFÉ</h2>
      <h3>Control de Cloro Residual y pH del Agua Potable</h3>
      <p><strong>Mes:</strong> ${mes} ${anio}</p>

      <table border="1" width="100%" cellpadding="6" cellspacing="0">
        <tr>
          <th>Día</th>
          <th>Hora</th>
          <th>Lugar</th>
          <th>Cloro</th>
          <th>Cumple</th>
          <th>pH</th>
          <th>Cumple</th>
          <th>Responsable</th>
        </tr>
        ${filas}
      </table>

      <p>
        Rangos permitidos Resolución 2115/2007<br/>
        Cloro: 0.3 – 2.0 mg/L | pH: 6.5 – 9.0
      </p>
    </body>
  </html>
  `;

  const file = await Print.printToFileAsync({ html });
  const path =
    FileSystem.documentDirectory +
    `Control_Agua_${mes}_${anio}.pdf`;

  await FileSystem.moveAsync({
    from: file.uri,
    to: path
  });

  return path;
}
