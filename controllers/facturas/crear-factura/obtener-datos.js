import { createXML } from "../../interactuar-afip-wsaa/4-get-cae/armarXML.js";
import { create_Factura } from "./factura_sola.js"; 

export async function facturaCompleta(req, res) {
  const {id} = req.body; // Asumo que el ID del usuario viene en el body
  console.log(id)
  const aprobarFactura = await createXML(req.body.afipRequestData, id); // Manda a AFIP y devuelve el CAE
  const datosFactura = req.body.facturaData; // Datos para completar la factura

  const necesario = aprobarFactura.Envelope.Body.FECAESolicitarResponse.FECAESolicitarResult.FeDetResp.FECAEDetResponse;

  if (necesario.Resultado === "A") {
    //console.log("aprobado:", necesario.CAE, necesario.CAEFchVto, necesario.CbteDesde, necesario.CbteHasta);
    // Asignar el CAE y su fecha de vencimiento
    datosFactura.comprobante.cae = necesario.CAE;
    datosFactura.comprobante.fechaVtoCae = necesario.CAEFchVto;
    //  Formatear y asignar el número de comprobante
    // Supongamos que `datosFactura.comprobante.puntoVenta` ya tiene el formato '00001'
    // Y `necesario.CbteDesde` es el número de comprobante devuelto por AFIP (ej. 123)
    const puntoVentaFormateado = String(datosFactura.comprobante.puntoVenta).padStart(5, '0');
    const numeroComprobanteFormateado = String(necesario.CbteDesde).padStart(8, '0'); // O CbteHasta, suelen ser iguales
    datosFactura.comprobante.numero = `${puntoVentaFormateado}-${numeroComprobanteFormateado}`;
    // También podrías actualizar el 'puntoVenta' en caso de que lo necesites limpio de tu request body
    //console.log("Datos de factura actualizados:", datosFactura);
    const facturaGenerada = await create_Factura(datosFactura, id)
    res.send(facturaGenerada);
    //console.log(facturaGenerada)
  } else {
    console.error("La factura fue rechazada por AFIP:", necesario.Observaciones || aprobarFactura);
    // Maneja el error, quizás enviando un status 400 o 500 y el mensaje de error de AFIP
    return res.status(400).send({
      message: "La factura fue rechazada por AFIP",
      afipErrors: necesario.Observaciones || aprobarFactura // Envía los errores de AFIP
    });
  }

  //res.send(aprobarFactura); // Puedes enviar la respuesta de AFIP, o una respuesta más completa
}