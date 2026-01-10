import { supabase } from './supabaseClient';

export const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return {
        token: data.session?.access_token,
        user: data.user
    };
};

export const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return {
        token: data.session?.access_token,
        user: data.user
    };
};

export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
