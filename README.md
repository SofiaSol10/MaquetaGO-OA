# MaquetaGo - Prototipo Navegable

Este proyecto es un prototipo interactivo (sin backend) para probar el flujo de usuario de MaquetaGo.

## Instrucciones para ejecutar
1. Puedes abrir `index.html` directamente haciendo doble clic, o usar un servidor local (ej. `npx serve .` o `python -m http.server`).

## Flujo Implementado y Probado
1. **Landing (Inicio):**
   - Interactúa con el "Simulador de Ruta FAU" para estimar precios.
   - Navegación activa y botón de Ingreso de Estudiantes (Abre un modal).
   - "Apartar Mi Cupo" navega a `reservar.html`.
2. **Reserva:**
   - La pantalla calcula precios en tiempo real según escala, dimensiones y opción de exclusividad (una validación cambia a "Van Exclusiva" si se excede el tamaño máximo en Carpool).
   - "Confirmar Solicitud" lanza un modal animado y redirige al Seguimiento.
3. **Seguimiento (`seguimiento.html`):**
   - Muestra una simulación de estados del viaje en tiempo real. 
   - El botón "Acelerar Simulación" avanza al final y solicita una calificación.
4. **Mis Viajes (`mis-viajes.html`):**
   - Muestra todas las reservas (guardadas en `localStorage`).
   - Permite Cancelar el viaje.
5. **Feedback & Admin (`admin.html`):**
   - El botón flotante de 💬 "Opinar" (disponible globalmente) recoge feedback.
   - `admin.html` lista todos los comentarios y permite exportar a CSV o limpiar la base de datos de pruebas (vaciar `localStorage`).

## Datos ficticios en localStorage:
- **`mg_user`**: Almacena el usuario simulado (`{ nombre, email }`).
- **`mg_trips`**: Lista de objetos de reservas confirmadas y/o canceladas.
- **`mg_feedbacks`**: Historial de opiniones recolectadas en el botón de chat (nota 1-5, uso futuro y comentario).
