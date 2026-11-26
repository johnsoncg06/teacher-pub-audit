# Herramienta de inventario de publicaciones del profesorado (versión de escritorio)

[繁體中文](README.md) | [English](README.en.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | **Español**

Una aplicación de escritorio para revisar las publicaciones anuales del profesorado en Web of Science y la calidad de las revistas en las que publica. La interfaz es la misma que la de la versión web. Además, cada usuario puede introducir su propia clave de la API Starter de Web of Science dentro de la aplicación y obtener los datos directamente, sin usar la terminal.

**Idioma de la interfaz**: con el selector de la esquina inferior izquierda se puede cambiar entre 繁體中文, English, 日本語, 한국어 y Español (por defecto, chino tradicional; la elección se recuerda). La ayuda y preguntas frecuentes y los documentos de instrucciones para IA siguen en chino tradicional; los datos del usuario, como nombres y departamentos, no se traducen.

**Autores**: Chiang Kuei-Hung (Informática Médica, 3.er curso, grupo A) y Yeh Jui-Ying (Medicina, 2.º curso, grupo B), Universidad Médica de China (China Medical University), Taiwán

## Características
- Un flujo guiado de ocho pasos: alcance del inventario → lista del profesorado → nombres en inglés → datos de WoS → emparejamiento → calidad de las revistas → revisión manual → informe
- Obtiene registros de tipo Article y Review de la Colección Principal de Web of Science, ya sea mediante la API Starter dentro de la aplicación o importando archivos exportados desde el sitio web de WoS (.xls, .xlsx, .csv, .txt)
- Empareja los artículos con el profesorado por nombre y afiliación, y marca para revisión manual a los autores que podrían ser homónimos
- Añade a cada revista su Factor de Impacto (JIF) y su cuartil JCR (Q1–Q4); se puede importar una exportación oficial de JCR para sustituir los datos incorporados
- Exporta en CSV los resúmenes por docente, las listas por artículo y las tablas de revistas, e imprime un informe en A4 apaisado a PDF
- Todos los datos permanecen en el ordenador del usuario; los proyectos se pueden guardar como archivos .json y abrir tanto en Mac como en Windows

## Descargar la última versión

| Ordenador | Descarga |
|---|---|
| Windows 10/11 | [**Instalador para Windows**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Windows_Setup.exe) |
| Mac (Apple silicon, M1 o posterior) | [**Mac (Apple silicon) .dmg**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Mac_AppleSilicon.dmg) |
| Mac (procesador Intel) | [**Mac (Intel) .dmg**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Mac_Intel.dmg) |
| Manual de usuario | [**Manual ilustrado en PDF** (chino tradicional)](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Manual_zh-TW.pdf) |

¿No sabes qué Mac tienes? Menú Apple → «Acerca de este Mac»: elige la versión Apple silicon si «Chip» empieza por Apple M, o la versión Intel si «Procesador» indica Intel. Todas las versiones y el historial de cambios están en la página de [Releases](https://github.com/johnsoncg06/teacher-pub-audit/releases).

## Manual de usuario

- [**Leer el manual ilustrado en línea**](docs/%E6%95%99%E5%B8%AB%E8%AB%96%E6%96%87%E7%9B%A4%E9%BB%9E%E5%B7%A5%E5%85%B7_%E5%9C%96%E8%A7%A3%E4%BD%BF%E7%94%A8%E8%AA%AA%E6%98%8E%E6%9B%B8.pdf) (PDF, 30 páginas, se abre directamente en GitHub; chino tradicional)
- [**Descargar el manual (PDF)**](https://github.com/johnsoncg06/teacher-pub-audit/releases/latest/download/TeacherPubAudit_Manual_zh-TW.pdf) (se publica con cada versión)
- Dentro de la aplicación, «說明與常見問題» (Ayuda y preguntas frecuentes; ⌘? o Ctrl+?, F1) ofrece el mismo contenido con búsqueda

El manual cubre la instalación, un recorrido ilustrado por los ocho pasos, cómo solicitar una cuenta de WoS y una clave de la API Starter, las dos formas de obtener datos (API dentro de la aplicación o exportación desde la web de WoS), los campos del informe, el almacenamiento de datos, la actualización y la desinstalación, y 57 preguntas frecuentes. Por ahora solo está disponible en chino tradicional.

**Flujo de trabajo**

| Paso | Qué se hace |
|---|---|
| 1 Alcance | Definir universidad, facultad, año y tipos de documento (por defecto, Article y Review) |
| 2 Lista del profesorado | Importar la lista (.xlsx, .xls, .csv) |
| 3 Nombres en inglés | Confirmar el nombre en inglés de cada docente y sus variantes de búsqueda |
| 4 Datos de WoS | Obtener los datos con tu clave de API dentro de la aplicación, o importar exportaciones web de WoS |
| 5 Emparejamiento | Los artículos se emparejan por autor y afiliación; los posibles homónimos quedan marcados |
| 6 Calidad de las revistas | Se añaden el JIF y el cuartil JCR (Q1–Q4) por ISSN; se puede importar un archivo oficial de JCR |
| 7 Revisión manual | Confirmar si cada artículo marcado pertenece al docente |
| 8 Informe | Exportar resúmenes por docente, listas por artículo y tablas de revistas, o imprimir a PDF |

## Compilar desde el código fuente (desarrolladores)
Cada vez que se suben a `main` archivos relacionados con la aplicación, GitHub Actions la compila y la publica en Releases:
- `TeacherPubAudit-Windows`: instalador para Windows (教師論文盤點工具_安裝程式.exe)
- `TeacherPubAudit-macOS-AppleSilicon`: .dmg para Mac con Apple silicon (serie M)
- `TeacherPubAudit-macOS-Intel`: .dmg para Mac con Intel
- Nota: puede ser necesario activar el modo de desarrollador o forzar la instalación.

Los archivos de cada compilación también están en **Actions** → la ejecución correspondiente de «編譯桌面版» (compilación de escritorio) → **Artifacts**.

En cada compilación se ejecutan pruebas automáticas sobre la aplicación empaquetada (componentes de ventana, acceso al llavero, conexión HTTPS y apertura de la interfaz), y la versión de Windows se analiza con Microsoft Defender. Una compilación que falle cualquier comprobación no genera instalador.

## Primer inicio (aplicación sin firmar)
- **Windows**: si aparece «Windows protegió su PC», haz clic en «Más información» → «Ejecutar de todas formas». El instalador no requiere permisos de administrador. Si Seguridad de Windows sigue bloqueándolo, ve a Seguridad de Windows → Protección antivirus y contra amenazas → Historial de protección, selecciona el elemento y elige «Permitir».
- **macOS**: tras arrastrar la aplicación a «Aplicaciones», la primera vez haz clic derecho sobre ella y elige «Abrir» → «Abrir». Si sigue bloqueada, ve a Ajustes del Sistema → «Privacidad y seguridad» y haz clic en «Abrir de todos modos», en la parte inferior.

## Archivos
- `main.py`: el contenedor de escritorio (pywebview). Llama a la API Starter de WoS y guarda la clave de API en el almacén seguro del sistema operativo (Administrador de credenciales de Windows / Llavero de macOS).
- `app.html`: la interfaz de la aplicación (igual que la versión web, generada a partir del código fuente de la aplicación).
- `setup.iss`: el script del instalador de Windows (Inno Setup).
- `version_info.txt`: información de versión incrustada en el ejecutable de Windows.
- `docs/`: el manual de usuario ilustrado (PDF).
- `.github/workflows/build.yml`: la configuración de la compilación automática.

La clave de API se guarda únicamente en el almacén seguro del sistema, en el ordenador del usuario. Nunca se escribe en un archivo ni se sube a ningún sitio.

## Fuentes de datos
Los datos de publicaciones proceden de la Colección Principal de Web of Science de Clarivate. Cada usuario necesita su propia clave de la API Starter de Web of Science (Free Institutional Member Plan). Los datos de calidad de revistas incorporados proceden del proyecto de GitHub suqingdong/impact_factor y no son una fuente oficial; los informes oficiales deben usar los datos de JCR de la institución.
