import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Loading from './src/components/Loading';

import LoginScreen from './src/screens/LoginScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ProductFormScreen from './src/screens/ProductFormScreen';

const Stack = createNativeStackNavigator();

// ─── Navegação interna — decide qual stack montar ─────────────────────────────
function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading message="Restaurando sessão..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#E2E8F0',
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#0F172A' },
        animation: 'slide_from_right',
      }}
    >
      {isAuthenticated ? (
        // ── Rotas autenticadas ───────────────────────────────────────────────
        <>
          <Stack.Screen
            name="ProductList"
            component={ProductListScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: 'Detalhes do produto' }}
          />
          <Stack.Screen
            name="ProductForm"
            component={ProductFormScreen}
            options={({ route }) => ({
              title: route.params?.product ? 'Editar produto' : 'Novo produto',
            })}
          />
        </>
      ) : (
        // ── Rota pública ─────────────────────────────────────────────────────
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

// ─── Raiz do app ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
