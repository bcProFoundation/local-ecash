import { AuthDataValidator, objectToAuthDataMap } from '@telegram-auth/server';
import _ from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export type User = {
  id: string;
  name: string;
  image: string;
};

declare module 'next-auth' {
  interface Session {
    user: User;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'telegram-login',
      name: 'Telegram Login',
      credentials: {},
      async authorize(credentials, req) {
        const validator = new AuthDataValidator({
          botToken: `${process.env.BOT_TOKEN}`
        });

        const data = objectToAuthDataMap(req.query || {});
        const user = await validator.validate(data);

        const fullname = !_.isEmpty(user.last_name) ? [user.first_name, user.last_name].join(' ') : user.first_name;
        const username = !_.isEmpty(user.username) ? `@${user.username}` : fullname;

        if (user.id && user.first_name) {
          return {
            id: user.id.toString(),
            name: username,
            image: user.photo_url
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub as string;
        session.user.image = token.picture as string;
      }

      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
        token.picture = user.image;
      }

      return token;
    }
  },
  session: {
    strategy: 'jwt'
  }
};

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Do whatever you want here, before the request is passed down to `NextAuth`
  return await NextAuth(req, res, authOptions);
}
