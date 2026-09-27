export interface profileInterface {
  name: string;
  email: string;
  role: string;
}

export interface profileFullInterface {
  user: profileInterface;
  serverTime: string;
}

export interface profileStateInterface {
  profile: profileFullInterface;
  setProfile: (profile: profileFullInterface) => void;
}

export interface loadingStateInterface {
  loading: boolean;
  setLoading: (value: boolean) => void;
}
