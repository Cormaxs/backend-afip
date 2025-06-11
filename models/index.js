// models/index.js
import Empresa from './core/datos-empresa.js';
import User from './core/propietario.js';
import PuntoDeVenta from './core/puntos-de-ventas.js';

import Vendedor from './sales/vendedor.js';
import FacturaEmitida from './sales/facturas-emitidas.js';
import Client from './sales/client.js';

import Product from './inventory/product.js';
import MovimientoInventario from './inventory/MovimientoInventario.js';

import Compra from './accounting/facturarecibida.js';
import Proveedor from './accounting/proveedor.js';
import Caja from './accounting/RegistroDeCaja.js';

export {
    Empresa,
    User,
    PuntoDeVenta,
    Vendedor,
    FacturaEmitida,
    Client,
    Product,
    MovimientoInventario,
    Compra,
    Proveedor,
    Caja
};