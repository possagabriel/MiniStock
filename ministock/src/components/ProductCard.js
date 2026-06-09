import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProductCard({ product, onPress }) {
  const discount = product.discountPercentage
    ? Math.round(product.discountPercentage)
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{ uri: product.thumbnail }}
        style={styles.image}
        resizeMode="cover"
      />
      {discount ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>-{discount}%</Text>
        </View>
      ) : null}
      <View style={styles.info}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>
            ${Number(product.price).toFixed(2)}
          </Text>
          <View style={[styles.stockBadge, product.stock < 10 && styles.stockLow]}>
            <Text style={styles.stockText}>
              {product.stock < 10 ? '⚠ ' : ''}Estoque: {product.stock}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
  },
  image: {
    width: 100,
    height: 100,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#6366F1',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  category: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  price: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '800',
  },
  stockBadge: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stockLow: {
    backgroundColor: '#7F1D1D',
  },
  stockText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
});
