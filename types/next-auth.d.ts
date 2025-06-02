import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user']; //keeps existing properties like name and email
  }

  interface User extends DefaultUser {
    id: string; // Adds id to the User type returned by authorize
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string; // Adds id to the JWT token
  }
}
