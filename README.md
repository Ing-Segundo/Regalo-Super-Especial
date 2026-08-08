# 💖 Página Web de Aniversario (1 año y 3 meses)

Una experiencia web interactiva, romántica, elegante y moderna diseñada para ser regalada en un aniversario especial. Pensada para publicarse fácilmente en **GitHub Pages**.

---

## 📂 Estructura del Proyecto

```text
/
├── index.html          # Estructura principal y contenido emocional
├── style.css           # Estilos CSS, gradientes metálicos y animaciones
├── script.js           # Lógica interactiva (partículas, flores, música, contador)
├── assets/
│   ├── images/
│   │   ├── foto-1.jpg  # FOTO 1: Primer recuerdo
│   │   ├── foto-2.jpg  # FOTO 2: Momento especial
│   │   ├── foto-3.jpg  # FOTO 3: Fotografía emocional
│   │   ├── foto-4.jpg  # FOTO 4: Recuerdo reciente
│   │   └── foto-5.jpg  # FOTO 5: Fotografía final
│   └── music/
│       └── nuestra-cancion.mp3  # Tu canción especial en MP3
└── README.md           # Guía de configuración y publicación
```

---

## 📸 1. Guía para colocar tus Fotografías

Para que tus fotos se muestren perfectamente, guárdalas dentro de la carpeta `assets/images/` reemplazando los nombres exactos:

1. **`assets/images/foto-1.jpg`**
   - **Sección:** Después de la introducción.
   - **Tipo de Foto:** Uno de sus **primeros recuerdos juntos** o de los primeros días saliendo.
2. **`assets/images/foto-2.jpg`**
   - **Sección:** Después de hablar sobre el tiempo juntos.
   - **Tipo de Foto:** Un **momento especial**, una salida o viaje donde la hayan pasado muy bien.
3. **`assets/images/foto-3.jpg`**
   - **Sección:** En medio de la carta de disculpas y sentimientos sinceros.
   - **Tipo de Foto:** Una **fotografía emotiva**, tierna o un abrazo sincero.
4. **`assets/images/foto-4.jpg`**
   - **Sección:** Cerca del final del mensaje principal.
   - **Tipo de Foto:** Un **recuerdo reciente** que represente su relación hoy en día.
5. **`assets/images/foto-5.jpg`**
   - **Sección:** Antes del cierre final.
   - **Tipo de Foto:** Una **foto especial de ambos** donde salgan sonriendo o juntos de forma única.

*Nota:* Si dejas la imagen con formato `.jpg` o `.png`, asegúrate de actualizar la extensión en `index.html` si es diferente. Si aún no colocas una foto, la página mostrará un elegante recuadro decorativo indicando dónde irá la imagen sin romper el diseño.

---

## ⏱️ 2. Guía para cambiar la Fecha de Inicio del Contador

Abre el archivo `script.js` en cualquier editor de texto y busca las primeras líneas:

```javascript
// FECHA DE INICIO DE LA RELACIÓN
const relationshipStartDate = "2023-05-08T00:00:00";
```

Reemplaza `"2023-05-08T00:00:00"` por la fecha real en la que iniciaron su relación (Año-Mes-Día).
* Ejemplo: Si empezaron el 15 de mayo de 2023, pon: `"2023-05-15T00:00:00"`.

El contador en vivo calculará automáticamente los días, horas, minutos y segundos transcurridos desde ese momento.

---

## 🎵 3. Guía para agregar "Nuestra Canción"

1. Consigue el archivo de audio de su canción en formato **MP3**.
2. Renombra el archivo como **`nuestra-cancion.mp3`**.
3. Guárdalo dentro de la carpeta **`assets/music/`**.
4. Al abrir la página, aparecerá un reproductor flotante en la esquina superior derecha donde tu novia podrá presionar **Play** para escuchar la canción mientras lee.

---

## 🚀 4. Guía para Subir a GitHub Pages

1. **Crear repositorio en GitHub:**
   - Ve a [GitHub](https://github.com) e inicia sesión.
   - Haz clic en **New Repository** (Nuevo Repositorio).
   - Nómbralo por ejemplo: `nuestro-aniversario` o `para-mi-amor`.
   - Marca la opción **Public** (Público).
   - Haz clic en **Create repository**.

2. **Subir los archivos:**
   - En la página de tu repositorio, haz clic en **"uploading an existing file"** (Subir un archivo existente).
   - Arrastra toda la carpeta con todos los archivos (`index.html`, `style.css`, `script.js`, y la carpeta `assets`).
   - Haz clic en **Commit changes**.

3. **Activar GitHub Pages:**
   - Dentro de tu repositorio, ve a la pestaña **Settings** (Configuración) en el menú superior.
   - En el menú izquierdo, busca la sección **Pages**.
   - En **Build and deployment** -> **Source**, selecciona `Deploy from a branch`.
   - En **Branch**, selecciona `main` (o `master`) y la carpeta `/ (root)`.
   - Haz clic en **Save**.

4. **¡Listo!**
   - En 1 o 2 minutos, GitHub te dará un enlace público como:
     `https://tu-usuario.github.io/nuestro-aniversario/`
   - ¡Copia ese enlace y envíaselo con un bonito mensaje! ❤️
