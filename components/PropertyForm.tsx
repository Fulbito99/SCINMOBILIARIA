
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { X, Save, Image as ImageIcon, Loader } from 'lucide-react';
import { Property } from '../types';

interface PropertyFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ onClose, onSuccess, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        price: initialData?.price?.toString() || '',
        currency: initialData?.currency || 'EUR',
        location: initialData?.location || '',
        beds: initialData?.beds?.toString() || '',
        baths: initialData?.baths?.toString() || '',
        sqft: initialData?.sqft?.toString() || '',
        type: initialData?.type || 'House',
        description: initialData?.description || '',
        image_url: initialData?.image_url || 'https://picsum.photos/800/600?random=' + Math.floor(Math.random() * 100),
        features: initialData?.features?.join(', ') || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Usuario no autenticado');

            const propertyData = {
                user_id: user.id,
                title: formData.title,
                price: Number(formData.price),
                currency: formData.currency,
                location: formData.location,
                beds: Number(formData.beds),
                baths: Number(formData.baths),
                sqft: Number(formData.sqft),
                type: formData.type,
                description: formData.description,
                image_url: formData.image_url,
                features: formData.features.split(',').map(f => f.trim()).filter(f => f !== '')
            };

            let error;

            if (initialData?.id) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('properties')
                    .update(propertyData)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                // Create new
                const { error: insertError } = await supabase
                    .from('properties')
                    .insert([propertyData]);
                error = insertError;
            }

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving property:', error);
            alert(`Error al guardar: ${error.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-900">
                        {initialData ? 'Editar Propiedad' : 'Nueva Propiedad'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Título de la Propiedad</label>
                            <input
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Ej: Villa Moderna en la Costa"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="House">Casa</option>
                                <option value="Apartment">Apartamento</option>
                                <option value="Villa">Villa</option>
                                <option value="Condo">Condominio</option>
                                <option value="Land">Terreno</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Ubicación</label>
                            <input
                                name="location"
                                required
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Madrid, España"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Precio & Moneda</label>
                            <div className="flex gap-2">
                                <input
                                    name="price"
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="450000"
                                />
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-32 px-2 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                >
                                    <option value="EUR">€ (EUR)</option>
                                    <option value="USD">$ (USD)</option>
                                    <option value="ARS">$ (ARS)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 col-span-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Habitaciones</label>
                                <input
                                    name="beds"
                                    type="number"
                                    value={formData.beds}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Baños</label>
                                <input
                                    name="baths"
                                    type="number"
                                    step="0.5"
                                    value={formData.baths}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Superficie (m²)</label>
                                <input
                                    name="sqft"
                                    type="number"
                                    value={formData.sqft}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Descripción detallada de la propiedad..."
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Características (separadas por coma)</label>
                            <input
                                name="features"
                                value={formData.features}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Piscina, Jardín, Garaje..."
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">URL Imagen (Temporal)</label>
                            <div className="flex gap-2">
                                <input
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">* Por ahora usamos una URL. Más adelante implementaremos subida de imágenes.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-gray-100 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                            Guardar Propiedad
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
