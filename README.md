# LSFD Institutional Portal

Portal institucional de Los Santos Fire Department construido con Next.js 15, React 19 y TypeScript. Incluye el portal normativo, acceso del personal, gestión administrativa, procedimientos y denuncias PSD.

## Novedades de esta versión

- Portada fotográfica tipo slideshow con las tres escenas institucionales compartidas.
- Rotación automática cada 6,5 segundos, controles manuales, indicadores y pausa al pasar el cursor o enfocar los controles.
- Diseño adaptable a móvil y respeto por la preferencia de movimiento reducido del sistema.
- Nueva sección de identidad institucional con presentación, misión, visión y valores.
- Se conservan las vistas del código normativo, disciplina, procedimientos, neutralidad, autenticación y panel interno.

## Desarrollo local

Requiere Node.js 24.x.

1. Instalar dependencias: `npm install`
2. Crear `.env.local` a partir de `.env.example` y completar las variables de entorno en privado.
3. Iniciar: `npm run dev`
4. Compilar: `npm run build`

## Variables de entorno

Configurar en Vercel y localmente las variables requeridas por la integración Supabase. No subir `.env.local`, claves secretas, tokens ni credenciales al repositorio.

## Subir una versión completa desde GitHub web

Descomprimir el ZIP y cargar el contenido de la carpeta `lsfd_owner_work` en la raíz del repositorio. Si GitHub pregunta por archivos existentes, confirmar la actualización de esos archivos y crear un único commit. No subir la carpeta externa como una carpeta anidada dentro del repositorio.
