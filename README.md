no# Portal MG 

Sistema de administracio de informacion y usuarios de una empresa de autos. La misma va contar con:

- Información sobre las ordenes y garantias de los vehiculos
- Filtrado de datos para optimizar la experiencia del usuario
- Un control de autenticación de usuarios para acceder a información privilegiada
- Un gestor de sesiones para facilitar el acceso al sistema a los usuarios autorizados
- Un gestor de autorizaciones que permite controlar que usuarios pueden realizar operaciones dentro del sistema


## Guía para desarrolladores

### Ejecutar la aplicación en modo desarrollador

La aplicación es construida usando [Next.js](https://nextjs.org/) con [Bun.sh](https://bun.sh/) como entorno de ejecución y pruebas unitarias, y [Playwright.dev](https://playwright.dev/) para pruebas e2e, por lo que la siguiente guía esta orientada a aquellos desarrolladores que conozcan ambas tecnologías.

Para instalar la dependencias del proyecto, ejecutar el comando

```bash
bun install
```

Para inicializar la base de datos desde cero, es importante modificar el archivo `.env.example` de acuerdo a las preferencias de quien desarrolla. En particular, la variable `DATABASE_URL` debe indicar el archivo destino para la base de datos. Una vez modificado el archivo, recomendamos copiarlo en un archivo `.env` y correr el comando

```bash
npx prisma init
```

Para ejecutar el servidor de desarrollo, correr el siguiente comando

```bash
bun run dev
```

Para migrar la base de datos hay que correr el comando 

```bash
npm prisma migrate dev
```


Para ver la base de datos hay que correr el comando 

```bash
npm prisma studio
```

Cuando genere una modificacion en el schema de la base de datos voy a tener que utilizar este comando: en el cual lo optimo seria que el nombre
indique que modificacion se hizo en la base de datos 

```bash
npx prisma migrate dev --name nombre_migracion
```

Para insertar datos / correr el seed de prisma correr siguiente comando:
```bash
npx prisma db seed

```
Para eliminar datos de prisma correr siguiente comando:
```bash
node prisma/clean.js
node prisma/seed.js
```


### Ejecución de pruebas

Para ejecutar los pruebas unitarias, correr el siguiente comando

```bash
bun run tests
```

### Creación de nuevas pruebas

Las pruebas unitarias comprenden una tarea de cada desarrollador y es responsabilidad de quien construye, crear, ejecutar y resolver las pruebas al interior de sus carpetas. Para dar algunas indicaciones claras

- El nombre de la carpeta donde colocar las pruebas unitarias es `carpeta_de_trabajo/tests` 
- El nombre de los archivos que comprenden a las pruebas unitarias debe respetar el siguiente formato: `<prueba>.test.ts` . 
- Si alguno de estos preceptos no se respeta, la prueba no se ejecutará o al menos no desde los comandos que se indicaron en la sección anterior.

Las pruebas e2e solo deben existir en la carpeta `./tests` con un formato `<prueba>.spect.ts`. 

Es posible crear nuevos escenarios para pruebas, con el servidor de desarrollo en ejecución y el comando

```bash
bun run create:test:e2e
```



To do:
- Tests
- Fijarme que onda con las tablas, servicios realizados, y el apartado reclamos
- Ir comentando funcionalidades explicando que hacen o como funcionan


Pagina Ordenes:
Solo falta que filtre cuando yo toco el boton 
Realizar tests ordenes
observaciones del historial de observaciones (detalles de las ordenes)


Pagina certificados: falta desarrollar el funcionamiento de los filtros, Descargar certificado, logica de Garantia y bloqueado, y corregir las 4 fechas

Pagina general: Testing 

Formularios de Carga, desarrollar todo lo posible

Desarrollar el detalle servicio en la busqueda por VIN

ARREGLAR DESCARGA DE CERTIFICADO EN PAGINA DE CERTIFICADOS


Filtros de Certificados:
Empadronamiento: fecha activacion de garantia
F. Importacion: Cuando el auto llego al pais

laburar el getusers

Al crear un usuario en la pagina de General, ese usuario tiene que crearse como admin (importador)

Seguir desarrollando tests