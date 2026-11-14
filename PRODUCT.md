# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas que exploran Fusagasugá desde el teléfono o el computador y necesitan descubrir lugares, elegir actividades y abrir una ficha práctica antes de visitarlos.

## Product Purpose

FusaTour es una guía turística digital de Fusagasugá. Permite recorrer sus monumentos, murales y espacios de ecoturismo con información cultural, imágenes, actividades relacionadas y ubicación.

## Positioning

Combina el catálogo local de lugares con relatos y recursos visuales que sitúan cada destino en la cultura de Fusagasugá, en lugar de ser un directorio turístico genérico.

## Operating Context

La experiencia se consulta durante la planeación de una salida o ya estando en la ciudad. La navegación debe funcionar como una aplicación web estática y conservar los datos en JSON locales.

## Capabilities and Constraints

- Navegación pública: inicio, categorías, ranking, actividades, detalle de destino y escáner QR.
- Búsqueda, filtros, galería, mapa embebido, compartir y controles de lectura.
- Tema claro/oscuro y preferencias persistentes mediante almacenamiento local del navegador.
- Sin servidor, autenticación, perfiles, favoritos, reseñas, administración ni base de datos remota.
- Datos y recursos proceden del repositorio Laravel original y se sirven desde `public`.

## Brand Commitments

Debe conservar el nombre FusaTour, el contenido turístico real de Fusagasugá y una voz cercana, clara y culturalmente respetuosa.

## Evidence on Hand

- 19 destinos, 3 categorías y 10 actividades en `public/data/fusatour`.
- Fotografías e ilustraciones reales en el repositorio Laravel original, bajo `public/images`.
- Vistas, rutas y comportamientos de referencia en `FusaTour/resources/views` y `routes/web.php`.

## Product Principles

- Hacer que cada lugar se pueda reconocer y explorar antes de visitarlo.
- Ofrecer decisiones rápidas sin reducir la riqueza cultural del contenido.
- Priorizar una experiencia móvil cómoda, accesible y funcional sin conexión al backend.
- Mantener las preferencias del visitante bajo su control en el dispositivo.

## Accessibility & Inclusion

Controles con nombre accesible, foco visible, contraste suficiente, tamaños de lectura ajustables y una interfaz adaptable para pantallas pequeñas.
