# SendClear: guion del pitch (7 minutos, demo incluida)

**Presenta:** Rafael Galicia Figeroa (solo).
Las slides tienen poco texto a propósito: Rafael dice los números y la slide los muestra. En cada slide hay **un solo elemento dorado**, y ese es el número que el público debe recordar.

Antes de empezar:
- Celular con Expo Go abierto en SendClear, sesión cerrada, brillo al máximo.
- El Excel `SendClear_Financial_Model.xlsx` abierto en la laptop.
- El video de respaldo de la demo listo.

| Tiempo | Slide | Idea en una frase |
|---|---|---|
| 0:00–0:20 | 1 Portada | Qué es SendClear |
| 0:20–0:55 | 2 Problema | Pagarle a un amigo sigue siendo molesto |
| 0:55–3:40 | 3 Demo | El flujo completo en vivo |
| 3:40–4:10 | 4 Mercado | 3.0M personas podrían pagar |
| 4:10–4:40 | 5 Modelo | 5 transferencias al mes deciden todo |
| 4:40–5:00 | 6 Go-to-market | Referidos en universidades, CAC de 120 |
| 5:00–5:25 | 7 Regulación | Guardamos dinero, así que somos IFPE |
| 5:25–5:45 | 8 P&L | Punto de equilibrio en el año 4, necesitamos 19.6M |
| 5:45–6:10 | 9 Valuación | Defendemos de 43 a 51M |
| 6:10–6:40 | 10 El ask | 10M en un SAFE, 18.9% |
| 6:40–7:00 | 11 Equipo | Cómo la construí |

---

**1 · Portada**
"Soy Rafael Galicia Figeroa y esto es SendClear: mandas dinero con un número de celular y ves la comisión antes de pagar."

**2 · Problema** *(señala las tres tarjetas, de izquierda a derecha)*
"Pagarle a un amigo todavía es molesto: le pides 18 dígitos de CLABE, ves la comisión hasta el final y no te queda un comprobante para compartir. Hablé con [N] personas y [X]% me dijo que [hallazgo]."
> TODO: llenar con entrevistas reales antes de presentar (INTERVIEWS.md).

**3 · Demo en vivo** *(Rafael maneja el celular y narra; máximo 2:45)*
1. "Entro con Ana, una cuenta de prueba."
2. "Este es su saldo. La etiqueta dorada SIMULATED significa que es dinero de demo."
3. "Le mando 250 pesos a Carla. Pongo su número, aparece su nombre y la comisión sale en vivo: 2.50."
4. "En Review veo el total antes de pagar. Primero pongo un PIN incorrecto: tiembla y no se mueve dinero. Ahora el correcto."
5. "Comprobante con folio."
6. "Y en el historial, Ana solo ve sus propias transferencias. Hay un test automático que lo prueba."
> Si falla la conexión: "Les muestro el video", y pon el respaldo.

**4 · Mercado** *(recorre las barras de arriba hacia abajo y termina en la dorada)*
"De 87 millones de adultos, 55 millones tienen cuenta, 38 millones mueven dinero desde una app, 15 millones son jóvenes, y 3 millones pagarían por dividir gastos. Hoy usan SPEI, DiMo, Mercado Pago o efectivo. El riesgo principal es DiMo: desde el 14 de diciembre será gratis en todos los bancos."

**5 · Modelo** *(primero las seis tarjetas blancas y al final la dorada)*
"Quien envía paga 1%, con tope de 15 pesos. Eso da un ARPU de 30 pesos al mes, 63% de margen, un LTV de 456 contra un CAC de 135 (3.4 veces), y recuperamos el CAC en 7 meses. Pero el número que decide todo es este: 5 transferencias por usuario al mes. Si bajan a 4, la valuación cae 12.6 millones."

**6 · Go-to-market**
"El primer canal son referidos en universidades de CDMX: invitas a un amigo, hace su primera transferencia y ganas 50 pesos. De 10 mil visitas salen 2,500 registros y mil usuarios activos, con un CAC de 120 pesos. Son supuestos y los voy a medir con un piloto de una semana."

**7 · Regulación** *(izquierda: regulatorio; derecha: legal)*
"Guardamos dinero de clientes, no prestamos y no pagamos rendimientos. Eso nos hace una IFPE. Empezamos con un socio que ya tiene licencia, y en el año 3 sacamos la nuestra: 500 mil UDIs de capital, unos 4.5 millones de pesos, y entre 12 y 24 meses de trámite. Del lado legal: una S.A.P.I. de C.V., aviso de privacidad, y la comisión visible antes de pagar."

**8 · P&L**
"Alcanzamos el punto de equilibrio en el año 4 y llegamos a 138 millones de ingresos en el año 5. Antes de eso necesitamos 19.6 millones."

**9 · Valuación**
"Usé tres métodos. El método VC da 42.8 millones, el Scorecard 50.9 y el DCF 4.4, que tomo como piso porque descuenta al 40% y solo ve 5 años. Defiendo de 43 a 51 millones. Lo que más mueve la valuación son las transferencias por usuario."

**10 · El ask** *(la tarjeta dorada primero)*
"Levanto 10 millones de pesos, unos 532 mil dólares, en un SAFE a 43 millones pre-money. Cedo 18.9%. El dinero va 44% a equipo, 36% a adquisición, 15% al socio y compliance, y 6% a tecnología. Alcanza para 22 meses. Después viene una Serie A para la licencia propia."

**11 · Equipo**
"Construí SendClear con ayuda de una herramienta de IA, pero revisé cada archivo y la puedo cambiar en vivo. Tiene 13 tests automáticos. Gracias."

---

## Preguntas probables y respuestas

**"DiMo ya es gratis. ¿Por qué alguien pagaría 1%?"**
"Es mi mayor riesgo y lo voy a validar en el piloto. Si la gente no paga por la claridad y el comprobante, cambio quién paga: transferencias gratis entre personas, y cobro a quien organiza gastos en grupo o a pequeños comercios. La app es la misma." (Eso implicaría rehacer el Excel; no lo presentes como algo ya construido.)

**"¿De dónde sale el 1.20 por transferencia?"**
Excel → Assumptions → "SPEI / partner processing fee". Es un supuesto marcado TODO-verify.

**"¿Por qué el DCF da tan poco?"**
Descuenta al 40%, solo ve 5 años y los años 1 a 3 tienen pérdidas. Casi todo el valor está después del año 5, por eso lo uso como piso.

**"¿Cómo garantizas que un usuario no ve datos de otro?"**
Cada lectura en `src/core/ledger.js` filtra por el `userId` de la sesión. Los tests CROSS-USER de `npm test` lo prueban.

**"Cámbiale algo en vivo."**
- Comisión: `FEE_RATE` / `FEE_CAP` en `src/core/ledger.js`.
- Colores: `src/theme.js`.
- Límite por transferencia: `MAX_TRANSFER`.
Al guardar, la app se recarga sola en Expo Go.

**"¿Por qué una IFPE y no un banco o una SOFIPO?"**
Porque no presto ni pago rendimientos. Solo guardo un saldo que se puede retirar en pesos, y eso es dinero electrónico.

**"¿Por qué un SAFE?"**
Es rápido y barato de firmar, y deja la negociación del precio para la Serie A. El tope de valuación protege al inversionista.

**"¿Qué está simulado?"**
Los saldos, la transferencia SPEI, el cobro de la comisión y el KYC. Todo lleva la etiqueta en pantalla y está listado en el README.
