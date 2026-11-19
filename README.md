# Sapiens.IA · sitio web

Sitio de una página que integra el scrolltelling **«La unión toma nombre»** y, después, las secciones Comité, Objetivos, Equipo, Actividad y Recursos. No requiere instalación ni compilación.

## Abrir en local

Desde esta carpeta, iniciar un servidor estático con `python -m http.server 8000` y abrir `http://localhost:8000/`. Los archivos del scroll, los logos, las fuentes, los videos y la resolución están dentro de `sitio-web/`; no dependen de Fal en tiempo de ejecución.

## Contenido y fuentes

- La apertura muestra juntas a la UDA y la IA desde el primer fotograma; después vienen la fusión, Sapiens.IA y la frase de cierre. Los objetivos se presentan fuera del scroll. Se retiraron el contador y la barra de avance.
- La barra de navegación permanece disponible durante el relato con la marca UDA; la marca gráfica de Sapiens.IA se incorpora a la barra al terminar el scroll para respetar su aparición en la historia.
- Los objetivos y la lista de 15 representantes se basan en la [Resolución Exenta N.º 210/2026](assets/docs/resolucion-210-2026.pdf). Los textos de objetivos son síntesis para lectura web; el documento oficial queda disponible para contraste.
- Las cinco fotografías de la representación institucional, seis retratos de facultades, centros y sede, y los dos videos de actividad provienen del respaldo local. Tres retratos adicionales provienen de perfiles públicos de la [Universidad de Atacama](https://uda.cl/): Jonathan Abello, Nancy Mac Cann y Patricio Porcile. El perfil público de Matías Maureira no incluye fotografía; su tarjeta indica que está pendiente, sin atribuirle la imagen de otra persona.
- El marco normativo y las futuras guías se identifican como **en preparación**. No se anuncian como publicados.

## Archivos principales

- `index.html`: contenido y navegación.
- `site.css` y `site.js`: diseño y menú adaptable.
- `story.css` y `story.js`: scrolltelling y soporte de movimiento reducido.
- `assets/story/`: imágenes WebP y dos MP4 locales generados previamente con Fal que se usan en esta versión. La transición inicial original se conserva como archivo fuente, pero no se reproduce.

## Técnica de transición

Se revisó la guía pública [scroll-animation-skill](https://github.com/gabros20/scroll-animation-skill) para sincronización de video con scroll. El avance actual usa una sola línea de tiempo ligada directamente al desplazamiento, muestra imágenes fijas mientras el video busca el fotograma y mantiene un recorrido alternativo sin movimiento para quien lo solicite en el sistema.

Las imágenes PNG originales de Fal se conservan en `../recursos-sitio/imagenes/storytelling-opcion-5/fal-originales/`.

## Revisión pendiente antes de publicar

Confirmar editorialmente la vigencia de la nómina y los cargos, y probar el diseño completo en navegador de escritorio y móvil. En este entorno la vista del servidor local y `file://` no estuvo disponible; se validaron sintaxis, integridad de archivos y fuentes documentales. El sitio es una entrega local, sin despliegue público.
