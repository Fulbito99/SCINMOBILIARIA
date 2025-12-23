
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Mail, Loader } from 'lucide-react';

interface LoginProps {
    onLoginSuccess: () => void;
    onCancel: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onCancel }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Check Env Vars
            const url = import.meta.env.VITE_SUPABASE_URL;
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

            // Create a timeout promise to prevent infinite hangs
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT_CONNECTION: La conexión a Supabase tardó demasiado')), 10000);
            });

            // Race the login against the timeout
            const loginPromise = supabase.auth.signInWithPassword({
                email,
                password,
            });

            const result: any = await Promise.race([loginPromise, timeoutPromise]);
            const { error, data } = result;

            if (error) throw error;

            onLoginSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Acceso Agentes</h2>
                    <p className="text-slate-500 mt-2">Inicie sesión para gestionar propiedades</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-gray-50 focus:bg-white"
                                placeholder="agente@sc-inmobiliaria.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                Verificando...
                            </>
                        ) : (
                            'Ingresar al Panel'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full text-slate-500 py-2 text-sm font-medium hover:text-slate-900 transition"
                    >
                        Volver al inicio
                    </button>
                </form>


            </div>
        </div>
    );

};
