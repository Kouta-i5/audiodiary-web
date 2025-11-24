import axios from 'axios';

// 認証関連のAPI関数

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserSchema {
  user_id: number;
  username: string;
  email: string;
  created_at?: string;
  is_active?: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// axiosインスタンスの作成
const authApi = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ユーザー登録
export const registerUser = async (data: RegisterRequest): Promise<UserSchema> => {
  try {
    const response = await authApi.post('/auth/register', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || '登録に失敗しました');
    }
    throw new Error('登録に失敗しました');
  }
};

// ユーザーログイン
export const loginUser = async (data: LoginRequest): Promise<Token> => {
  try {
    // OAuth2PasswordRequestFormの形式に合わせる
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const response = await authApi.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'ログインに失敗しました');
    }
    throw new Error('ログインに失敗しました');
  }
};

// 現在のユーザー情報を取得
export const getCurrentUser = async (): Promise<UserSchema> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('トークンがありません');
    }

    console.log('APIリクエスト送信:', {
      url: '/auth/me',
      token: `${token.substring(0, 20)}...`,
      headers: { 'Authorization': `Bearer ${token.substring(0, 20)}...` }
    });

    const response = await authApi.get('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('APIエラー詳細:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.detail || 'ユーザー情報の取得に失敗しました');
    }
    throw new Error('ユーザー情報の取得に失敗しました');
  }
};

// トークンをローカルストレージに保存
export const saveToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

// トークンをローカルストレージから取得
export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// トークンをローカルストレージから削除
export const removeToken = (): void => {
  localStorage.removeItem('access_token');
};

// ログイン状態をチェック
export const isLoggedIn = (): boolean => {
  return !!getToken();
};

// ログアウト
export const logoutUser = async (): Promise<void> => {
  try {
    const token = getToken();
    if (token) {
      await authApi.post('/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    // ログアウトエラーは無視（フロントエンド側でトークンを削除する）
    console.warn('ログアウトAPIエラー:', error);
  } finally {
    // フロントエンド側でトークンを削除
    removeToken();
  }
};
