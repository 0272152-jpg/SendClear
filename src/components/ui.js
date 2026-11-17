import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReducedMotion } from '../feedback';
import { colors, formatDate, formatMXN, radius, shadow, space, springs, type } from '../theme';

// Screen shell: safe area + keyboard avoidance, so the main button is never hidden by the keyboard.
// topInset: true on screens without a navigation header (sign-in).
export function Screen({ children, scroll = true, dark = false, topInset = false }) {
  const bg = dark ? colors.navy : colors.bg;
  const edges = topInset ? ['top', 'bottom', 'left', 'right'] : ['bottom', 'left', 'right'];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={edges}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.screen}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.screen, { flex: 1 }]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Feedback on touch-DOWN, not on release: the element shrinks slightly the instant it is pressed,
// with a critically damped spring so a quick tap can reverse it mid-way without a jump.
export function PressableScale({ children, style, onPress, disabled, accessibilityLabel, accessibilityRole = 'button' }) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v) => Animated.spring(scale, { toValue: v, ...springs.press }).start();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => !reduced && to(0.97)}
      onPressOut={() => !reduced && to(1)}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={6}
    >
      {({ pressed }) => (
        <Animated.View style={[style, { transform: [{ scale }] }, reduced && pressed && { opacity: 0.7 }]}>
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false }) {
  const palette = {
    primary: { bg: colors.gold, fg: colors.navy },
    navy: { bg: colors.navy, fg: colors.white },
    ghost: { bg: 'transparent', fg: colors.navy },
  }[variant];
  const off = disabled || loading;
  return (
    <PressableScale
      onPress={onPress}
      disabled={off}
      accessibilityLabel={title}
      style={[
        styles.btn,
        { backgroundColor: palette.bg },
        variant === 'ghost' && { borderWidth: 1, borderColor: colors.border },
        disabled && !loading && { opacity: 0.45 },
      ]}
    >
      {loading ? <ActivityIndicator color={palette.fg} /> : <Text style={[type.headline, { color: palette.fg }]}>{title}</Text>}
    </PressableScale>
  );
}

// Text field with a visible focus ring, so it is always clear where you are typing.
export function Field({ label, dark = false, hint, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: space.l }}>
      <Text style={[styles.label, dark && { color: colors.goldSoft }]}>{label}</Text>
      <TextInput
        placeholderTextColor={dark ? '#8C9BB5' : colors.muted}
        autoCapitalize="none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          dark && { backgroundColor: colors.navySoft, color: colors.white, borderColor: colors.navyLine },
          focused && { borderColor: colors.focus, borderWidth: 2 },
          style,
        ]}
        {...props}
      />
      {hint ? <Text style={[styles.hint, dark && { color: '#8C9BB5' }]}>{hint}</Text> : null}
    </View>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return (
    <FadeIn>
      <Text style={styles.error} accessibilityLiveRegion="polite" accessibilityRole="alert">
        {children}
      </Text>
    </FadeIn>
  );
}

// Every screen that shows money carries this label: nothing here is real money.
export function SimulatedBadge({ text = 'SIMULATED · demo money, no real funds move', onDark = false }) {
  return (
    <View style={[styles.badge, onDark && { backgroundColor: 'rgba(201,162,39,0.16)' }]}>
      <View style={styles.badgeDot} />
      <Text style={[type.caption, { color: onDark ? colors.goldSoft : colors.navy }]}>{text}</Text>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// Appears with a short critically damped spring (no bounce): it rises 8 px while fading in.
// With Reduce Motion on, it only fades.
export function FadeIn({ children, style }) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(reduced ? 0 : 8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(y, { toValue: 0, ...springs.ui }),
    ]).start();
  }, [opacity, y]);
  return <Animated.View style={[style, { opacity, transform: [{ translateY: y }] }]}>{children}</Animated.View>;
}

export function TxRow({ tx, onPress, last }) {
  const sent = tx.direction === 'sent';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${sent ? 'Sent to' : 'Received from'} ${tx.counterpartyName}, ${formatMXN(tx.total)}`}
      style={({ pressed }) => [styles.txRow, pressed && { backgroundColor: colors.bg }]}
    >
      <View style={[styles.avatar, { backgroundColor: sent ? colors.navy : colors.goldSoft }]}>
        <Text style={{ color: sent ? colors.gold : colors.navy, fontWeight: '800', fontSize: 16 }}>{sent ? '↑' : '↓'}</Text>
      </View>
      <View style={[styles.txBody, !last && styles.txDivider]}>
        <View style={{ flex: 1 }}>
          <Text style={[type.headline, { color: colors.text }]} numberOfLines={1}>
            {tx.counterpartyName}
          </Text>
          <Text style={[type.footnote, { color: colors.muted, marginTop: 2 }]} numberOfLines={1}>
            {tx.note ? `${tx.note} · ` : ''}
            {formatDate(tx.createdAt)}
          </Text>
        </View>
        <Text style={[type.headline, type.money, { color: sent ? colors.text : colors.success, marginLeft: space.s }]}>
          {sent ? '−' : '+'}
          {formatMXN(tx.total)}
        </Text>
      </View>
    </Pressable>
  );
}

// One label/value line, used on the Confirm and Receipt screens.
export function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[type.body, { color: colors.muted }]}>{label}</Text>
      <Text
        style={[type.body, type.money, { color: colors.text, fontWeight: bold ? '700' : '500', flexShrink: 1, textAlign: 'right', marginLeft: space.m }]}
      >
        {value}
      </Text>
    </View>
  );
}

// Four PIN boxes over a hidden input. shakeKey changes on a wrong PIN: the boxes shake
// sideways, the way a wrong passcode does on iPhone. With Reduce Motion on, they only turn red.
export function PinInput({ value, onChange, shakeKey, error }) {
  const reduced = useReducedMotion();
  const input = useRef(null);
  const x = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!shakeKey || reduced) return;
    Animated.sequence(
      [12, -10, 7, -4, 0].map((v) => Animated.timing(x, { toValue: v, duration: 55, useNativeDriver: true }))
    ).start();
  }, [shakeKey, reduced, x]);

  return (
    <Pressable
      onPress={() => input.current?.focus()}
      accessibilityLabel={`PIN, ${value.length} of 4 digits entered`}
      style={{ paddingVertical: space.s }}
    >
      <Animated.View style={[styles.pinRow, { transform: [{ translateX: x }] }]}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.pinBox,
              focused && i === Math.min(value.length, 3) && { borderColor: colors.focus, borderWidth: 2 },
              error && { borderColor: colors.danger },
            ]}
          >
            {i < value.length && <View style={styles.pinDot} />}
          </View>
        ))}
      </Animated.View>
      <TextInput
        ref={input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 4))}
        keyboardType="number-pad"
        maxLength={4}
        autoFocus
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        caretHidden
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  screen: { padding: space.xl, paddingBottom: 40 },
  btn: { height: 54, borderRadius: radius.control, alignItems: 'center', justifyContent: 'center', marginTop: space.s },
  label: { ...type.footnote, color: colors.muted, marginBottom: 6, fontWeight: '600' },
  hint: { ...type.footnote, color: colors.muted, marginTop: 6 },
  input: {
    height: 52,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: space.l,
    fontSize: 17,
    color: colors.text,
  },
  error: { ...type.footnote, color: colors.danger, marginVertical: space.s, fontWeight: '600' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.goldSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: space.m,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold, marginRight: 6 },
  card: { backgroundColor: colors.card, borderRadius: radius.card, padding: space.l, marginBottom: space.l, ...shadow },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.xs, borderRadius: 12 },
  txBody: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: space.m, marginLeft: space.m },
  txDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 },
  pinRow: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  pinBox: {
    width: 54,
    height: 62,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.navy },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
