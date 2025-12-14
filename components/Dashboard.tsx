
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PropertyForm } from './PropertyForm';
import { Home, Plus, Trash2, Edit, LogOut, Loader } from 'lucide-react';
import { PROPERTY_TYPES_MAP } from '../utils/translations';

interface DashboardProps {
    onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingProperty, setEditingProperty] = useState<any>(null);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProperties = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Dashboard Fetch Error:", error);
        }

        if (!error && data) {
            setProperties(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProperties();
    }, []);

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

    return (
        <div className="animate-fade-in min-h-screen bg-gray-50 pb-20">
            <div className="bg-slate-900 text-white py-8 mb-8 sticky top-0 z-30 shadow-md">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Home size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Panel de Agentes</h1>
                            <p className="text-slate-400 text-xs">Gestión de Inventario</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Nueva Propiedad</span>
                        </button>
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
                {showForm && (
                    <PropertyForm
                        onClose={handleCloseForm}
                        onSuccess={fetchProperties}
                        initialData={editingProperty}
                    />
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-indigo-600" size={32} />
                    </div>
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((prop) => (
                            <div key={prop.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition">
                                <div className="relative h-48">
                                    <img src={prop.image_url || 'https://via.placeholder.com/400'} alt={prop.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={() => handleEdit(prop)}
                                            className="bg-white p-2 rounded-full shadow-md hover:text-indigo-600"
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

                                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded">
                                        {PROPERTY_TYPES_MAP[prop.type] || prop.type}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-slate-900 truncate">{prop.title}</h3>
                                    <p className="text-slate-500 text-sm mb-3 truncate">{prop.location}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-indigo-600">${Number(prop.price).toLocaleString()}</span>
                                        <div className="text-xs text-slate-400">
                                            {prop.beds} hab • {prop.sqft} m²
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Home size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Sin propiedades</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            Aún no has agregado ninguna propiedad. ¡Comienza ahora!
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                        >
                            + Crear primera propiedad
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
