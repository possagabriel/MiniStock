# 📦 MiniStock Mobile

> Aplicativo mobile para gestão de estoque em tempo real — React Native + Expo + axios

---

## 📋 Descrição

O **MiniStock Mobile** é um aplicativo desenvolvido em React Native com Expo para a disciplina de **Programação para Dispositivos Móveis**. Ele permite que colaboradores de depósito consultem, cadastrem, editem e removam produtos do catálogo diretamente do celular, consumindo a API pública [DummyJSON](https://dummyjson.com) por meio da biblioteca **axios**.

---

## 🛠 Stack tecnológica

| Tecnologia | Finalidade |
|---|---|
| React Native + Expo (blank) | Framework mobile |
| axios | Todas as requisições HTTP (sem uso de `fetch`) |
| React Navigation (native-stack) | Navegação entre telas |
| AsyncStorage | Persistência do token de autenticação |
| JavaScript (ES2022+) | Linguagem de desenvolvimento |

---

## 🏗 Estrutura de pastas

```
ministock/
├── App.js                        # Raiz do app — navegação + AuthProvider
├── app.json
├── package.json
└── src/
    ├── services/
    │   ├── api.js                # Instância única axios + interceptors
    │   ├── auth.js               # Serviço de autenticação
    │   └── products.js           # CRUD de produtos
    ├── contexts/
    │   └── AuthContext.js        # Contexto global de autenticação
    ├── screens/
    │   ├── LoginScreen.js        # Tela de login
    │   ├── ProductListScreen.js  # Listagem, busca, filtro por categoria
    │   ├── ProductDetailScreen.js# Detalhes, editar e excluir
    │   └── ProductFormScreen.js  # Formulário criação/edição (reutilizável)
    └── components/
        ├── ProductCard.js        # Card de produto na listagem
        ├── Loading.js            # Indicador de carregamento
        └── EmptyState.js         # Estado vazio genérico
```

---

## 🔑 Credenciais de teste

```
Usuário: emilys
Senha:   emilyspass
```

---

## ⚙️ Instalação e execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) ≥ 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/) instalado globalmente  
  ```bash
  npm install -g expo-cli
  ```
- Expo Go no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) **ou** emulador Android/iOS configurado

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/possagabriel/MiniStock.git
cd ministock-mobile

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npx expo start
```

Escaneie o QR code exibido no terminal com o **Expo Go** ou pressione:
- `a` — abrir no emulador Android
- `i` — abrir no simulador iOS

---

## 🚀 Funcionalidades implementadas

### 🔐 Autenticação
- Login com validação de campos obrigatórios
- Token JWT persistido com **AsyncStorage**
- Sessão restaurada automaticamente na próxima abertura do app
- Logout com confirmação via `Alert`

### 📋 Listagem de produtos
- **FlatList** com paginação infinita (`onEndReached`)
- **Pull to refresh** com `RefreshControl`
- Barra de busca textual com **debounce** de 500 ms
- Filtros de categoria carregados dinamicamente via API
- Contador de resultados
- Estado vazio e estado de erro com botão de retry

### 🔍 Detalhes do produto
- Imagem, título, descrição, preço, estoque, marca, SKU, avaliação
- Botão de **editar** → navega para formulário pré-preenchido
- Botão de **excluir** com diálogo de confirmação (`Alert.alert`)

### 📝 Formulário (criação e edição)
- **Mesmo componente** reutilizado para criar e editar (identificado pela presença do param `product`)
- Picker inline de categorias + campo manual
- Validação de todos os campos antes do envio
- Indicador de loading durante o envio

---

## 🔧 Detalhes técnicos do axios

### Instância única (`src/services/api.js`)
```js
export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
});
```

### Interceptor de requisição
Injeta automaticamente o token do AsyncStorage em todas as chamadas autenticadas via header `Authorization: Bearer <token>`.

### Interceptor de resposta
Trata centralizadamente:
- **401** → limpa AsyncStorage e redireciona ao login
- **404** → rejeita com *"Recurso não encontrado."*
- **5xx** → rejeita com *"Erro no servidor, tente novamente."*
- **Timeout / sem rede** → rejeita com *"Sem conexão, tente novamente."*

### Camada de serviços
Nenhuma tela contém chamadas `api.get/post/put/delete` diretamente. Toda comunicação HTTP passa pelos arquivos em `src/services/`.

### Query strings via `params`
```js
// ✅ Correto
api.get('/products', { params: { limit: 10, skip } });

// ❌ Proibido
api.get(`/products?limit=10&skip=${skip}`);
```

---

## 📱 Capturas de tela

> *(Adicione capturas de tela aqui após rodar o projeto no dispositivo ou emulador)*

| Login | Listagem | Detalhes | Formulário |
|-------|----------|----------|------------|
| ![login](./assets/screenshots/login.png) | ![list](./assets/screenshots/list.png) | ![detail](./assets/screenshots/detail.png) | ![form](./assets/screenshots/form.png) |

---

## 🎬 Vídeo demonstrativo

> 🔗 [Assista ao vídeo demonstrativo aqui](#) *(substitua pelo link público)*

O vídeo cobre o fluxo completo: **login → listagem → busca → filtro por categoria → detalhes → edição → exclusão → logout**.

---

## 📚 Referências

- [Documentação axios](https://axios-http.com/docs/intro)
- [DummyJSON API](https://dummyjson.com/docs)
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/docs/usage)

---

*Projeto avaliativo — Programação para Dispositivos Móveis — UNIPAC Barbacena*
