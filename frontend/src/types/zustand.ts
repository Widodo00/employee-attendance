export interface profileInterface {
  name: string;
  role: string;
}

export interface profileStateInterface {
  profile: profileInterface;
  setProfile: (profile: profileInterface) => void;
}

export interface loadingStateInterface {
  loading: boolean;
  setLoading: (value: boolean) => void;
}
