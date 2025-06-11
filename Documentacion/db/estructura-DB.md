# Diseño de estructura de datos  

## /Models  

**Carpetas**  

- /core -> Para modelos fundamentales o "centrales" que son la base de tu sistema (la empresa, usuarios principales, puntos de venta).  
- /accounting ->  Para las operaciones contables y financieras (compras, proveedores, caja).  
- /sales -> Para todo lo relacionado con el proceso de ventas (vendedores, facturas emitidas, clientes).  
- /inventory -> Para la gestión de productos y stock.  

**Reexportar**  

- /models/index.js -> organiza todas las importaciones de los esquemas y los exporta para su uso en respositories.  

### ¿ cómo se referencian los datos?  

**Relaciones Principales**  

diseño actual se basa en un modelo central de Empresa, y todas las demás entidades "pertenecen" a una empresa específica.  

- **empresa** -> propietario.  
- **empresa** -> vendedor.  
- **empresa** -> punto de venta.  
- **empresa** -> product.  
- **empresa** -> client.  
- **empresa** -> proveedor.  
  
**Relaciones Transaccionales**  

Estas relaciones conectan las operaciones o eventos que ocurren en el sistema.  

**Relación**: Cada FacturaEmitida es generada por una Empresa, por un Vendedor específico, desde un PuntoDeVenta concreto y para un Client (o receptor) particular.  

```bash
FacturaEmitida --> 1 (Empresa)
               --> 1 (Vendedor)
               --> 1 (PuntoDeVenta)
               --> 1 (Cliente - por referencia o datos incrustados)
```

**Compra con Empresa y Proveedor**  

**Relación**: Cada Compra es realizada por una Empresa a un Proveedor específico.  

```bash
Compra --> 1 (Empresa)
       --> 1 (Proveedor)
```

**MovimientoInventario con Empresa, Product y User**  

**Relación**: Cada MovimientoInventario es registrado por una Empresa, afecta a un Product particular y es realizado por un User (o Vendedor si tienen permisos).  

```bash
MovimientoInventario --> 1 (Empresa)
                     --> 1 (Producto)
                     --> 1 (Usuario/Vendedor)
```  

**Caja con Empresa, PuntoDeVenta y Vendedor**  

**Relación**: Cada registro de Caja pertenece a una Empresa, se asocia a un PuntoDeVenta específico y es gestionada por un Vendedor.  

```bash
Caja --> 1 (Empresa)
     --> 1 (PuntoDeVenta)
     --> 1 (Vendedor)
```  

## ¿ Cómo usar las referencias en mi codigo ?  

Cuando recuperas un documento de una colección, Mongoose solo te dará el _id referenciado. Para obtener los datos completos del documento relacionado, necesitas usar el método .populate().  
