# [Facstock](https://facstock.com) gestor de inventario y facturación  

La idea de [Facstock](https://facstock.com) es crear un gestor de inventario para pequeños, medianos y grandes emprendimientos.  
Facilitando el manejo de inventario en unos simples clicks al igual que la facturacion compatible con [ARCA-AFIP](https://www.afip.gob.ar/landing/default.asp).  

## Recorrido de los datos

**Entrada** -> app.js -> levanta el servidor y deriba a routes.  
**Routes** -> /routes/auth.js -> usa middlewares (../middlewares/auth.js) antes de pasar a controllers (/controllers/auth.js).  
**Controllers** -> /controllers/auth.js -> extrae los datos necesarios de la request y deriba a services (/services/auth.js), tambien devuelve res, error.  
**Services** -> /services/auth.js -> hace la logica, por ejemplo hashear  password, llamar a repositories.  
**Repositories** -> /repositories/auth.js -> interactua directamente con la base de datos usando /models/.  
**Models** ->  /models/user.js -> crea los modelos de los datos, en este caso mongodb.  
**Db** -> /db/db.js -> unica coneccion a la base de datos.  
**Middlewares** -> verifican los datos basicos de entrada, tambien verifican si el username existe en la base de datos.  
**Utils** -> archivos extras como JWT, bcrypt, etc.  
**raiz-users** -> /raiz-users/id/afip-facturas -> ruta de almacenamiento para las credenciales necesarias del usuario para emitir facturas, y guardar los pdf de las ventas.  
**interactuar-afip-wsaa** -> carpeta para generar dinamicamente los archivos necesarios para facturar, se almacenan en la raiz, esta dividido en pasos.  

## Indice

[Autenticación](./Documentacion/auth.md)  
[Facturación](./Documentacion/facturas.md)  
[Productos](./Documentacion/productos.md)  
[Credenciales-AFIP-ARCA](./Documentacion/credenciales-afip.md)  

### Como usar

Copiar y ejecutar en terminal.

```bash
git clone https://github.com/Cormaxs/backend-afip.git
```

Instalar dependencias.

```bash
npm install
```

Instalar nodemon si lo deseas.

```bash
npm install --save-dev nodemon
```

Correr el programa

```bash
npm run dev 
```  
