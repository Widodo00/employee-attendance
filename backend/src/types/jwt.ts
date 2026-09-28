export interface jwtInterface {
  sub: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export interface jwtFullInterface {
  user: jwtInterface;
}
