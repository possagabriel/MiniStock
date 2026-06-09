import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  listProducts,
  searchProducts,
  listCategories,
  listByCategory,
} from '../services/products';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

const PAGE_SIZE = 10;

export default function ProductListScreen({ navigation }) {
  const { logout, user } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);

  const searchTimeout = useRef(null);

  // ── Carrega categorias uma única vez ─────────────────────────────────────────
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await listCategories();
        setCategories(data);
      } catch {
        // não bloqueia a listagem principal se categorias falharem
      }
    }
    fetchCategories();
  }, []);

  // ── Carrega (ou recarrega) a lista do zero ───────────────────────────────────
  const fetchProducts = useCallback(
    async ({ showLoader = true, isRefresh = false } = {}) => {
      if (showLoader) setLoading(true);
      setError(null);
      try {
        let result;
        if (searchQuery.trim()) {
          result = await searchProducts(searchQuery.trim(), { limit: PAGE_SIZE, skip: 0 });
        } else if (selectedCategory) {
          result = await listByCategory(selectedCategory, { limit: PAGE_SIZE, skip: 0 });
        } else {
          result = await listProducts({ limit: PAGE_SIZE, skip: 0 });
        }
        setProducts(result.products);
        setTotal(result.total);
        setSkip(PAGE_SIZE);
      } catch (err) {
        setError(err.message || 'Erro ao carregar produtos.');
      } finally {
        setLoading(false);
        if (isRefresh) setRefreshing(false);
      }
    },
    [searchQuery, selectedCategory]
  );

  // Recarrega sempre que a tela ganhar foco (ex: voltando de cadastro/edição)
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  // ── Busca com debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // ── Paginação infinita ───────────────────────────────────────────────────────
  async function handleLoadMore() {
    if (loadingMore || products.length >= total) return;
    setLoadingMore(true);
    try {
      let result;
      if (searchQuery.trim()) {
        result = await searchProducts(searchQuery.trim(), { limit: PAGE_SIZE, skip });
      } else if (selectedCategory) {
        result = await listByCategory(selectedCategory, { limit: PAGE_SIZE, skip });
      } else {
        result = await listProducts({ limit: PAGE_SIZE, skip });
      }
      setProducts((prev) => [...prev, ...result.products]);
      setSkip((prev) => prev + PAGE_SIZE);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Não foi possível carregar mais produtos.');
    } finally {
      setLoadingMore(false);
    }
  }

  // ── Pull to refresh ──────────────────────────────────────────────────────────
  function handleRefresh() {
    setRefreshing(true);
    fetchProducts({ showLoader: false, isRefresh: true });
  }

  // ── Filtro por categoria ─────────────────────────────────────────────────────
  function handleCategorySelect(cat) {
    setSelectedCategory(cat === selectedCategory ? null : cat);
    setSearchQuery('');
  }

  // ── Logout com confirmação ───────────────────────────────────────────────────
  function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  // ── Renderização do item da lista ────────────────────────────────────────────
  function renderItem({ item }) {
    return (
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      />
    );
  }

  function renderFooter() {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#6366F1" size="small" />
        <Text style={styles.footerText}>Carregando mais...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>MiniStock</Text>
          <Text style={styles.headerSub}>
            Olá, {user?.firstName ?? 'usuário'} 👋
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* ── Barra de busca ─────────────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Buscar produto..."
          placeholderTextColor="#475569"
          value={searchQuery}
          onChangeText={(t) => {
            setSearchQuery(t);
            setSelectedCategory(null);
          }}
        />
      </View>

      {/* ── Filtros de categoria ────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.slice(0, 20).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                selectedCategory === cat && styles.catChipActive,
              ]}
              onPress={() => handleCategorySelect(cat)}
            >
              <Text
                style={[
                  styles.catChipText,
                  selectedCategory === cat && styles.catChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Contador de resultados ──────────────────────────────────────────── */}
      {!loading && (
        <Text style={styles.resultCount}>
          {total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
        </Text>
      )}

      {/* ── Lista ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchProducts()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="Nenhum produto encontrado"
              subtitle="Tente buscar por outro termo ou limpar os filtros."
            />
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#6366F1"
              colors={['#6366F1']}
            />
          }
        />
      )}

      {/* ── FAB — novo produto ─────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm', { product: null })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#0F172A',
  },
  headerTitle: {
    color: '#E2E8F0',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSub: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 13,
  },
  searchRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#E2E8F0',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryList: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  catChip: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  catChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  catChipTextActive: {
    color: '#fff',
  },
  resultCount: {
    color: '#475569',
    fontSize: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorText: {
    color: '#F87171',
    fontSize: 15,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    color: '#64748B',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 34,
  },
});
