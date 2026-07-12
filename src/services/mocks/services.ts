import { UserSession, Part, Offer } from '../../types';

export const supabaseMock = {
  getUser: (): UserSession | null => {
    try {
      const saved = localStorage.getItem('parts_peddle_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  },

  signIn: (email: string, password?: string): { error: string | null; session: UserSession | null } => {
    if (!email.includes('@')) {
      return { error: 'Invalid email address', session: null };
    }
    const session: UserSession = {
      id: 'mock-user-id',
      email,
      jwt: 'mock-sb-jwt-token-123',
      aud: 'authenticated',
      role: 'authenticated'
    };
    localStorage.setItem('parts_peddle_user', JSON.stringify(session));
    return { error: null, session };
  },

  signUp: (email: string, password?: string): { error: string | null; session: UserSession | null } => {
    if (!email.includes('@')) {
      return { error: 'Please enter a valid email address', session: null };
    }
    const session: UserSession = {
      id: 'mock-user-id',
      email,
      jwt: 'mock-sb-jwt-token-created',
      aud: 'authenticated',
      role: 'authenticated'
    };
    localStorage.setItem('parts_peddle_user', JSON.stringify(session));
    return { error: null, session };
  },

  signOut: () => {
    localStorage.removeItem('parts_peddle_user');
  }
};

export const cartMock = {
  getCart: (): any[] => {
    try {
      const saved = localStorage.getItem('parts_peddle_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  setCart: (items: any[]): void => {
    localStorage.setItem('parts_peddle_cart', JSON.stringify(items));
  },

  addToCart: (part: Part): any[] => {
    const cart = cartMock.getCart();
    const existingIndex = cart.findIndex((item) => item.part.id === part.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ part, quantity: 1 });
    }
    cartMock.setCart(cart);
    return cart;
  },

  removeFromCart: (partId: string): any[] => {
    let cart = cartMock.getCart();
    cart = cart.filter((item) => item.part.id !== partId);
    cartMock.setCart(cart);
    return cart;
  },

  clearCart: (): void => {
    localStorage.removeItem('parts_peddle_cart');
  }
};
