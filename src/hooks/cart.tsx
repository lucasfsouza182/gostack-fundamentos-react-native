import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@cart');
      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let cart: Product[] = [];

      if (products.find(p => p.id === product.id)) {
        cart = products.map(p => {
          if (p.id === product.id) {
            p.quantity += 1;
          }
          return p;
        });
      } else {
        cart = [...products, { ...product, quantity: 1 }];
      }
      setProducts(cart);
      await AsyncStorage.setItem('@cart', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const cart = products.map(p => {
        if (p.id === id) {
          p.quantity += 1;
        }

        return p;
      });
      setProducts(cart);
      await AsyncStorage.setItem('@cart', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const cart = products.map(p => {
        if (p.id === id) {
          p.quantity -= 1;
        }

        return p;
      });
      setProducts(cart);
      await AsyncStorage.setItem('@cart', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
