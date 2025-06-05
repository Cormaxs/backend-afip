# login basico en node js

## Recorrido de los datos

**Entrada** -> app.js -> levanta el servidor y deriba a routes
**Routes** -> /routes/auth.js -> usa middlewares (../middlewares/auth.js) antes de pasar a controllers (/controllers/auth.js)
**Controllers** -> /controllers/auth.js -> extrae los datos necesarios de la request y deriba a services (/services/auth.js), tambien devuelve res, error
**Services** -> /services/auth.js -> hace la logica, por ejemplo hashear  password, llamar a repositories
**Repositories** -> /repositories/auth.js -> interactua directamente con la base de datos usando /models/
**Models** ->  /models/user.js -> crea los modelos de los datos, en este caso mongodb
**Db** -> /db/db.js -> unica coneccion a la base de datos

## Endpoints

Reciben los usuarios, datos username y password

POST

```bash
/auth/register
```

POST

```bash
/auth/login
```
