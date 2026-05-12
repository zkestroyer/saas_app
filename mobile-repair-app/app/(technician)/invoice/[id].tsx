import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Typography } from '../../../src/theme';
import { GlassView } from '../../../src/components/ui/glass-view';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { HapticPress } from '../../../src/components/ui/haptic-press';
import { InvoiceItemType } from '../../../src/types';

interface LineItem {
  id: string;
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unitPrice: number;
}

const INITIAL_ITEMS: LineItem[] = [
  { id: '1', type: InvoiceItemType.PART, description: 'OEM Screen Assembly', quantity: 1, unitPrice: 120 },
  { id: '2', type: InvoiceItemType.LABOR, description: 'Repair Labor (1 hr)', quantity: 1, unitPrice: 50 },
  { id: '3', type: InvoiceItemType.DISPATCH, description: 'Home Visit Charge', quantity: 1, unitPrice: 15 },
];

const TYPE_EMOJI: Record<InvoiceItemType, string> = {
  [InvoiceItemType.PART]: '🔩',
  [InvoiceItemType.LABOR]: '🔧',
  [InvoiceItemType.TAX]: '📊',
  [InvoiceItemType.DISPATCH]: '🚗',
};

/** Dynamic invoice builder — CRITICAL: remains editable until payment lock. */
export default function InvoiceBuilder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<LineItem[]>(INITIAL_ITEMS);
  const [isLocked, setIsLocked] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const addItem = useCallback(() => {
    if (!newDesc || !newPrice) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: InvoiceItemType.PART,
        description: newDesc,
        quantity: 1,
        unitPrice: parseFloat(newPrice) || 0,
      },
    ]);
    setNewDesc('');
    setNewPrice('');
  }, [newDesc, newPrice]);

  const removeItem = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const lockInvoice = () => {
    Alert.alert(
      'Lock Invoice',
      'Once locked, the invoice cannot be edited. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock & Send',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsLocked(true);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0A05', '#1A1508']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <HapticPress onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </HapticPress>
          <Text style={[Typography.h3, styles.headerTitle]}>Invoice Builder</Text>
          <View style={[
            styles.lockBadge,
            { backgroundColor: isLocked ? Colors.dangerLight : Colors.successLight },
          ]}>
            <Text style={[Typography.caption, {
              color: isLocked ? Colors.danger : Colors.success,
              fontSize: 10,
            }]}>
              {isLocked ? '🔒 LOCKED' : '✏️ EDITABLE'}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Job Reference */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassView style={styles.refCard} borderColor={`${Colors.technician.primary}33`}>
              <Text style={[Typography.overline, { color: Colors.textMuted }]}>
                JOB #{id}
              </Text>
              <Text style={[Typography.h4, { color: Colors.textPrimary }]}>
                iPhone 15 Pro — Screen Replacement
              </Text>
              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                Customer: Sarah M.
              </Text>
            </GlassView>
          </Animated.View>

          {/* Line Items */}
          <Text style={[Typography.h3, styles.sectionTitle]}>Line Items</Text>

          {items.map((item, i) => (
            <Animated.View
              key={item.id}
              entering={FadeInRight.delay(200 + i * 50).springify()}
              layout={Layout.springify()}
            >
              <GlassView style={styles.lineItem}>
                <View style={styles.lineLeft}>
                  <Text style={styles.lineEmoji}>{TYPE_EMOJI[item.type]}</Text>
                  <View style={styles.lineInfo}>
                    <Text style={[Typography.body, { color: Colors.textPrimary }]}>
                      {item.description}
                    </Text>
                    <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                      {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.lineRight}>
                  <Text style={[Typography.h4, { color: Colors.technician.accent }]}>
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </Text>
                  {!isLocked && (
                    <HapticPress
                      onPress={() => removeItem(item.id)}
                      testID={`remove-item-${item.id}`}
                    >
                      <Text style={styles.removeBtn}>✕</Text>
                    </HapticPress>
                  )}
                </View>
              </GlassView>
            </Animated.View>
          ))}

          {/* Add New Item */}
          {!isLocked && (
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <GlassView style={styles.addSection}>
                <Text style={[Typography.caption, { color: Colors.textSecondary, marginBottom: Spacing.s }]}>
                  ADD NEW ITEM
                </Text>
                <View style={styles.addRow}>
                  <Input
                    placeholder="Description"
                    value={newDesc}
                    onChangeText={setNewDesc}
                    containerStyle={{ flex: 2 }}
                    testID="new-item-desc"
                  />
                  <Input
                    placeholder="Price"
                    value={newPrice}
                    onChangeText={setNewPrice}
                    keyboardType="numeric"
                    containerStyle={{ flex: 1 }}
                    testID="new-item-price"
                  />
                </View>
                <Button
                  label="+ Add Item"
                  variant="secondary"
                  onPress={addItem}
                  fullWidth
                  testID="add-item-btn"
                />
              </GlassView>
            </Animated.View>
          )}

          {/* Totals */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <GlassView style={styles.totals} borderColor={`${Colors.technician.primary}33`}>
              <View style={styles.totalRow}>
                <Text style={[Typography.body, { color: Colors.textSecondary }]}>Subtotal</Text>
                <Text style={[Typography.body, { color: Colors.textPrimary }]}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[Typography.body, { color: Colors.textSecondary }]}>Tax (8%)</Text>
                <Text style={[Typography.body, { color: Colors.textPrimary }]}>${tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={[Typography.h3, { color: Colors.textPrimary }]}>Total</Text>
                <Text style={[Typography.h2, { color: Colors.technician.accent }]}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </GlassView>
          </Animated.View>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomBar}>
          {isLocked ? (
            <Button
              label="✅ Invoice Sent to Customer"
              variant="secondary"
              onPress={() => router.replace('/(technician)')}
              fullWidth
              testID="invoice-done"
            />
          ) : (
            <Button
              label="🔒 Lock & Send Invoice"
              onPress={lockInvoice}
              fullWidth
              testID="lock-invoice"
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: Spacing.m,
  },
  backBtn: { color: Colors.technician.accent, fontSize: 16, fontFamily: 'Inter_500Medium' },
  headerTitle: { color: Colors.textPrimary },
  lockBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  scroll: { paddingHorizontal: Spacing.l },
  refCard: { padding: Spacing.m, marginBottom: Spacing.l },
  sectionTitle: { color: Colors.textPrimary, marginBottom: Spacing.m },
  lineItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: Spacing.m, marginBottom: Spacing.s,
  },
  lineLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m, flex: 1 },
  lineEmoji: { fontSize: 20 },
  lineInfo: { flex: 1 },
  lineRight: { alignItems: 'flex-end', gap: Spacing.xs },
  removeBtn: { color: Colors.danger, fontSize: 16, padding: 4 },
  addSection: { padding: Spacing.m, marginTop: Spacing.m, marginBottom: Spacing.l },
  addRow: { flexDirection: 'row', gap: Spacing.s, marginBottom: Spacing.m },
  totals: { padding: Spacing.l },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: Spacing.xs,
  },
  grandTotal: {
    paddingTop: Spacing.m, marginTop: Spacing.s,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  bottomBar: {
    padding: Spacing.l, paddingBottom: Spacing.xl,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
});
