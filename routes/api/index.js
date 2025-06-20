// routes/api/index.js
import { Router } from 'express';
import auth_router from './v1/auth.routes.js';
import companyRoutes from './v1/company.routes.js';
import vendorRoutes from './v1/vendedor.routes.js';
import product_Router from './v1/product.routes.js';
import clientRoutes from './v1/client.routes.js';
import supplierRoutes from './v1/supplier.routes.js';
import salesRoutes from './v1/sales.routes.js';
import purchasesRoutes from './v1/purchases.routes.js';
import inventoryRoutes from './v1/inventory.routes.js';
import cashRoutes from './v1/cash.routes.js';
import afip_Router from './v1/credenciales-afip.routes.js';
import facturas_Router from './v1/facturas-afip.routes.js';
import point_salesRoutes from './v1/point-sales.routes.js';
import facturas_sin_afip from "./v1/facturas-sin-afip.js";
import archivos_routes from "./v1/archivos.routes.js";
const routerV1 = Router();

// Agrega todas las rutas con sus prefijos base
routerV1.use('/auth', auth_router); //crado basico
routerV1.use('/companies', companyRoutes); //creado basico
routerV1.use('/vendors', vendorRoutes);//creado menos del basico
routerV1.use('/products', product_Router); //creado basico
routerV1.use('/clients', clientRoutes);
routerV1.use('/suppliers', supplierRoutes);
routerV1.use('/sales', salesRoutes);
routerV1.use('/purchases', purchasesRoutes);
routerV1.use('/inventory', inventoryRoutes);
routerV1.use('/cash', cashRoutes);
routerV1.use('/afip', afip_Router); //creado menos del basico
routerV1.use('/facturas', facturas_Router); //creado menos del basico
routerV1.use('/point-sales', point_salesRoutes); //creado menos del basico
routerV1.use('/tikets', facturas_sin_afip); //creado menos del basico
routerV1.use("/archivos", archivos_routes);//subir y bajar archivos
export default routerV1;