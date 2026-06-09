import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createProduct, updateProduct, listCategories } from '../services/products';

export default function ProductFormScreen({ route, navigation }) {
  // Se product vier nos params → modo edição; caso contrário → modo criação
  const { product } = route.params ?? {};
  const isEditing = !!product;

  const [title, setTitle] = useState(product?.title ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price ? String(product.price) : '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [stock, setStock] = useState(product?.stock ? String(product.stock) : '');
  const [categories, setCategories] = useState([]);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);

  // ── Carrega categorias para o picker ────────────────────────────────────────
  useEffect(() => {
    async function fetchCategories() {
      setLoadingCats(true);
      try {
        const data = await listCategories();
        setCategories(data);
      } catch {
        // falha silenciosa; usuário pode digitar manualmente
      } finally {
        setLoadingCats(false);
      }
    }
    fetchCategories();
  }, []);

  // ── Validação ────────────────────────────────────────────────────────────────
  function validate() {
    if (!title.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o título do produto.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Campo obrigatório', 'Informe a descrição do produto.');
      return false;
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Valor inválido', 'Informe um preço válido (maior que zero).');
      return false;
    }
    if (!category.trim()) {
      Alert.alert('Campo obrigatório', 'Selecione ou informe uma categoria.');
      return false;
    }
    if (!stock.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
      Alert.alert('Valor inválido', 'Informe uma quantidade de estoque válida (≥ 0).');
      return false;
    }
    return true;
  }

  // ── Envio do formulário ──────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      stock: Number(stock),
    };

    setLoading(true);
    try {
      if (isEditing) {
        await updateProduct(product.id, payload);
        Alert.alert('Sucesso! ✅', 'Produto atualizado com sucesso.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createProduct(payload);
        Alert.alert('Sucesso! ✅', 'Produto cadastrado com sucesso.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert(
        'Erro ao salvar',
        err.message || 'Não foi possível salvar o produto. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>
            {isEditing ? '✏️  Editar produto' : '➕  Novo produto'}
          </Text>
          <Text style={styles.pageSubtitle}>
            {isEditing
              ? 'Altere os campos desejados e salve.'
              : 'Preencha os dados para adicionar ao catálogo.'}
          </Text>
        </View>

        {/* ── Campos ──────────────────────────────────────────────────────── */}
        <View style={styles.card}>

          {/* Título */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Tênis Nike Air Max"
              placeholderTextColor="#475569"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
              maxLength={100}
            />
          </View>

          {/* Descrição */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva o produto em detalhes..."
              placeholderTextColor="#475569"
              value={description}
              onChangeText={setDescription}
              editable={!loading}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Preço */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Preço (USD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#475569"
              value={price}
              onChangeText={setPrice}
              editable={!loading}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Categoria */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Categoria *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowCatPicker((v) => !v)}
              disabled={loading}
            >
              <Text style={category ? styles.inputText : styles.inputPlaceholder}>
                {category || (loadingCats ? 'Carregando categorias...' : 'Selecionar categoria')}
              </Text>
            </TouchableOpacity>

            {/* Picker inline de categorias */}
            {showCatPicker && (
              <View style={styles.catPicker}>
                <ScrollView nestedScrollEnabled style={styles.catPickerScroll}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catOption,
                        category === cat && styles.catOptionActive,
                      ]}
                      onPress={() => {
                        setCategory(cat);
                        setShowCatPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.catOptionText,
                          category === cat && styles.catOptionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Campo manual caso queira digitar */}
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              placeholder="Ou digite uma categoria manualmente"
              placeholderTextColor="#475569"
              value={category}
              onChangeText={setCategory}
              editable={!loading}
              autoCapitalize="none"
            />
          </View>

          {/* Estoque */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Estoque *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#475569"
              value={stock}
              onChangeText={setStock}
              editable={!loading}
              keyboardType="number-pad"
            />
          </View>

        </View>

        {/* ── Botões de ação ──────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scroll: {
    padding: 20,
    paddingBottom: 48,
  },
  pageHeader: {
    marginBottom: 20,
    marginTop: 8,
  },
  pageTitle: {
    color: '#E2E8F0',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
    gap: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#E2E8F0',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  inputText: {
    color: '#E2E8F0',
    fontSize: 15,
  },
  inputPlaceholder: {
    color: '#475569',
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    color: '#475569',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  catPicker: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 6,
    maxHeight: 180,
    overflow: 'hidden',
  },
  catPickerScroll: {
    flex: 1,
  },
  catOption: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  catOptionActive: {
    backgroundColor: '#312E81',
  },
  catOptionText: {
    color: '#94A3B8',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  catOptionTextActive: {
    color: '#A5B4FC',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cancelBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
});
