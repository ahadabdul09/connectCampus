import { create } from 'zustand';
import { authService } from '../services/authService.js';
import { socketService } from '../services/socket.js';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('connectcampus_user') || 'null'),
  accessToken: localStorage.getItem('connectcampus_access_token'),
  refreshToken: localStorage.getItem('connectcampus_refresh_token'),
  isAuthenticated: !!localStorage.getItem('connectcampus_access_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('connectcampus_access_token', data.accessToken);
      localStorage.setItem('connectcampus_refresh_token', data.refreshToken);
      localStorage.setItem('connectcampus_user', JSON.stringify(data.user));

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      socketService.connect();
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(formData);
      localStorage.setItem('connectcampus_access_token', data.accessToken);
      localStorage.setItem('connectcampus_refresh_token', data.refreshToken);
      localStorage.setItem('connectcampus_user', JSON.stringify(data.user));

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      socketService.connect();
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  acceptInvite: async (inviteData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.acceptInvite(inviteData);
      localStorage.setItem('connectcampus_access_token', data.accessToken);
      localStorage.setItem('connectcampus_refresh_token', data.refreshToken);
      localStorage.setItem('connectcampus_user', JSON.stringify(data.user));

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      socketService.connect();
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Invitation acceptance failed.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try {
      const refreshToken = get().refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {});
      }
    } finally {
      localStorage.removeItem('connectcampus_access_token');
      localStorage.removeItem('connectcampus_refresh_token');
      localStorage.removeItem('connectcampus_user');

      socketService.disconnect();

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  fetchProfile: async () => {
    try {
      const user = await authService.getMe();
      localStorage.setItem('connectcampus_user', JSON.stringify(user));
      set({ user });
      return user;
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const updated = await authService.updateProfile(data);
      localStorage.setItem('connectcampus_user', JSON.stringify(updated));
      set({ user: updated, isLoading: false });
      return updated;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
}));
