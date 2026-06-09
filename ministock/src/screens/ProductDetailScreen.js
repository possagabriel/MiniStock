import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getProduct, deleteProduct } from '../services/products';

export default function ProductDetailScreen({ route, navigation }) {
  // Pode receber o produto via parâmetro (da lista) ou buscar pelo id
  const { product: initialProduct } = route.params;

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Recarrega os detalhes atualizados do produto ao montar a tela
  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProduct(initialProduct.id);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Erro ao carregar detalhes.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [initialProduct.id]);

  // ── Exclusão com confirmação ─────────────────────────────────────────────────
  function handleDelete() {
    Alert.alert(
      'Excluir produto',
      `Tem certeza que deseja excluir "${product.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteProduct(product.id);
              Alert.alert('Sucesso', 'Produto excluído com sucesso.', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (err) {
              Alert.alert('Erro', err.message || 'Não foi possível excluir o produto.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerLoader}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rating = product.rating ? Number(product.rating).toFixed(1) : '—';

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* ── Imagem principal ─────────────────────────────────────────────── */}
      <Image
        source={{ uri: product.thumbnail }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
      <View style={styles.content}>
        {/* Categoria + Avaliação */}
        <View style={styles.metaRow}>
          <View style={styles.catBadge}>
            <Text style={styles.catText}>{product.category}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {rating}</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>{product.title}</Text>

        {/* Preço */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>
          {product.discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -{Math.round(product.discountPercentage)}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* Descrição */}
        <Text style={styles.sectionLabel}>Descrição</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* Estatísticas */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{product.stock}</Text>
            <Text style={styles.statLabel}>Estoque</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{product.brand ?? '—'}</Text>
            <Text style={styles.statLabel}>Marca</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{product.sku ?? '—'}</Text>
            <Text style={styles.statLabel}>SKU</Text>
          </View>
        </View>

        {/* ── Ações ──────────────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('ProductForm', { product })}
            activeOpacity={0.85}
          >
            <Text style={styles.editBtnText}>✏️  Editar produto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteBtn, deleting && styles.deleteBtnDisabled]}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.85}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.deleteBtnText}>🗑️  Excluir produto</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  image: {
    width: '100%',
    height: 280,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  catBadge: {
    backgroundColor: '#312E81',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  catText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  ratingBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ratingText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#E2E8F0',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  price: {
    color: '#34D399',
    fontSize: 32,
    fontWeight: '900',
  },
  discountBadge: {
    backgroundColor: '#064E3B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  description: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    gap: 12,
  },
  editBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#7F1D1D',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#991B1B',
  },
  deleteBtnDisabled: {
    opacity: 0.6,
  },
  deleteBtnText: {
    color: '#FCA5A5',
    fontSize: 16,
    fontWeight: '700',
  },
  centerLoader: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorText: {
    color: '#F87171',
    fontSize: 15,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 8,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: {
    color: '#94A3B8',
    fontWeight: '700',
  },
});
