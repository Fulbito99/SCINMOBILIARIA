import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './services/supabase';
import { Home, Search, Menu, X, ArrowRight, Phone, Mail, MapPin, User } from 'lucide-react';
import { Property } from './types';
import { PROPERTY_TYPES_MAP } from './utils/translations';
import { PropertyCard } from './components/PropertyCard';
import { ChatWidget } from './components/ChatWidget';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

type ViewState = 'home' | 'properties' | 'contact' | 'login' | 'dashboard';

function InnerApp() {
  const { t, language, setLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [detailView, setDetailView] = useState<Property | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setCurrentView('dashboard');
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setUserName(profile.full_name);
        } else {
          console.log("Profile not found for user. Please run repair_database.sql");
          // Fallback name from email
          setUserName(session.user.email?.split('@')[0] || 'Agente');
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setCurrentView('dashboard');
        setMobileMenuOpen(false);
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setUserName(profile.full_name);
        } else {
          // Fallback
          setUserName(session.user.email?.split('@')[0] || 'Agente');
        }
      } else {
        // If logged out, go home and clear name
        setCurrentView('home');
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching properties:", error);
      }

      if (data && !error) {
        console.log("Supabase Raw Data:", data); // DEBUG: Ver qué llega de Supabase
        // Map Supabase snake_case to frontend camelCase
        const mappedProps: Property[] = data.map((p: any) => ({
          ...p,
          imageUrl: p.image_url,
        }));
        console.log("Mapped Properties:", mappedProps); // DEBUG: Ver qué se guarda en el estado
        setProperties(mappedProps);
      } else {
        console.log("Supabase No Data or Error. Data:", data, "Error:", error);
      }
    };

    fetchProperties();
  }, [currentView]);

  // Debugging Connection
  const [connectionError, setConnectionError] = useState<string | null>(null);
  useEffect(() => {
    supabase.from('properties').select('count', { count: 'exact', head: true })
      .then(({ error }) => {
        if (error) {
          console.error("Supabase Connection Check Failed:", error);
          setConnectionError(error.message);
        } else {
          console.log("Supabase Connection Check Passed");
          setConnectionError(null);
        }
      });
  }, []);

  const filteredProperties = useMemo(() => {
    console.log("Filtering properties...", properties.length); // DEBUG
    const filtered = properties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'Todos' || p.type === selectedType;

      // Log failed matches for debugging
      if (!matchesSearch || !matchesType) {
        console.log(`Filtered out ${p.title}: Search=${matchesSearch}, Type=${matchesType}, MyType=${p.type}, Selected=${selectedType}`);
      }

      return matchesSearch && matchesType;
    });
    console.log("Filtered result count:", filtered.length); // DEBUG
    return filtered;
  }, [searchTerm, selectedType, properties]);

  const uniqueTypes = ['Todos', ...Array.from(new Set(properties.map(p => p.type)))];

  const handlePropertyClick = (property: Property) => {
    setDetailView(property);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    setDetailView(null);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // navigateTo('home') handled by onAuthStateChange
  };

  // --- SUB-COMPONENTS ---

  const ContactForm = () => {
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-gray-50 focus:bg-white"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('contact.phone')}</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-gray-50 focus:bg-white"
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
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-gray-50 focus:bg-white"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          ></textarea>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200">
          {t('contact.send')}
        </button>
      </form>
    );
  };

  const HeroSection = () => (
    <div className="relative bg-slate-900 h-[500px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://tripin.travel/wp-content/uploads/2020/05/cerro-siete-colores-web-1024x682.jpg"
          alt="Paisaje Jujuy - Cerro de los 7 Colores"
          className="w-full h-full object-cover opacity-60"
        />
      </div>
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {t('hero.title.prefix')} <span className="text-indigo-400">{t('hero.title.suffix')}</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>
        <button
          onClick={() => navigateTo('properties')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 mx-auto"
        >
          {t('hero.cta')}
          <ArrowRight size={18} />
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
              className="mt-4 text-indigo-600 font-medium hover:underline"
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
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('featured.title')}</h2>
          <p className="text-slate-500">{t('featured.subtitle')}</p>
        </div>
        <PropertiesGrid limit={3} />
        <div className="text-center mt-12">
          <button
            onClick={() => navigateTo('properties')}
            className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition"
          >
            {t('featured.view_all')} <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>

      <div className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">{t('why.title')}</h2>
              <ul className="space-y-4">
                {[
                  t('why.point1'),
                  t('why.point2'),
                  t('why.point3'),
                  t('why.point4')
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="bg-indigo-600 rounded-full p-1">
                      <ArrowRight size={12} className="text-white" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigateTo('contact')}
                className="mt-8 bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition"
              >
                {t('why.cta')}
              </button>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80" alt="Meeting" className="w-full h-full object-cover" />
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
            <div className="w-full md:w-1/2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('properties.search_placeholder')}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {uniqueTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                    }`}
                >
                  {type === 'Todos' ? t('properties.filter_all') : (t(`type.${type}`) || type)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <PropertiesGrid />
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
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('contact.form_title')}</h2>
            <ContactForm />
          </div>

          <div className="space-y-8">
            <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100">
              <h3 className="text-xl font-bold text-indigo-900 mb-6">{t('contact.info_title')}</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm text-indigo-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t('contact.office')}</p>
                    <p className="text-slate-600 mt-1">San Martin 647<br />San Salvador de Jujuy, JUJUY</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm text-indigo-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t('contact.phone')}</p>
                    <p className="text-slate-600 mt-1">+54 9 388 436 2820</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm text-indigo-600">
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
        <div className="relative h-[50vh] min-h-[400px]">
          <img src={detailView.imageUrl} alt={detailView.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white max-w-7xl mx-auto">
            <button
              onClick={() => setDetailView(null)}
              className="mb-4 text-white/80 hover:text-white flex items-center text-sm font-medium"
            >
              ← {t('detail.back')}
            </button>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{detailView.title}</h1>
            <div className="flex items-center gap-4 text-lg">
              <span className="bg-indigo-600 px-3 py-1 rounded text-sm font-bold">{t(`type.${detailView.type}`) || detailView.type}</span>
              <span>{detailView.location}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('detail.about')}</h2>
              <p className="text-slate-600 leading-relaxed text-lg">{detailView.description}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{t('detail.features')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {detailView.features.map((feature, idx) => (
                  <div key={idx} className="bg-indigo-50 text-indigo-800 px-4 py-2 rounded-lg text-sm font-medium text-center">
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide font-semibold">{t('detail.beds')}</p>
                <p className="text-3xl font-bold text-slate-800">{detailView.beds}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide font-semibold">{t('detail.baths')}</p>
                <p className="text-3xl font-bold text-slate-800">{detailView.baths}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide font-semibold">{t('detail.area')}</p>
                <p className="text-3xl font-bold text-slate-800">{detailView.sqft} <span className="text-sm">m²</span></p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
              <p className="text-slate-500 text-sm mb-1">{t('detail.price_label')}</p>
              <p className="text-4xl font-bold text-slate-900 mb-6">${detailView.price.toLocaleString()}</p>

              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition mb-3">
                {t('detail.request_visit')}
              </button>
              <button className="w-full bg-white text-slate-900 border-2 border-slate-900 py-4 rounded-xl font-bold hover:bg-slate-50 transition">
                {t('detail.contact_agent')}
              </button>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-slate-500">
                <p>{t('detail.chat_help')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        {connectionError && (
          <div className="bg-red-500 text-white text-center py-2 px-4 text-xs font-bold">
            ERROR DE CONEXIÓN CON SUPABASE: {connectionError} (Revisa .env.local)
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="bg-indigo-600 p-2 rounded-lg text-white mr-2">
                <Home size={24} />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">INMOBILIARIA <span className="text-indigo-600">CONESA</span></span>
            </div>

            <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 space-x-8 text-sm font-medium text-slate-600">
              <button onClick={() => navigateTo('home')} className={`hover:text-indigo-600 transition ${currentView === 'home' ? 'text-indigo-600' : ''}`}>{t('nav.home')}</button>
              <button onClick={() => navigateTo('properties')} className={`hover:text-indigo-600 transition ${currentView === 'properties' ? 'text-indigo-600' : ''}`}>{t('nav.properties')}</button>
              <button onClick={() => navigateTo('contact')} className={`hover:text-indigo-600 transition ${currentView === 'contact' ? 'text-indigo-600' : ''}`}>{t('nav.contact')}</button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('es')}
                  className={`px-2 py-1 rounded text-xs font-bold transition ${language === 'es' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                >
                  ES
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded text-xs font-bold transition ${language === 'en' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                >
                  EN
                </button>
              </div>

              <button
                onClick={() => navigateTo(userName ? 'dashboard' : 'login')}
                className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition flex items-center gap-1"
              >
                <User size={16} />
                {userName || t('nav.agent_login')}
              </button>
            </div>

            <div className="md:hidden flex items-center gap-4">
              <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className="font-bold text-slate-600 border px-2 py-1 rounded text-xs">
                {language.toUpperCase()}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 hover:text-slate-900">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full pb-4 shadow-lg">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <button onClick={() => navigateTo('home')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">{t('nav.home')}</button>
              <button onClick={() => navigateTo('properties')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">{t('nav.properties')}</button>
              <button onClick={() => navigateTo('contact')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">{t('nav.contact')}</button>
              <button onClick={() => navigateTo(userName ? 'dashboard' : 'login')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-500 hover:text-indigo-600 hover:bg-gray-50 rounded-md border-t border-gray-100 mt-2 pt-3">{userName || t('nav.agent_login')}</button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {detailView ? (
          <DetailView />
        ) : (
          <>
            {currentView === 'home' && <HomeView />}
            {currentView === 'properties' && <PropertiesView />}
            {currentView === 'contact' && <ContactView />}
            {currentView === 'login' && <LoginView />}
            {currentView === 'dashboard' && <DashboardView />}
          </>
        )}
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-600 p-1.5 rounded-lg mr-2">
                  <Home size={20} />
                </div>
                <span className="text-xl font-bold">INMOBILIARIA <span className="text-indigo-500">CONESA</span></span>
              </div>
              <p className="text-slate-400 max-w-md">
                Transformando la manera en que las personas encuentran su hogar ideal mediante tecnología avanzada y un servicio personalizado.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">{t('footer.explore')}</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => navigateTo('home')} className="hover:text-indigo-400 transition">{t('nav.home')}</button></li>
                <li><button onClick={() => navigateTo('properties')} className="hover:text-indigo-400 transition">{t('nav.properties')}</button></li>
                <li><button onClick={() => navigateTo('contact')} className="hover:text-indigo-400 transition">{t('nav.contact')}</button></li>
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
              <div className="w-5 h-5 bg-slate-700 rounded-full hover:bg-indigo-500 transition cursor-pointer"></div>
              <div className="w-5 h-5 bg-slate-700 rounded-full hover:bg-indigo-500 transition cursor-pointer"></div>
              <div className="w-5 h-5 bg-slate-700 rounded-full hover:bg-indigo-500 transition cursor-pointer"></div>
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