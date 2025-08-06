import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { createClient } from '@supabase/supabase-js';

// Fonction helper pour créer le client Supabase
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERCE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[NEXTAUTH] Missing Supabase environment variables');
    throw new Error('supabaseKey is required.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[NEXTAUTH] SignIn callback triggered', { 
        provider: account?.provider, 
        email: user.email 
      });
      
      if (account?.provider === 'google') {
        const supabase = createSupabaseClient();
        
        try {
          // Vérifier si un utilisateur existe avec cet email
          const { data: existingUser, error: userError } = await supabase
            .from('User')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (userError && userError.code !== 'PGRST116') {
            console.error('[NEXTAUTH] Error checking existing user:', userError);
            return false;
          }
          
          if (existingUser) {
            console.log('[NEXTAUTH] Existing user found, updating googleId');
            // Utilisateur existe déjà, mettre à jour googleId
            const { error: updateError } = await supabase
              .from('User')
              .update({ 
                googleId: user.id,
                updatedAt: new Date().toISOString()
              })
              .eq('id', existingUser.id);
            
            if (updateError) {
              console.error('[NEXTAUTH] Error updating user with googleId:', updateError);
              return false;
            }
            
            // Mettre à jour l'ID de l'utilisateur pour NextAuth
            user.id = existingUser.id;
            return true;
          } else {
            console.log('[NEXTAUTH] Creating new user with Google account');
            // Créer un nouvel utilisateur
            const { data: newUser, error: createError } = await supabase
              .from('User')
              .insert({
                googleId: user.id,
                email: user.email,
                name: user.name,
                avatar: user.image,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              })
              .select()
              .single();
            
            if (createError) {
              console.error('[NEXTAUTH] Error creating user:', createError);
              return false;
            }
            
            // Mettre à jour l'ID de l'utilisateur pour NextAuth
            user.id = newUser.id;
            return true;
          }
        } catch (error) {
          console.error('[NEXTAUTH] Error in signIn callback:', error);
          return false;
        }
      }
      
      return true;
    },
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST }; 