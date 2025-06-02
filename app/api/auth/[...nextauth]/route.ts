import NextAuth, { AuthOptions, SessionStrategy } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import bcrypt from 'bcrypt';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // a little validation logic to check missing User Credentials
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        //make a connection to the database
        await dbConnect();

        // Find the user by email
        const user = await User.findOne({ email: credentials.email }).select(
          '+password',
        );

        if (!user) {
          throw new Error('User not found');
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isMatch) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    // This callback is invoked when a JWT is created (e.g sign-in)
    async jwt({ token, user }) {
      // Add user id to the token when user signs in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // This callback is invoked when a session is accessed e.g.(getServerSession or useSession)
    async session({ session, token }) {
      // Add user id to the session when the user signs in
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // enables errors to only be thrown on dev mode
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
