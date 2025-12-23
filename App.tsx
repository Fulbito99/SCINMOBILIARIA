import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './services/supabase';
import { Home, Search, Menu, X, ArrowRight, Phone, Mail, MapPin, User, MessageCircle, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Property } from './types';
import { PROPERTY_TYPES_MAP } from './utils/translations';
import { CONTACT_INFO } from './constants';
import { PropertyCard } from './components/PropertyCard';
import { ChatWidget } from './components/ChatWidget';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

type ViewState = 'home' | 'properties' | 'contact' | 'login' | 'dashboard';

// Moved outside to prevent re-creation on every render
const ContactForm = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola, mi nombre es ${formData.name}. Mi teléfono es ${formData.phone}.\n\nConsulta: ${formData.message}`;
    const whatsappLink = `https://wa.me/5493884362820?text=${encodeURIComponent(text)}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('contact.name')}</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-gray-50 focus:bg-white"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('contact.phone')}</label>
          <input
            type="tel"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-gray-50 focus:bg-white"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">{t('contact.message')}</label>
        <textarea
          rows={5}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-gray-50 focus:bg-white"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        ></textarea>
      </div>
      <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition shadow-lg hover:shadow-red-200">
        {t('contact.send')}
      </button>
    </form>
  );
};

function InnerApp() {
  const { t, language, setLanguage } = useLanguage();

  // Custom Hook for Hash Routing
  const getHashView = (): ViewState => {
    const hash = window.location.hash.replace('#', '');
    if (['home', 'properties', 'contact', 'login', 'dashboard'].includes(hash)) {
      return hash as ViewState;
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState<ViewState>(getHashView());
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedListingType, setSelectedListingType] = useState<'all' | 'sale' | 'rent'>('all');
  const [detailView, setDetailView] = useState<Property | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [simpleLightboxOpen, setSimpleLightboxOpen] = useState(false);
  const [simpleLightboxIndex, setSimpleLightboxIndex] = useState(0);

  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Toggle Component
  const ThemeToggle = () => (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${darkMode ? 'bg-red-600' : 'bg-slate-300'}`}
    >
      <div className={`absolute top-1 left-1 w-5 h-5 rounded-full transform transition-transform duration-300 flex items-center justify-center bg-white shadow-sm ${darkMode ? 'translate-x-7' : 'translate-x-0'}`}>
        {darkMode ? <Moon size={12} className="text-red-600" /> : <Sun size={12} className="text-orange-500" />}
      </div>
    </button>
  );

  const openSimpleLightbox = (index: number) => {
    setSimpleLightboxIndex(index);
    setSimpleLightboxOpen(true);
  };

  // Sync state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(getHashView());
      setDetailView(null); // Clear detail view on navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: ViewState) => {
    window.location.hash = view; // This triggers the useEffect above
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Use email or metadata as fallback, ignoring 'profiles' table to prevent hangs
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Agente';
        setUserName(name);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setMobileMenuOpen(false);
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Agente';
        setUserName(name);
      } else {
        // If logged out, go home and clear name
        if (currentView === 'dashboard') {
          navigateTo('home');
        }
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]); // Added currentView ref dependency if needed, or just []

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        // Map Supabase snake_case to frontend camelCase
        const mappedProps: Property[] = data.map((p: any) => ({
          ...p,
          imageUrl: p.image_url,
          images: p.images, // Array of images
          listing_type: p.listing_type || 'sale',
        }));
        setProperties(mappedProps);
      }
    };
    fetchProperties();
  }, []); // Only fetch once on mount

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesType = selectedType === 'Todos' || p.type === selectedType;
      const matchesListingType = selectedListingType === 'all' || p.listing_type === selectedListingType;
      return matchesSearch && matchesType && matchesListingType;
    });
  }, [debouncedSearchTerm, selectedType, selectedListingType, properties]);

  const uniqueTypes = ['Todos', ...Array.from(new Set(properties.map(p => p.type)))];

  const handlePropertyClick = (property: Property) => {
    setDetailView(property);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // navigateTo('home') handled by onAuthStateChange
  };

  // --- SUB-COMPONENTS ---

  // ContactForm moved outside


  const HeroSection = () => (
    <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40 z-10"></div>
        <img
          src="/hero-bg-custom.png"
          alt="SC Inmobiliaria"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
          Encuentra tu hogar <span className="text-red-500">ideal</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto font-light">
          Explora nuestra exclusiva colección de casas, apartamentos y villas en las mejores ubicaciones.
        </p>
        <button
          onClick={() => navigateTo('properties')}
          className="bg-red-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition shadow-xl hover:shadow-red-900/20 flex items-center justify-center gap-2 mx-auto transform hover:-translate-y-1 duration-200"
        >
          Ver Propiedades <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );

  const PropertiesGrid = ({ limit }: { limit?: number }) => {
    const displayProps = limit ? filteredProperties.slice(0, limit) : filteredProperties;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayProps.length > 0 ? (
          displayProps.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={handlePropertyClick}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-slate-400 text-lg">{t('properties.no_results')}</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedType('Todos'); }}
              className="mt-4 text-red-600 font-medium hover:underline"
            >
              {t('properties.clear_filters')}
            </button>
          </div>
        )}
      </div>
    );
  };

  const HomeView = () => (
    <div className="animate-fade-in">
      {HeroSection()}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('featured.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">{t('featured.subtitle')}</p>
        </div>
        {PropertiesGrid({ limit: 3 })}
        <div className="text-center mt-16">
          <button
            onClick={() => navigateTo('properties')}
            className="inline-flex items-center text-red-600 font-bold hover:text-red-800 transition text-lg group"
          >
            {t('featured.view_all')} <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">{t('why.title')}</h2>
              <ul className="space-y-6">
                {[
                  t('why.point1'),
                  t('why.point2'),
                  t('why.point3'),
                  t('why.point4')
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2 mt-1">
                      <ArrowRight size={16} className="text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-lg text-slate-700 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigateTo('contact')}
                className="mt-10 bg-slate-900 dark:bg-red-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-red-700 transition shadow-lg"
              >
                {t('why.cta')}
              </button>
            </div>
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80" alt="Meeting" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PropertiesView = () => (
    <div className="animate-fade-in pb-16">
      <div className="bg-slate-900 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('properties.title')}</h1>
          <p className="text-slate-400 max-w-2xl">{t('properties.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="w-full md:w-1/3 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('properties.search_placeholder')}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Listing Type Filter */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedListingType('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedListingType === 'all' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedListingType('sale')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedListingType === 'sale' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Venta
              </button>
              <button
                onClick={() => setSelectedListingType('rent')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedListingType === 'rent' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Alquiler
              </button>
            </div>

            <div className="w-full md:w-auto flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {uniqueTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedType === type
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                    }`}
                >
                  {type === 'Todos' ? t('properties.filter_all') : (t(`type.${type}`) || type)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {PropertiesGrid({})}
      </div>
    </div>
  );

  const ContactView = () => (
    <div className="animate-fade-in pb-16">
      <div className="bg-slate-900 text-white py-12 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-red-600 mb-1 uppercase tracking-wide">¿Quiere tasar su propiedad?</h3>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('contact.form_title')}</h2>
            <ContactForm />
          </div>

          <div className="space-y-8">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <h3 className="text-xl font-bold text-red-900 mb-6">{t('contact.info_title')}</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm text-red-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t('contact.office')}</p>
                    <p className="text-slate-600 mt-1">San Martin 647<br />San Salvador de Jujuy, JUJUY</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm text-red-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t('contact.phone')}</p>
                    <p className="text-slate-600 mt-1">+54 9 388 436 2820</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm text-red-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Email</p>
                    <p className="text-slate-600 mt-1">francoaguirre928@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Google Map Embed */}
            <div className="h-80 bg-gray-200 rounded-2xl overflow-hidden shadow-sm relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227.4737343799689!2d-65.30196428577919!3d-24.18646700717899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x941b0feed169bbaf%3A0xeaf6c3be8776aaf!2sSan%20Martin!5e0!3m2!1ses!2sar!4v1765664169211!5m2!1ses!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LoginView = () => (
    <Login
      onLoginSuccess={() => navigateTo('dashboard')}
      onCancel={() => navigateTo('home')}
    />
  );

  const DashboardView = () => (
    <Dashboard onLogout={handleLogout} />
  );

  const DetailView = () => {
    if (!detailView) return null;
    return (
      <div className="animate-fade-in">
        <div className="relative group">
          <div className="h-[50vh] min-h-[400px] overflow-hidden relative">
            {/* Main Cover Image */}
            <img
              src={detailView.images && detailView.images.length > 0
                ? detailView.images[currentImageIndex % detailView.images.length]
                : detailView.imageUrl}
              alt={detailView.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Carousel Navigation */}
            {detailView.images && detailView.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev === 0 ? detailView.images!.length - 1 : prev - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev + 1) % detailView.images!.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 text-white max-w-7xl mx-auto z-10">
            <button
              onClick={() => setDetailView(null)}
              className="mb-4 text-white/90 hover:text-white flex items-center text-sm font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm w-fit"
            >
              ← {t('detail.back')}
            </button>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-shadow">{detailView.title}</h1>
            <div className="flex items-center gap-4 text-lg">
              <span className="bg-red-600 px-3 py-1 rounded text-sm font-bold shadow-sm">{t(`type.${detailView.type}`) || detailView.type}</span>
              <span className="flex items-center gap-1 text-white/90"><MapPin size={18} /> {detailView.location}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {(detailView.images && detailView.images.length > 1) && (
          <div className="max-w-7xl mx-auto px-4 pt-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Galería de Fotos</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {detailView.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-24 rounded-lg overflow-hidden cursor-pointer transition shadow-sm border-2 ${currentImageIndex === idx ? 'border-red-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('detail.about')}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{detailView.description}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('detail.features')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {detailView.features.map((feature, idx) => (
                  <div key={idx} className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg text-sm font-medium text-center">
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide font-semibold">{t('detail.beds')}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{detailView.beds}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide font-semibold">{t('detail.baths')}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{detailView.baths}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide font-semibold">{t('detail.area')}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{detailView.sqft} <span className="text-sm">m²</span></p>
              </div>
            </div>

            {/* Google Maps Section */}
            {detailView.map_url && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('detail.location')}</h3>
                <div className="bg-gray-100 rounded-xl overflow-hidden h-80 shadow-sm border border-gray-200">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={(() => {
                      const url = detailView.map_url;
                      // Case 1: Copied full iframe code
                      const srcMatch = url.match(/src="([^"]+)"/);
                      if (srcMatch) return srcMatch[1];

                      // Case 2: Already an embed link
                      if (url.includes('google.com/maps/embed')) return url;

                      // Case 3: Fallback - try to search query (Legacy embed)
                      // This is more robust for general URLs or addresses
                      return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
                    })()}
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 sticky top-24">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{t('detail.price_label')}</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                {detailView.currency === 'EUR' && '€'}
                {detailView.currency === 'USD' && 'U$S'}
                {(detailView.currency === 'ARS' || !['EUR', 'USD'].includes(detailView.currency)) && '$'}
                {' '}{detailView.price.toLocaleString()}
              </p>

              <a
                href={`https://wa.me/5493884362820?text=${encodeURIComponent(`Hola, me interesa la propiedad "${detailView.title}"`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition mb-3 flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                {t('detail.contact_agent')}
              </a>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>{t('detail.chat_help')}</p>
              </div>
            </div>
          </div>
        </div>
      </div >
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              {ThemeToggle()}
              <div className="flex items-center cursor-pointer gap-2" onClick={() => navigateTo('home')}>
                <img src="/logo-sc.png" alt="SC Inmobiliaria" className="h-12 w-auto object-contain" />
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">SC <span className="text-red-600">INMOBILIARIA</span></span>
              </div>
            </div>

            <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300">
              <button onClick={() => navigateTo('home')} className={`hover:text-red-600 dark:hover:text-red-400 transition ${currentView === 'home' ? 'text-red-600 dark:text-red-400' : ''}`}>{t('nav.home')}</button>
              <button onClick={() => navigateTo('properties')} className={`hover:text-red-600 dark:hover:text-red-400 transition ${currentView === 'properties' ? 'text-red-600 dark:text-red-400' : ''}`}>{t('nav.properties')}</button>
              <button onClick={() => navigateTo('contact')} className={`hover:text-red-600 dark:hover:text-red-400 transition ${currentView === 'contact' ? 'text-red-600 dark:text-red-400' : ''}`}>{t('nav.contact')}</button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('es')}
                  className={`px-2 py-1 rounded text-xs font-bold transition ${language === 'es' ? 'bg-white dark:bg-slate-700 shadow text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  ES
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded text-xs font-bold transition ${language === 'en' ? 'bg-white dark:bg-slate-700 shadow text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  EN
                </button>
              </div>

              <button
                onClick={() => navigateTo(userName ? 'dashboard' : 'login')}
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition flex items-center gap-1"
              >
                <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                  <User size={18} />
                </div>
                {userName || t('nav.agent_login')}
              </button>
            </div>

            <div className="md:hidden flex items-center gap-4">
              {ThemeToggle()}
              <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className="font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-xs">
                {language.toUpperCase()}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 dark:text-white hover:text-slate-900 dark:hover:text-slate-200">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full pb-4 shadow-lg">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <button onClick={() => navigateTo('home')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-red-600 hover:bg-gray-50 rounded-md">{t('nav.home')}</button>
              <button onClick={() => navigateTo('properties')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-red-600 hover:bg-gray-50 rounded-md">{t('nav.properties')}</button>
              <button onClick={() => navigateTo('contact')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-red-600 hover:bg-gray-50 rounded-md">{t('nav.contact')}</button>
              <button onClick={() => navigateTo(userName ? 'dashboard' : 'login')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-500 hover:text-red-600 hover:bg-gray-50 rounded-md border-t border-gray-100 mt-2 pt-3">{userName || t('nav.agent_login')}</button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {detailView ? (
          DetailView()
        ) : (
          <>
            {currentView === 'home' && HomeView()}
            {currentView === 'properties' && PropertiesView()}
            {currentView === 'contact' && ContactView()}
            {currentView === 'login' && LoginView()}
            {currentView === 'dashboard' && DashboardView()}
          </>
        )}
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <img src="/logo-sc.png" alt="SC Logo" className="h-8 w-auto mr-2" />
                <span className="text-xl font-bold">SC <span className="text-red-500">INMOBILIARIA</span></span>
              </div>
              <p className="text-slate-400 max-w-md">
                Transformando la manera en que las personas encuentran su hogar ideal mediante tecnología avanzada y un servicio personalizado.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">{t('footer.explore')}</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => navigateTo('home')} className="hover:text-red-400 transition">{t('nav.home')}</button></li>
                <li><button onClick={() => navigateTo('properties')} className="hover:text-red-400 transition">{t('nav.properties')}</button></li>
                <li><button onClick={() => navigateTo('contact')} className="hover:text-red-400 transition">{t('nav.contact')}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">{t('nav.contact')}</h4>
              <ul className="space-y-2 text-slate-400">
                <li>San Martin 647, San Salvador de Jujuy, JUJUY</li>
                <li>francoaguirre928@gmail.com</li>
                <li>+54 9 388 436 2820</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">{t('footer.rights')}</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <div className="w-5 h-5 bg-slate-700 rounded-full hover:bg-red-500 transition cursor-pointer"></div>
              <div className="w-5 h-5 bg-slate-700 rounded-full hover:bg-red-500 transition cursor-pointer"></div>
              <div className="w-5 h-5 bg-slate-700 rounded-full hover:bg-red-500 transition cursor-pointer"></div>
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget properties={properties} />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <InnerApp />
    </LanguageProvider>
  );
}

export default App;