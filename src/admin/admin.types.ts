interface PaginatedList<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

type JwtResult = {
  jwtData: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export type {
  PaginatedList,
  JwtResult,
};