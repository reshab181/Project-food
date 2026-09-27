import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, type as t } from '../theme';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

const DURATION     = 3200;
const ANIMATION_MS = 220;

// Muted, palette-aligned variant colours
const variantConfig = {
  success: { bg: '#2E5438', dot: palette.accent },
  error:   { bg: '#6B2020', dot: palette.error  },
  info:    { bg: '#3A3530', dot: palette.textSoft },
} as const;

interface ToastItemProps {
  item: ToastMessage;
  onDismiss: (id: number) => void;
}

const ToastItem = ({ item, onDismiss }: ToastItemProps) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-6)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: ANIMATION_MS, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: ANIMATION_MS, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => dismiss(), DURATION);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 0, duration: ANIMATION_MS, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -6, duration: ANIMATION_MS, useNativeDriver: true }),
    ]).start(() => onDismiss(item.id));
  };

  const { bg, dot } = variantConfig[item.variant];

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bg, opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
      <Pressable onPress={dismiss} hitSlop={10}>
        <Text style={styles.close}>✕</Text>
      </Pressable>
    </Animated.View>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast]);
  const error   = useCallback((msg: string) => toast(msg, 'error'),   [toast]);
  const info    = useCallback((msg: string) => toast(msg, 'info'),    [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((item) => (
          <ToastItem key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 52,
    left: 20,
    right: 20,
    zIndex: 9999,
    gap: 8,
    ...(Platform.OS === 'web' ? ({ pointerEvents: 'box-none' } as object) : {}),
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  message: {
    ...t.body,
    color: 'rgba(255,255,255,0.90)',
    flex: 1,
  },
  close: {
    ...t.caption,
    color: 'rgba(255,255,255,0.45)',
  },
});
