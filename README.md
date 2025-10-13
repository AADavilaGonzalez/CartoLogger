# CartoLogger

CartoLogger es una aplicación web de gestión de notas con representación y
organización cartográfica. La funcionalidad básica de la aplicación consiste
en una interfaz gráfica en donde se colocan diferentes marcadores en el mapa,
cada uno ligado a una nota/documento de texto que el usuario utiliza para
guardar información. El objetivo de la aplicación es ofrecer un sistema de
gestión de conocimiento directamente basado en la ubicación espacial en vez
de alguna otra estructura de manejo de datos como un sistema de archivos
convencional.

## Requesitos Indispesables
* Tener instalado una version de **MySql** compatible con
  Pomelo.EntityFramework.MySql version 9.0.0
* Tener instalado **.NET Core 9.0** con acceso a la utilidad
  de lina de comandos `dotnet`
* Tener instalado **Node y Node Package Manager (NPM)** con
  acceso a la utilidad de linea de comandos `npm` 

## Inicializar Entorno de Desarrollo

### Base de datos
* Asegurarse de que el servidor de de MySQL este corriendo
* Correr el script de creación de BD `CreateDevDb.sql` o alternativamente:
    - Crear un usuario de MySQL exactamente igual al siguiente:
        - `CREATE USER 'CartoLoggerAdmin'@'localhost' IDENTIFIED BY 'admin'`
    - Crear una base de datos con el siguiente nombre:
        - `CREATE DATABASE CartoLoggerDev`
    - Dar todos los privilegios al usuario sobre la base de datos:
        - `GRANT ALL PRIVILEGES ON CartoLoggerDev.* TO 'CartoLoggerAdmin'@'localhost'`
* Correr `dotnet ef database migrate` dentro de CartoLogger.Persistence
  para actualizar la base de datos a la utima migración disponible

### Backend
* Dentro de la carpeta `Server` ejecutar `dotnet restore` para cargar las
  dependencias del proyecto
* Para ejecutar el servidor, correr `dotnet run --projecto CartoLogger.WebApi`
  siempre y cuando estes dentro de Server

### Frontend
* Dentro de la carpeta `Client` ejecutar `npm install` para cargar las dependencias
  del proyecto
* Para ejecutar el servidor, correr `npm run dev` siempre y cuando estes dentro de
  `Client`
