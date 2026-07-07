import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  type: 'alert' | 'confirm' | 'prompt';
  message: string;
  defaultValue?: string;
  value: string;
  setValue: (val: string) => void;
  resolve: (value: any) => void;
  show: (type: 'alert' | 'confirm' | 'prompt', message: string, defaultValue?: string) => Promise<any>;
  close: (result: any) => void;
}

export const useCustomModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  type: 'alert',
  message: '',
  defaultValue: '',
  value: '',
  setValue: (value) => set({ value }),
  resolve: () => {},
  show: (type, message, defaultValue = '') => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        type,
        message,
        defaultValue,
        value: defaultValue,
        resolve
      });
    });
  },
  close: (result) => {
    const { resolve } = get();
    set({ isOpen: false });
    resolve(result);
  }
}));

export const customAlert = (message: string) => useCustomModalStore.getState().show('alert', message);
export const customConfirm = (message: string) => useCustomModalStore.getState().show('confirm', message);
export const customPrompt = (message: string, defaultValue?: string) => useCustomModalStore.getState().show('prompt', message, defaultValue);
