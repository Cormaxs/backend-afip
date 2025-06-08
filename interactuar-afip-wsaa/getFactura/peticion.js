//recordar modificar el numero de factura antes de enviar
import axios from 'axios';
let data = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">\r\n <soapenv:Header/>\r\n <soapenv:Body>\r\n <ar:FECAESolicitar>\r\n <!--Optional:-->\r\n <ar:Auth>\r\n <ar:Token>PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8c3NvIHZlcnNpb249IjIuMCI+CiAgICA8aWQgc3JjPSJDTj13c2FhaG9tbywgTz1BRklQLCBDPUFSLCBTRVJJQUxOVU1CRVI9Q1VJVCAzMzY5MzQ1MDIzOSIgZHN0PSJDTj13c2ZlLCBPPUFGSVAsIEM9QVIiIHVuaXF1ZV9pZD0iODc5NDI5MTkwIiBnZW5fdGltZT0iMTc0OTQwOTE3MSIgZXhwX3RpbWU9IjE3NDk0NTI0MzEiLz4KICAgIDxvcGVyYXRpb24gdHlwZT0ibG9naW4iIHZhbHVlPSJncmFudGVkIj4KICAgICAgICA8bG9naW4gZW50aXR5PSIzMzY5MzQ1MDIzOSIgc2VydmljZT0id3NmZSIgdWlkPSJTRVJJQUxOVU1CRVI9Q1VJVCAyMDQzNzgxMzcwMiwgQ049ZWplbXBvdGVzdGluIiBhdXRobWV0aG9kPSJjbXMiIHJlZ21ldGhvZD0iMjIiPgogICAgICAgICAgICA8cmVsYXRpb25zPgogICAgICAgICAgICAgICAgPHJlbGF0aW9uIGtleT0iMjA0Mzc4MTM3MDIiIHJlbHR5cGU9IjQiLz4KICAgICAgICAgICAgPC9yZWxhdGlvbnM+CiAgICAgICAgPC9sb2dpbj4KICAgIDwvb3BlcmF0aW9uPgo8L3Nzbz4K</ar:Token>\r\n <ar:Sign>C4ZlOmNLkwHUbiGMyGLbS/1MEu2ycu7gI35Fp8n6dz4INxtzPXEnSe/qjPFrz/lZ06D5bpY9vGWjTSv4N1QhxrHoYcJAgarJxFoyoE/1zxXRDQLlAc6Gl7jWoGGsxawwMuN20k/VGOPt1IhECUkhkh6/LckzlWlrtv+Fp5BBY4I=</ar:Sign>\r\n <ar:Cuit>20437813702</ar:Cuit>\r\n </ar:Auth>\r\n <ar:FeCAEReq>\r\n <ar:FeCabReq>\r\n <ar:CantReg>1</ar:CantReg>\r\n <ar:PtoVta>12</ar:PtoVta>\r\n <ar:CbteTipo>1</ar:CbteTipo> \r\n </ar:FeCabReq>\r\n <ar:FeDetReq>\r\n <ar:FECAEDetRequest>\r\n <ar:Concepto>1</ar:Concepto> \r\n <ar:DocTipo>80</ar:DocTipo> \r\n <ar:DocNro>20111111112</ar:DocNro>\r\n<ar:CbteDesde>2</ar:CbteDesde>\r\n<ar:CbteHasta>2</ar:CbteHasta>\r\n<ar:CbteFch>20250608</ar:CbteFch>\r\n<ar:ImpTotal>184.05</ar:ImpTotal>\r\n<ar:ImpTotConc>0</ar:ImpTotConc>\r\n<ar:ImpNeto>150</ar:ImpNeto>\r\n<ar:ImpOpEx>0</ar:ImpOpEx>\r\n<ar:ImpTrib>7.8</ar:ImpTrib>\r\n<ar:ImpIVA>26.25</ar:ImpIVA>\r\n<ar:FchServDesde></ar:FchServDesde>\r\n<ar:FchServHasta></ar:FchServHasta>\r\n<ar:FchVtoPago></ar:FchVtoPago>\r\n<ar:MonId>PES</ar:MonId>\r\n<ar:MonCotiz>1</ar:MonCotiz>\r\n<ar:CondicionIVAReceptorId>1</ar:CondicionIVAReceptorId>\r\n <ar:Tributos>\r\n <ar:Tributo>\r\n <ar:Id>99</ar:Id>\r\n<ar:Desc>Impuesto Municipal Matanza</ar:Desc>\r\n<ar:BaseImp>150</ar:BaseImp>\r\n<ar:Alic>5.2</ar:Alic>\r\n<ar:Importe>7.8</ar:Importe>\r\n </ar:Tributo>\r\n </ar:Tributos>\r\n<ar:Iva>\r\n <ar:AlicIva>\r\n <ar:Id>5</ar:Id> \r\n <ar:BaseImp>100</ar:BaseImp>\r\n<ar:Importe>21</ar:Importe>\r\n </ar:AlicIva>\r\n<ar:AlicIva>\r\n <ar:Id>4</ar:Id> \r\n <ar:BaseImp>50</ar:BaseImp>\r\n<ar:Importe>5.25</ar:Importe>\r\n </ar:AlicIva>\r\n </ar:Iva>\r\n</ar:FECAEDetRequest>\r\n </ar:FeDetReq>\r\n </ar:FeCAEReq>\r\n </ar:FECAESolicitar>\r\n </soapenv:Body>\r\n</soapenv:Envelope> ';

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx',
  headers: { 
    'SOAPAction': 'http://ar.gov.afip.dif.FEV1/FECAESolicitar', 
    'Content-Type': 'text/xml; charset=utf-8', 
    'Cookie': 'f5avraaaaaaaaaaaaaaaa_session_=MIKKBEHGDBKGEJPLNPDIOCFCPNJHCLMFKNKINNFKPNLFAMJLAGGLLFGEFLIEIAEEEDEDIPGMGBCMADFHJLCAGOJBCOODKKDNPKMNKMBGCLILPFJLOIBCIIJJOEGNGKOC; TS010b76f1=01ef919f30a5ec96a44455d96aa89e43c40e7e2304563580ca73422e9922ed8d6e82d97461e5f8c3abe6cd6ebaa310caa824c631085830acb1ed56819d84f72b521f9a73f8'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
