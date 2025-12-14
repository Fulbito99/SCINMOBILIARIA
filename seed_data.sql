-- Insert sample properties
INSERT INTO properties (
    title, 
    price, 
    currency, 
    location, 
    beds, 
    baths, 
    sqft, 
    type, 
    description, 
    features, 
    image_url, 
    images
) VALUES 
(
    'Casa Moderna en el Centro', 
    250000, 
    'USD', 
    'San Salvador de Jujuy, Centro', 
    3, 
    2, 
    180, 
    'House', 
    'Hermosa casa moderna ubicada en el corazón de la ciudad. Recientemente renovada con acabados de alta calidad.', 
    ARRAY['Jardín', 'Garage', 'Quincho', 'Lavadero'], 
    'https://images.unsplash.com/photo-1600596542815-e32c53048043?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1600596542815-e32c53048043?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ]
),
(
    'Departamento con Vista', 
    120000, 
    'USD', 
    'Barrio Los Perales', 
    2, 
    1, 
    85, 
    'Apartment', 
    'Luminoso departamento con espectacular vista a los cerros. Ideal para pareja o inversión.', 
    ARRAY['Balcón', 'Seguridad 24hs', 'Ascensor', 'SUM'], 
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ]
),
(
    'Villa de Lujo', 
    550000, 
    'USD', 
    'Yala', 
    5, 
    4, 
    450, 
    'Villa', 
    'Exclusiva propiedad con parque privado y piscina. Diseñada para el máximo confort y privacidad.', 
    ARRAY['Piscina', 'Parque', 'Sauna', 'Doble Garage', 'Vigilancia'], 
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
    ]
);
