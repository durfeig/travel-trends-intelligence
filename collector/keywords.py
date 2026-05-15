"""
Definición de destinos monitoreados y keywords de viaje por idioma.
"""

# ~150 destinos globales agrupados en batches de 5 (límite de pytrends)
DESTINATIONS = [
    # Asia-Pacífico
    "Japón", "Tailandia", "Bali", "Singapur", "Vietnam",
    "Corea del Sur", "Filipinas", "Indonesia", "Malasia", "Camboya",
    "Sri Lanka", "Nepal", "India", "Maldivas", "Hong Kong",
    "Taiwán", "Myanmar", "Laos", "Bangladesh", "Bután",
    # Europa
    "España", "Francia", "Italia", "Portugal", "Grecia",
    "Alemania", "Países Bajos", "Suiza", "Austria", "Bélgica",
    "Reino Unido", "Irlanda", "Suecia", "Noruega", "Dinamarca",
    "Finlandia", "Polonia", "República Checa", "Hungría", "Croacia",
    "Turquía", "Islandia", "Escocia", "Albania", "Montenegro",
    "Serbia", "Eslovenia", "Malta", "Chipre", "Bulgaria",
    # Oriente Medio y África
    "Dubai", "Marruecos", "Egipto", "Israel", "Jordania",
    "Qatar", "Abu Dhabi", "Omán", "Kenia", "Tanzania",
    "Sudáfrica", "Etiopía", "Namibia", "Madagascar", "Ruanda",
    "Túnez", "Senegal", "Ghana", "Costa de Marfil", "Mozambique",
    # América
    "México", "Cuba", "República Dominicana", "Colombia", "Perú",
    "Brasil", "Argentina", "Chile", "Ecuador", "Bolivia",
    "Costa Rica", "Panamá", "Guatemala", "Honduras", "Nicaragua",
    "Jamaica", "Barbados", "Trinidad y Tobago", "Bahamas", "Aruba",
    "Cancún", "Cartagena", "Buenos Aires", "Lima", "Rio de Janeiro",
    "Ciudad de México", "Medellín", "Bogotá", "Santiago", "La Habana",
    # América del Norte / Oceanía
    "Nueva York", "Miami", "Los Ángeles", "Las Vegas", "Chicago",
    "Canadá", "Vancouver", "Toronto", "Montreal", "Alaska",
    "Australia", "Nueva Zelanda", "Hawaii", "Fiyi", "Tahití",
]

# Keywords de viaje por idioma para related_queries (detección de emergentes)
TRAVEL_KEYWORDS_BY_LANG = {
    "es": [
        "vuelos baratos",
        "vacaciones",
        "donde viajar",
        "viaje a",
        "paquetes de viaje",
    ],
    "pt": [
        "voos baratos",
        "viagens",
        "destinos turísticos",
        "pacotes de viagem",
        "onde viajar",
    ],
    "en": [
        "cheap flights",
        "travel deals",
        "vacation ideas",
        "where to travel",
        "best destinations",
    ],
    "fr": [
        "vols pas chers",
        "vacances",
        "destinations voyage",
        "séjour pas cher",
        "où partir",
    ],
    "de": [
        "günstige flüge",
        "urlaub",
        "reiseziele",
        "pauschalreise",
        "wohin reisen",
    ],
    "it": [
        "voli economici",
        "vacanze",
        "destinazioni viaggio",
        "dove andare in vacanza",
        "pacchetti viaggio",
    ],
}

# Mapeo de código ISO → nombre para pytrends.trending_searches(pn=...)
TRENDING_SEARCH_COUNTRY = {
    "AR": "argentina",
    "BR": "brazil",
    "CL": "chile",
    "MX": "mexico",
    "CO": "colombia",
    "ES": "spain",
    "PT": "portugal",
    "FR": "france",
    "IT": "italy",
    "DE": "germany",
    "GB": "united_kingdom",
    "NL": "netherlands",
    "US": "united_states",
    "CA": "canada",
    "AU": "australia",
}

# Países monitoreados con su código geo pytrends y idioma principal
MONITORED_COUNTRIES = [
    # Prioridad 1: LATAM + Europa hispana/lusófona
    {"geo": "AR", "name": "Argentina",  "lang": "es", "tz": "America/Argentina/Buenos_Aires"},
    {"geo": "BR", "name": "Brasil",     "lang": "pt", "tz": "America/Sao_Paulo"},
    {"geo": "CL", "name": "Chile",      "lang": "es", "tz": "America/Santiago"},
    {"geo": "MX", "name": "México",     "lang": "es", "tz": "America/Mexico_City"},
    {"geo": "CO", "name": "Colombia",   "lang": "es", "tz": "America/Bogota"},
    {"geo": "ES", "name": "España",     "lang": "es", "tz": "Europe/Madrid"},
    {"geo": "PT", "name": "Portugal",   "lang": "pt", "tz": "Europe/Lisbon"},
    # Prioridad 2: Europa occidental
    {"geo": "FR", "name": "Francia",    "lang": "fr", "tz": "Europe/Paris"},
    {"geo": "IT", "name": "Italia",     "lang": "it", "tz": "Europe/Rome"},
    {"geo": "DE", "name": "Alemania",   "lang": "de", "tz": "Europe/Berlin"},
    {"geo": "GB", "name": "Reino Unido","lang": "en", "tz": "Europe/London"},
    {"geo": "NL", "name": "Países Bajos","lang":"en", "tz": "Europe/Amsterdam"},
    # Prioridad 3: otros mercados
    {"geo": "US", "name": "EEUU",       "lang": "en", "tz": "America/New_York"},
    {"geo": "CA", "name": "Canadá",     "lang": "en", "tz": "America/Toronto"},
    {"geo": "AU", "name": "Australia",  "lang": "en", "tz": "Australia/Sydney"},
]

# Batches de 5 destinos para interest_over_time (límite de pytrends)
def get_destination_batches(batch_size: int = 5) -> list[list[str]]:
    return [DESTINATIONS[i:i+batch_size] for i in range(0, len(DESTINATIONS), batch_size)]

# Keywords de viaje para un país dado según su idioma
def get_travel_keywords(geo: str) -> list[str]:
    country = next((c for c in MONITORED_COUNTRIES if c["geo"] == geo), None)
    if not country:
        return TRAVEL_KEYWORDS_BY_LANG["en"]
    return TRAVEL_KEYWORDS_BY_LANG.get(country["lang"], TRAVEL_KEYWORDS_BY_LANG["en"])
