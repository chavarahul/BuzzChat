import bcrypt from 'bcrypt';
import NextAuth,{AuthOptions} from 'next-auth';
import  CredentialsProvider  from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import prisma from '@/app/libs/prismadb';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const gitid = process.env.GITHUB_CLIENT_ID;
const gitclient = process.env.GITHUB_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    throw new Error("Google client ID or client secret is not defined");
}

export const authOptions :AuthOptions = {
    adapter:PrismaAdapter(prisma),
    providers:[
        GithubProvider({
            clientId: gitid as string,
            clientSecret:gitclient as string
        }),
        GoogleProvider({
            clientId:clientId,
            clientSecret:clientSecret
        }),
        CredentialsProvider({
         name:'credentials',
         credentials:{
            email:{label:'email',type:'text'},
            password:{label:'password',type:'text'},
         },
         async authorize(credentials){
            if(!credentials?.email || !credentials?.password){
               throw new Error('Invalid Credentials');
            }
            const user = await prisma.user.findUnique({
                where:{
                    email:credentials.email
                }
            })
            if(!user || !user?.hashedPassword){
                throw new Error('Invalid Credentials');
            }
            const isCorrectPassword = await bcrypt.compare(credentials.password,user.hashedPassword);

            if(!isCorrectPassword){
                throw new Error('Invalid Credentials');  
            }
            return user;
         }
        })
    ],
    debug:process.env.NODE_ENV === 'development',
    session:{
        strategy:'jwt',
    },
    secret:process.env.NEXTAUTH_SECRET,

};

const handler = NextAuth(authOptions);

export {handler as POST , handler as GET};