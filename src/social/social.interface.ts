export type ISocialProvider = 'kakao' | 'naver';

export interface IOauthToken {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

export interface ISocialUserInfo {
  id: string | number;
  username: string;
}

export interface IKakaoUserInfo {
  id: number;
  kakao_account: {
    profile: {
      nickname: string;
    };
  };
  properties: {
    nickname: string;
  };
}

export interface INaverUserInfo {
  response: {
    id: string;
    nickname: string;
  };
}
