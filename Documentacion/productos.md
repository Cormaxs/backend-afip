# TODO LO RELACIONADO CON LOS PRODUCTOS DEL USAURIO

Uso un modelo User y otro Product, al crear un producto, le referencio el ID del creador. Haciendo que el producto apunte al usuario.  

## Endpoints

POST  

```bash
/productos/add
```

Espera un JSON :  

```bash
{
  "marca": "Logitech",
  "categoria": "Periféricos",
  "producto": "Teclado K120",
  "descripcion": "Teclado USB básico y duradero, ideal para oficina y uso diario.",
  "ancho_cm": 45,
  "alto_cm": 2.3,
  "profundidad_cm": 15,
  "peso_kg": 0.55,
  "precio_de_ingreso": 15000,
  "precio_standard_validation": 16500,
  "alic_IVA": 21,
  "markup_producto": 0.25,
  "precio_venta_final": 20625,
  "redondeo": 0,
  "stock_disponible": 150,
  "owner": "60c72b2f9b1d8e001c8e7a0b"
}
```  

## Estructuración de como se pasan los datos

/controllers/product_controllers.js -> Pasa la información del producto hacia services.  
/services/product_services.js -> Agrega el producto a la base de datos usando /repositories/repo_product.js -> usa la clase ProductRepository para manejar las consultas a la base de datos.  
