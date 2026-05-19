"""
Definición de destinos monitoreados y keywords de viaje por idioma.
"""

# Mapeo de nombre en español → título exacto en Wikipedia en inglés
# Usado por wikipedia_collector.py para consultar pageviews globales
DESTINATIONS_WIKI_EN: dict[str, str] = {
    # Asia-Pacífico
    "Japón": "Japan", "Tailandia": "Thailand", "Bali": "Bali",
    "Singapur": "Singapore", "Vietnam": "Vietnam", "Corea del Sur": "South Korea",
    "Filipinas": "Philippines", "Indonesia": "Indonesia", "Malasia": "Malaysia",
    "Camboya": "Cambodia", "Sri Lanka": "Sri Lanka", "Nepal": "Nepal",
    "India": "India", "Maldivas": "Maldives", "Hong Kong": "Hong Kong",
    "Taiwán": "Taiwan", "Myanmar": "Myanmar", "Laos": "Laos",
    "Bangladesh": "Bangladesh", "Bután": "Bhutan",
    # Europa
    "España": "Spain", "Francia": "France", "Italia": "Italy",
    "Portugal": "Portugal", "Grecia": "Greece", "Alemania": "Germany",
    "Países Bajos": "Netherlands", "Suiza": "Switzerland", "Austria": "Austria",
    "Bélgica": "Belgium", "Reino Unido": "United Kingdom", "Irlanda": "Ireland",
    "Suecia": "Sweden", "Noruega": "Norway", "Dinamarca": "Denmark",
    "Finlandia": "Finland", "Polonia": "Poland", "República Checa": "Czech Republic",
    "Hungría": "Hungary", "Croacia": "Croatia", "Turquía": "Turkey",
    "Islandia": "Iceland", "Escocia": "Scotland", "Albania": "Albania",
    "Montenegro": "Montenegro", "Serbia": "Serbia", "Eslovenia": "Slovenia",
    "Malta": "Malta", "Chipre": "Cyprus", "Bulgaria": "Bulgaria",
    # Oriente Medio y África
    "Dubai": "Dubai", "Marruecos": "Morocco", "Egipto": "Egypt",
    "Israel": "Israel", "Jordania": "Jordan", "Qatar": "Qatar",
    "Abu Dhabi": "Abu Dhabi", "Omán": "Oman", "Kenia": "Kenya",
    "Tanzania": "Tanzania", "Sudáfrica": "South Africa", "Etiopía": "Ethiopia",
    "Namibia": "Namibia", "Madagascar": "Madagascar", "Ruanda": "Rwanda",
    "Túnez": "Tunisia", "Senegal": "Senegal", "Ghana": "Ghana",
    "Costa de Marfil": "Ivory Coast", "Mozambique": "Mozambique",
    # América
    "México": "Mexico", "Cuba": "Cuba", "República Dominicana": "Dominican Republic",
    "Colombia": "Colombia", "Perú": "Peru", "Brasil": "Brazil",
    "Argentina": "Argentina", "Chile": "Chile", "Ecuador": "Ecuador",
    "Bolivia": "Bolivia", "Costa Rica": "Costa Rica", "Panamá": "Panama",
    "Guatemala": "Guatemala", "Honduras": "Honduras", "Nicaragua": "Nicaragua",
    "Jamaica": "Jamaica", "Barbados": "Barbados", "Trinidad y Tobago": "Trinidad and Tobago",
    "Bahamas": "The Bahamas", "Aruba": "Aruba",
    "Cancún": "Cancún", "Cartagena": "Cartagena, Colombia",
    "Buenos Aires": "Buenos Aires", "Lima": "Lima", "Rio de Janeiro": "Rio de Janeiro",
    "Ciudad de México": "Mexico City", "Medellín": "Medellín",
    "Bogotá": "Bogotá", "Santiago": "Santiago", "La Habana": "Havana",
    # América del Norte / Oceanía
    "Nueva York": "New York City", "Miami": "Miami", "Los Ángeles": "Los Angeles",
    "Las Vegas": "Las Vegas", "Chicago": "Chicago", "Canadá": "Canada",
    "Vancouver": "Vancouver", "Toronto": "Toronto", "Montreal": "Montreal",
    "Alaska": "Alaska", "Australia": "Australia", "Nueva Zelanda": "New Zealand",
    "Hawaii": "Hawaii", "Fiyi": "Fiji", "Tahití": "Tahiti",
}

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

# Código IATA del aeropuerto principal por país monitoreado
# Usado por travelpayouts_collector.py para consultar destinos populares
GEO_TO_IATA: dict[str, str] = {
    "AR": "BUE",  # Buenos Aires
    "BR": "SAO",  # São Paulo
    "CL": "SCL",  # Santiago
    "MX": "MEX",  # Ciudad de México
    "CO": "BOG",  # Bogotá
    "ES": "MAD",  # Madrid
    "PT": "LIS",  # Lisboa
    "FR": "PAR",  # París
    "IT": "ROM",  # Roma
    "DE": "BER",  # Berlín
    "GB": "LON",  # Londres
    "NL": "AMS",  # Ámsterdam
    "US": "NYC",  # Nueva York
    "CA": "YTO",  # Toronto
    "AU": "SYD",  # Sídney
}

# Mapeo IATA → nombre en español (para traducir la respuesta de Travelpayouts)
IATA_TO_DESTINATION: dict[str, str] = {
    # Asia-Pacífico
    "TYO": "Japón", "OSA": "Japón", "BKK": "Tailandia", "DPS": "Bali",
    "SIN": "Singapur", "HAN": "Vietnam", "SGN": "Vietnam", "SEL": "Corea del Sur",
    "MNL": "Filipinas", "JKT": "Indonesia", "KUL": "Malasia",
    "PNH": "Camboya", "REP": "Camboya", "CMB": "Sri Lanka", "KTM": "Nepal",
    "DEL": "India", "BOM": "India", "MLE": "Maldivas", "HKG": "Hong Kong",
    "TPE": "Taiwán", "RGN": "Myanmar", "VTE": "Laos", "DAC": "Bangladesh",
    "PBH": "Bután",
    # Europa
    "MAD": "España", "BCN": "España", "PAR": "Francia", "CDG": "Francia",
    "ROM": "Italia", "MXP": "Italia", "LIS": "Portugal", "ATH": "Grecia",
    "BER": "Alemania", "FRA": "Alemania", "AMS": "Países Bajos", "ZRH": "Suiza",
    "VIE": "Austria", "BRU": "Bélgica", "LON": "Reino Unido", "LHR": "Reino Unido",
    "DUB": "Irlanda", "STO": "Suecia", "OSL": "Noruega", "CPH": "Dinamarca",
    "HEL": "Finlandia", "WAW": "Polonia", "PRG": "República Checa", "BUD": "Hungría",
    "ZAG": "Croacia", "IST": "Turquía", "REK": "Islandia", "EDI": "Escocia",
    "TIA": "Albania", "TGD": "Montenegro", "BEG": "Serbia", "LJU": "Eslovenia",
    "MLA": "Malta", "LCA": "Chipre", "SOF": "Bulgaria",
    # Oriente Medio y África
    "DXB": "Dubai", "CMN": "Marruecos", "RAK": "Marruecos", "CAI": "Egipto",
    "TLV": "Israel", "AMM": "Jordania", "DOH": "Qatar", "AUH": "Abu Dhabi",
    "MCT": "Omán", "NBO": "Kenia", "DAR": "Tanzania", "JNB": "Sudáfrica",
    "ADD": "Etiopía", "WDH": "Namibia", "TNR": "Madagascar", "KGL": "Ruanda",
    "TUN": "Túnez", "DKR": "Senegal", "ACC": "Ghana", "ABJ": "Costa de Marfil",
    "MPM": "Mozambique",
    # América
    "MEX": "Ciudad de México", "CUN": "Cancún", "HAV": "La Habana",
    "SDQ": "República Dominicana", "PUJ": "República Dominicana",
    "BOG": "Bogotá", "MDE": "Medellín", "LIM": "Lima", "GRU": "Brasil",
    "RIO": "Rio de Janeiro", "GIG": "Rio de Janeiro", "EZE": "Buenos Aires",
    "BUE": "Buenos Aires", "SCL": "Santiago", "UIO": "Ecuador", "LPB": "Bolivia",
    "SJO": "Costa Rica", "PTY": "Panamá", "GUA": "Guatemala", "TGU": "Honduras",
    "MGA": "Nicaragua", "KIN": "Jamaica", "BGI": "Barbados", "POS": "Trinidad y Tobago",
    "NAS": "Bahamas", "AUA": "Aruba", "CTG": "Cartagena",
    # América del Norte / Oceanía
    "NYC": "Nueva York", "JFK": "Nueva York", "EWR": "Nueva York",
    "MIA": "Miami", "LAX": "Los Ángeles", "LAS": "Las Vegas", "CHI": "Chicago",
    "YTO": "Toronto", "YYZ": "Toronto", "YVR": "Vancouver", "YMQ": "Montreal",
    "ANC": "Alaska", "SYD": "Australia", "MEL": "Australia",
    "AKL": "Nueva Zelanda", "HNL": "Hawaii", "NAN": "Fiyi", "PPT": "Tahití",
}

# Batches de 5 destinos para interest_over_time (límite de pytrends)
def get_destination_batches(batch_size: int = 5) -> list[list[str]]:
    return [DESTINATIONS[i:i+batch_size] for i in range(0, len(DESTINATIONS), batch_size)]

# Keywords de viaje para un país dado según su idioma
def get_travel_keywords(geo: str) -> list[str]:
    country = next((c for c in MONITORED_COUNTRIES if c["geo"] == geo), None)
    if not country:
        return TRAVEL_KEYWORDS_BY_LANG["en"]
    return TRAVEL_KEYWORDS_BY_LANG.get(country["lang"], TRAVEL_KEYWORDS_BY_LANG["en"])
