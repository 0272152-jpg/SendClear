// Design tokens: navy + gold palette, type scale, spacing, motion.
export const colors = {
  navy: '#0B1F3A',
  navySoft: '#16305A',
  navyLine: '#24406B',
  gold: '#C9A227',
  goldBright: '#E0BC4A',
  goldSoft: '#F4E7BE',
  bg: '#F2F3F7',
  card: '#FFFFFF',
  text: '#0B1F3A',
  muted: '#6B7280',
  border: '#E3E6EC',
  focus: '#C9A227',
  success: '#1F8A5B',
  danger: '#B42318',
  white: '#FFFFFF',
};

// Type scale. Tracking is size-specific: big text gets negative tracking,
// small labels get slightly positive tracking. Line height tightens as size grows.
// System font everywhere (San Francisco on iOS, Roboto on Android).
export const type = {
  display: { fontSize: 44, lineHeight: 50, fontWeight: '800', letterSpacing: -1.2, fontVariant: ['tabular-nums'] },
  largeTitle: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.7 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.35 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  caption: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.6 },
  money: { fontVariant: ['tabular-nums'] },
};

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 28 };
export const radius = { control: 14, card: 20, pill: 999 };

export const shadow = {
  shadowColor: '#0B1F3A',
  shadowOpacity: 0.07,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};

// Springs written as Apple's "damping ratio + response", converted to
// React Native's stiffness/damping: stiffness = (2π / response)², damping = 2·ratio·√stiffness.
function spring(response, dampingRatio = 1) {
  const stiffness = Math.pow((2 * Math.PI) / response, 2);
  return { stiffness, damping: 2 * dampingRatio * Math.sqrt(stiffness), mass: 1, useNativeDriver: true };
}
export const springs = {
  press: spring(0.2), // button press: fast, no bounce
  ui: spring(0.4), // things appearing: critically damped, no overshoot
};

// 123456 centavos -> "MXN 1,234.56"
export function formatMXN(centavos) {
  const sign = centavos < 0 ? '-' : '';
  const [int, dec] = (Math.abs(centavos) / 100).toFixed(2).split('.');
  return `${sign}MXN ${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${dec}`;
}

// 123456 -> "1,234.56" (no currency prefix, for big amounts shown next to a small "MXN")
export function formatAmount(centavos) {
  return formatMXN(centavos).replace(/^(-?)MXN /, '$1');
}

// "1,234.5" -> 123450 centavos, or NaN if not a valid amount.
export function parseMXN(text) {
  const clean = String(text || '').replace(/,/g, '').trim();
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return NaN;
  return Math.round(parseFloat(clean) * 100);
}

export function formatDate(iso) {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${hh}:${mm}`;
}
