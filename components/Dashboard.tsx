import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PropertyForm } from './PropertyForm';
import { Home, Plus, Trash2, Edit, LogOut, Loader, Users, Shield } from 'lucide-react';
import { PROPERTY_TYPES_MAP } from '../utils/translations';
import { UserRole, UserProfile } from '../types';

interface DashboardProps {
    onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'properties' | 'agents'>('properties');
    const [showForm, setShowForm] = useState(false);
    const [editingProperty, setEditingProperty] = useState<any>(null);
    const [properties, setProperties] = useState<any[]>([]);
    const [agents, setAgents] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState<UserRole>('agent');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [ownerMap, setOwnerMap] = useState<Record<string, string>>({});
    const [debugError, setDebugError] = useState<string>('');

    const fetchUserRole = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            console.log("Current Auth User:", user);

            if (user) {
                setCurrentUserId(user.id);
                // Debug: Try to fetch profile
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                console.log("Profile Fetch Result:", { data, error });
                if (error) setDebugError(JSON.stringify(error));

                if (data) {
                    setCurrentUserRole(data.role as UserRole);
                }

                // FALLBACK: Force admin for specific email if DB fails
                if (user.email === 'francoaguirre928@gmail.com') {
                    setCurrentUserRole('admin');
                }
            }
        } catch (e) {
            console.error("Error checking role", e);
        }
    };

    const fetchProperties = async () => {
        setLoading(true);
        const { data: props, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error("Properties Error:", error);
        if (props) {
            setProperties(props);

            // If Admin, fetch details of owners
            const userIds = [...new Set(props.map(p => p.user_id).filter(Boolean))];
            if (userIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, email, full_name')
                    .in('id', userIds);

                if (profiles) {
                    const map: Record<string, string> = {};
                    profiles.forEach(p => {
                        map[p.id] = p.full_name || p.email;
                    });
                    setOwnerMap(map);
                }
            }
        }
        setLoading(false);
    };

    const fetchAgents = async () => {
        if (currentUserRole !== 'admin') return;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error("Agents Error:", error);
        if (data) setAgents(data as UserProfile[]);
    };

    useEffect(() => {
        fetchUserRole().then(() => {
            fetchProperties();
        });
    }, []);

    useEffect(() => {
        if (currentUserRole === 'admin' && activeTab === 'agents') {
            fetchAgents();
        }
    }, [currentUserRole, activeTab]);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) return;

        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (error) throw error;
            fetchProperties();
        } catch (error) {
            console.error("Error deleting:", error);
            alert("No se pudo eliminar la propiedad.");
        }
    };

    const handleEdit = (property: any) => {
        setEditingProperty(property);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setEditingProperty(null);
        setShowForm(false);
    };

    const toggleAgentRole = async (agentId: string, currentRole: UserRole) => {
        if (!confirm(`¿Cambiar rol a ${currentRole === 'admin' ? 'Agent' : 'Admin'}?`)) return;

        const newRole = currentRole === 'admin' ? 'agent' : 'admin';
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', agentId);

        if (error) {
            alert("Error actualizando rol: " + error.message);
        } else {
            fetchAgents();
        }
    };

    return (
        <div className="animate-fade-in min-h-screen bg-gray-50 dark:bg-slate-900 pb-20">
            <div className="bg-slate-900 text-white py-8 mb-8 sticky top-0 z-30 shadow-md">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-600 p-2 rounded-lg">
                            <Home size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Panel de Administración</h1>
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                                <Shield size={10} className={currentUserRole === 'admin' ? 'text-green-400' : 'text-gray-400'} />
                                {currentUserRole === 'admin' ? 'Modo Administrador' : 'Modo Agente'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentUserRole === 'admin' && (
                            <div className="flex bg-slate-800 rounded-lg p-1 mr-4">
                                <button
                                    onClick={() => setActiveTab('properties')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'properties' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Propiedades
                                </button>
                                <button
                                    onClick={() => setActiveTab('agents')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'agents' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Agentes
                                </button>
                            </div>
                        )}

                        {activeTab === 'properties' && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">Nueva Propiedad</span>
                            </button>
                        )}

                        <button
                            onClick={onLogout}
                            className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg transition"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {activeTab === 'properties' ? (
                    <>
                        {showForm && (
                            <PropertyForm
                                onClose={handleCloseForm}
                                onSuccess={fetchProperties}
                                initialData={editingProperty}
                            />
                        )}

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader className="animate-spin text-red-600" size={32} />
                            </div>
                        ) : properties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map((prop) => (
                                    <div key={prop.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden group hover:shadow-md transition">
                                        <div className="relative h-48">
                                            <img src={prop.image_url || 'https://via.placeholder.com/400'} alt={prop.title} className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                                <button
                                                    onClick={() => handleEdit(prop)}
                                                    className="bg-white p-2 rounded-full shadow-md hover:text-red-600"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(prop.id)}
                                                    className="bg-white p-2 rounded-full shadow-md text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="absolute bottom-2 left-2 flex gap-1">
                                                <div className="bg-slate-900/80 text-white text-xs px-2 py-1 rounded">
                                                    {PROPERTY_TYPES_MAP[prop.type] || prop.type}
                                                </div>
                                                <div className={`text-white text-xs px-2 py-1 rounded ${prop.listing_type === 'rent' ? 'bg-orange-500/90' : 'bg-emerald-500/90'}`}>
                                                    {prop.listing_type === 'rent' ? 'Alquiler' : 'Venta'}
                                                </div>
                                            </div>
                                            {currentUserRole === 'admin' && prop.user_id && (
                                                <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                                    <Users size={10} />
                                                    {prop.user_id === currentUserId ? 'Mía' : (ownerMap[prop.user_id] || 'Agente')}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white truncate">{prop.title}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 truncate">{prop.location}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-red-600">
                                                    {prop.currency === 'EUR' && '€'}
                                                    {prop.currency === 'USD' && 'U$S'}
                                                    {(prop.currency === 'ARS' || !['EUR', 'USD'].includes(prop.currency)) && '$'}
                                                    {' '}{Number(prop.price).toLocaleString()}
                                                </span>
                                                <div className="text-xs text-slate-400">
                                                    {prop.beds} hab • {prop.sqft} m²
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Home size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sin propiedades</h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                                    Aún no has agregado ninguna propiedad. ¡Comienza ahora!
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition"
                                >
                                    + Crear primera propiedad
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    // AGENTS TAB
                    <div className="animate-fade-in">
                        <div className="mb-6 bg-white dark:bg-slate-800 p-6 rounded-xl border border-blue-100 dark:border-slate-700 shadow-sm flex items-start gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Gestión de Equipo</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    Aquí puedes ver a todos los usuarios registrados. Los nuevos usuarios se registran automáticamente como 'Agentes'.
                                    Solo los Administradores pueden gestionar propiedades (si así lo decides) o gestionar otros usuarios.
                                </p>
                                <p className="text-slate-500 text-sm mt-2 font-medium">
                                    Para agregar un nuevo agente: <span className="text-red-600">Pídeles que se registren en la pantalla de login.</span> Luego aparecerán aquí.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-sm">Usuario</th>
                                        <th className="px-6 py-4 font-semibold text-sm">Email</th>
                                        <th className="px-6 py-4 font-semibold text-sm">Rol</th>
                                        <th className="px-6 py-4 font-semibold text-sm">Fecha Registro</th>
                                        <th className="px-6 py-4 font-semibold text-sm text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {agents.map((agent) => (
                                        <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition bg-white dark:bg-slate-800">
                                            <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                                                        {agent.email.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    {agent.full_name || 'Sin Nombre'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">{agent.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {agent.role === 'admin' ? 'Administrador' : 'Agente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {new Date(agent.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {agent.id !== currentUserId && (
                                                    <button
                                                        onClick={() => toggleAgentRole(agent.id, agent.role)}
                                                        className="text-red-600 hover:text-red-900 text-sm font-medium hover:underline"
                                                    >
                                                        {agent.role === 'admin' ? 'Hacer Agente' : 'Hacer Admin'}
                                                    </button>
                                                )}
                                                {agent.id === currentUserId && (
                                                    <span className="text-gray-400 text-xs italic">Tú</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {agents.length === 0 && !loading && (
                                <div className="p-8 text-center text-slate-500">No hay agentes registrados.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
