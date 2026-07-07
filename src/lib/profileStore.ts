import { create } from 'zustand';

export interface UserProfileState {
  photoBase64: string | null;
  personalEmail: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  nextOfKin: string;
  maritalStatus: string;
  stateOfOrigin: string;
  lgaOfOrigin: string;
  gender?: string;
  nextOfKinPhone?: string;
  profileOnlyFields?: Record<string, string>;
}

interface ProfileStore {
  profiles: Record<string, UserProfileState>;
  updateProfile: (userId: string, data: Partial<UserProfileState>) => void;
  getProfile: (userId: string) => UserProfileState;
  calculateCompletion: (userId: string) => number;
}

const defaultProfile: UserProfileState = {
  photoBase64: null,
  personalEmail: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  nextOfKin: '',
  maritalStatus: '',
  stateOfOrigin: '',
  lgaOfOrigin: '',
  gender: '',
  nextOfKinPhone: '',
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profiles: {},
  updateProfile: (userId, data) => {
    set((state) => ({
      profiles: {
        ...state.profiles,
        [userId]: {
          ...(state.profiles[userId] || defaultProfile),
          ...data,
        },
      },
    }));
  },
  getProfile: (userId) => {
    return get().profiles[userId] || defaultProfile;
  },
  calculateCompletion: (userId) => {
    const profile = get().profiles[userId] || defaultProfile;
    const fields = Object.keys(defaultProfile) as (keyof UserProfileState)[];
    const filledFields = fields.filter((key) => {
      const val = profile[key];
      return val !== null && val !== '';
    });
    return Math.round((filledFields.length / fields.length) * 100);
  },
}));
