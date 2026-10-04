// config.js — Constantes de negocio de MaquetaGo
// Ajusta aquí tarifas, recargos y límites sin tocar la lógica de la app.

const MG_CONFIG = {
  // ── Tarifas base ─────────────────────────────────────────────────────────
  TARIFA_CARPOOL: 28,           // S/ por estudiante
  TARIFA_VAN_EXCLUSIVA: 45,    // S/ viaje completo

  // ── Anclaje volumétrico ───────────────────────────────────────────────────
  ANCLAJE_NORMAL: 7,           // S/ cuando vol ≤ límite
  ANCLAJE_GRANDE: 15,          // S/ cuando vol > límite

  // ── Seguro por fragilidad ─────────────────────────────────────────────────
  SEGURO_STANDARD: 3,
  SEGURO_HIGH: 5,
  SEGURO_EXTREME: 9,

  // ── Adicional isotérmico ──────────────────────────────────────────────────
  ADICIONAL_ISOTERMICO: 12,

  // ── Recargo Express (Reserva inmediata) ───────────────────────────────────
  RECARGO_EXPRESS: 10,          // S/ adicional visible en el resumen

  // ── Límites de carpool (cm y kg) ─────────────────────────────────────────
  CARPOOL_MAX_LARGO: 80,
  CARPOOL_MAX_ANCHO: 60,
  CARPOOL_MAX_ALTO: 50,
  CARPOOL_MAX_PASAJEROS: 3,
  PESO_CARGA_MANUAL_KG: 15,    // > este valor → alerta dos operarios

  // ── Garantías por modalidad ───────────────────────────────────────────────
  GARANTIA_CARPOOL: 1200,      // S/ cobertura de sustentación
  GARANTIA_EXCLUSIVA: 1800,    // S/ cobertura ampliada

  // ── Ventana de recojo carpool (minutos) ───────────────────────────────────
  VENTANA_RECOJO_MIN: 20,

  // ── Escalas que fuerzan Van Exclusiva ─────────────────────────────────────
  ESCALAS_VAN_EXCLUSIVA: ['1:1000', 'personalizada'],

  // ── Dimensión que fuerza Van Exclusiva (cm, cualquier eje) ───────────────
  DIM_MAX_CARPOOL: 100,
};
