import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

type Translations = {
    [key in Language]: {
        [key: string]: string;
    };
};

const translations: Translations = {
    es: {
        // Nav
        'nav.home': 'Inicio',
        'nav.properties': 'Propiedades',
        'nav.contact': 'Contacto',
        'nav.agent_login': 'Acceso Agentes',

        // Hero
        'hero.title.prefix': 'Encuentra tu hogar',
        'hero.title.suffix': 'ideal',
        'hero.subtitle': 'Explora nuestra exclusiva colección de casas, apartamentos y villas en las mejores ubicaciones.',
        'hero.cta': 'Ver Propiedades',

        // Feature Section
        'featured.title': 'Propiedades Destacadas',
        'featured.subtitle': 'Una selección exclusiva de nuestras mejores oportunidades.',
        'featured.view_all': 'Ver todas las propiedades',

        // Why Choose Us
        'why.title': '¿Por qué elegir SC Inmobiliaria?',
        'why.point1': 'Experiencia de más de 20 años en el mercado.',
        'why.point2': 'Asesoramiento personalizado de principio a fin.',
        'why.point3': 'Tecnología de vanguardia para encontrar su hogar.',
        'why.point4': 'Red exclusiva de contactos y propiedades off-market.',
        'why.cta': 'Contáctanos hoy',

        // Properties Page
        'properties.title': 'Nuestras Propiedades',
        'properties.subtitle': 'Explore nuestro catálogo completo de inmuebles disponibles para venta y alquiler.',
        'properties.search_placeholder': 'Buscar por ubicación, título...',
        'properties.filter_all': 'Todos',
        'properties.no_results': 'No se encontraron propiedades.',
        'properties.clear_filters': 'Limpiar filtros',

        // Contact Page
        'contact.title': 'Contáctanos',
        'contact.subtitle': 'Estamos aquí para responder a todas sus preguntas.',
        'contact.form_title': 'Envíenos un mensaje',
        'contact.name': 'Nombre',
        'contact.phone': 'Teléfono',
        'contact.message': 'Mensaje',
        'contact.send': 'Enviar Mensaje',
        'contact.info_title': 'Información de Contacto',
        'contact.office': 'Oficina Central',

        // Detail View
        'detail.back': 'Volver',
        'detail.about': 'Sobre esta propiedad',
        'detail.features': 'Características',
        'detail.beds': 'Habitaciones',
        'detail.baths': 'Baños',
        'detail.area': 'Área',
        'detail.price_label': 'Precio de venta',
        'detail.request_visit': 'Solicitar Visita',
        'detail.contact_agent': 'Contactar Agente',
        'detail.chat_help': '¿Tienes preguntas? Usa nuestro chat de IA.',

        // Footer
        'footer.explore': 'Explorar',
        'footer.rights': '© 2024 SC Inmobiliaria. Todos los derechos reservados.',

        // Dashboard
        'dashboard.title': 'Panel de Agentes',
        'dashboard.subtitle': 'Gestión de Inventario',
        'dashboard.new_property': 'Nueva Propiedad',
        'dashboard.no_properties': 'Sin propiedades',
        'dashboard.create_first': 'Crear primera propiedad',
        'dashboard.logout': 'Cerrar Sesión',
        'dashboard.sure_delete': '¿Estás seguro de que quieres eliminar esta propiedad?',

        // Property Types
        'type.House': 'Casa',
        'type.Apartment': 'Departamento',
        'type.Villa': 'Villa',
        'type.Condo': 'Condominio',
        'type.Land': 'Terreno',
    },
    en: {
        // Nav
        'nav.home': 'Home',
        'nav.properties': 'Properties',
        'nav.contact': 'Contact',
        'nav.agent_login': 'Agent Login',

        // Hero
        'hero.title.prefix': 'Find your dream',
        'hero.title.suffix': 'home',
        'hero.subtitle': 'Explore our exclusive collection of houses, apartments, and villas in top locations.',
        'hero.cta': 'View Properties',

        // Feature Section
        'featured.title': 'Featured Properties',
        'featured.subtitle': 'An exclusive selection of our best opportunities.',
        'featured.view_all': 'View all properties',

        // Why Choose Us
        'why.title': 'Why Choose SC Inmobiliaria?',
        'why.point1': 'Over 20 years of market experience.',
        'why.point2': 'Personalized advice from start to finish.',
        'why.point3': 'Cutting-edge technology to find your home.',
        'why.point4': 'Exclusive network of contacts and off-market properties.',
        'why.cta': 'Contact us today',

        // Properties Page
        'properties.title': 'Our Properties',
        'properties.subtitle': 'Explore our complete catalog of properties available for sale and rent.',
        'properties.search_placeholder': 'Search by location, title...',
        'properties.filter_all': 'All',
        'properties.no_results': 'No properties found.',
        'properties.clear_filters': 'Clear filters',

        // Contact Page
        'contact.title': 'Contact Us',
        'contact.subtitle': 'We are here to answer all your questions.',
        'contact.form_title': 'Send us a message',
        'contact.name': 'Name',
        'contact.phone': 'Phone',
        'contact.message': 'Message',
        'contact.send': 'Send Message',
        'contact.info_title': 'Contact Information',
        'contact.office': 'Head Office',

        // Detail View
        'detail.back': 'Back',
        'detail.about': 'About this property',
        'detail.features': 'Features',
        'detail.beds': 'Beds',
        'detail.baths': 'Baths',
        'detail.area': 'Area',
        'detail.price_label': 'Sale Price',
        'detail.request_visit': 'Request Visit',
        'detail.contact_agent': 'Contact Agent',
        'detail.chat_help': 'Questions? Use our AI chat.',

        // Footer
        'footer.explore': 'Explore',
        'footer.rights': '© 2024 SC Inmobiliaria. All rights reserved.',

        // Dashboard
        'dashboard.title': 'Agent Dashboard',
        'dashboard.subtitle': 'Inventory Management',
        'dashboard.new_property': 'New Property',
        'dashboard.no_properties': 'No properties',
        'dashboard.create_first': 'Create first property',
        'dashboard.logout': 'Logout',
        'dashboard.sure_delete': 'Are you sure you want to delete this property?',

        // Property Types
        'type.House': 'House',
        'type.Apartment': 'Apartment',
        'type.Villa': 'Villa',
        'type.Condo': 'Condo',
        'type.Land': 'Land',
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('es');

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
