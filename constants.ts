import { Property } from './types';

export const APP_NAME = 'SC Inmobiliaria';

export const CONTACT_INFO = {
  EMAIL: 'francoaguirre928@gmail.com',
  PHONE_DISPLAY: '+54 9 388 436 2820',
  PHONE_WHATSAPP: '5493884362820', // Format for wa.me (no plus, country code + area code + number)
  ADDRESS_LINE1: 'San Martin 647',
  ADDRESS_LINE2: 'San Salvador de Jujuy, JUJUY',
  MAP_URL: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227.4737343799689!2d-65.30196428577919!3d-24.18646700717899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x941b0feed169bbaf%3A0xeaf6c3be8776aaf!2sSan%20Martin!5e0!3m2!1ses!2sar!4v1765664169211!5m2!1ses!2sar'
};

export const PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Villa Moderna con Piscina',
    price: 450000,
    currency: 'EUR',
    location: 'Madrid, España',
    beds: 4,
    baths: 3,
    sqft: 3200,
    type: 'Villa',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    description: 'Una impresionante villa moderna ubicada en los suburbios de Madrid. Cuenta con piscina privada, gran jardín y zona de estar de planta abierta.',
    features: ['Piscina', 'Jardín', 'Garaje', 'Domótica']
  },
  {
    id: '2',
    title: 'Apartamento de Lujo en el Centro',
    price: 280000,
    currency: 'EUR',
    location: 'Barcelona, España',
    beds: 2,
    baths: 2,
    sqft: 1100,
    type: 'Apartment',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    description: 'Ubicado en el corazón de Barcelona, este apartamento de lujo ofrece impresionantes vistas a la ciudad y comodidades premium.',
    features: ['Balcón', 'Gimnasio', 'Conserje', 'Vistas Ciudad']
  },
  {
    id: '3',
    title: 'Casa Rural con Encanto',
    price: 150000,
    currency: 'EUR',
    location: 'Valencia, España',
    beds: 3,
    baths: 2,
    sqft: 1800,
    type: 'House',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    description: 'Escápese al campo en esta encantadora casa rural. Perfecta para los amantes de la naturaleza que buscan paz y tranquilidad.',
    features: ['Chimenea', 'Terreno Amplio', 'Vistas Montaña']
  },
  {
    id: '4',
    title: 'Apartamento Minimalista Frente al Mar',
    price: 350000,
    currency: 'EUR',
    location: 'Málaga, España',
    beds: 2,
    baths: 2,
    sqft: 1300,
    type: 'Condo',
    imageUrl: 'https://picsum.photos/800/600?random=4',
    description: 'Despierte con el sonido de las olas en este hermoso condominio frente al mar. Diseño moderno con acceso directo a la playa.',
    features: ['Vistas al Mar', 'Piscina', 'Seguridad', 'Terraza']
  },
  {
    id: '5',
    title: 'Casa Señorial Histórica',
    price: 520000,
    currency: 'EUR',
    location: 'Sevilla, España',
    beds: 5,
    baths: 4,
    sqft: 4000,
    type: 'House',
    imageUrl: 'https://picsum.photos/800/600?random=5',
    description: 'Una casa adosada bellamente restaurada en el distrito histórico. Techos altos, azulejos originales y un patio privado.',
    features: ['Patio Andaluz', 'Histórico', 'Bodega']
  },
  {
    id: '6',
    title: 'Loft Ático Industrial',
    price: 600000,
    currency: 'EUR',
    location: 'Bilbao, España',
    beds: 3,
    baths: 2.5,
    sqft: 2200,
    type: 'Apartment',
    imageUrl: 'https://picsum.photos/800/600?random=6',
    description: 'Ático loft de estilo industrial con ventanales de suelo a techo y una enorme terraza en la azotea.',
    features: ['Azotea', 'Estilo Industrial', 'Ascensor']
  }
];

export const INITIAL_MESSAGE = "¡Hola! Soy tu asistente inmobiliario de SC Inmobiliaria. ¿Estás buscando comprar, alquilar o necesitas consejo sobre alguna propiedad?";