# Travel Trends Intelligence

Detecta destinos de viaje en tendencia creciente en cada país para generar campañas publicitarias de eSIM anticipadas.

## Cómo funciona

```
GitHub Actions (2x/día) → pytrends → Supabase → Vercel dashboard
```

1. **GitHub Actions** corre el collector Python cada 12hs, consulta Google Trends y guarda resultados en Supabase
2. **Dashboard Next.js** en Vercel lee de Supabase y muestra los destinos en alza por país
3. **Claude** genera copy de campaña de eSIM al hacer clic en cualquier tendencia

## Setup en 5 pasos

### 1. Clonar y configurar el repo

```bash
git clone https://github.com/TU_USUARIO/travel-trends-intelligence
```

### 2. Crear base de datos en Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar el contenido de `supabase/schema.sql`
3. Copiar la **URL** y la **anon key** de Settings → API

### 3. Configurar variables de entorno

#### En Vercel (para el dashboard):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_ACTIONS_TOKEN=ghp_...
GITHUB_REPO=tu-usuario/travel-trends-intelligence
```

#### En GitHub Secrets (para el collector):
Settings → Secrets → Actions → New repository secret
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...  ← usar la SERVICE ROLE key (no la anon key)
```

### 4. Deploy en Vercel

1. Push el repo a GitHub
2. Conectar en [vercel.com](https://vercel.com) → New Project → importar el repo
3. **Root directory**: `app`
4. Agregar las variables de entorno del paso 3
5. Deploy

### 5. Primera colección de datos

Ir a GitHub → Actions → "Collect Travel Trends" → Run workflow → mode: all

O desde el dashboard hacer clic en "↻ Actualizar datos".

---

## Estructura

```
travel-trends-intelligence/
├── app/                     # Next.js → Vercel
│   ├── app/
│   │   ├── page.tsx         # Dashboard principal
│   │   └── api/
│   │       ├── trending/    # Destinos en alza por país
│   │       ├── rising/      # Todos los países: destinos emergentes
│   │       ├── destination/ # Detalle de un destino
│   │       ├── insights/    # Claude genera copy de campaña
│   │       └── trigger/     # Disparo manual de GitHub Actions
│   ├── components/          # RisingTable, InsightPanel, etc.
│   └── lib/supabase.ts
├── collector/               # Python → GitHub Actions
│   ├── collect_trends.py    # Obtiene datos de Google Trends
│   ├── analyzer.py          # Calcula velocity y detecta spikes
│   └── keywords.py          # Lista de destinos y países
├── supabase/
│   └── schema.sql           # Ejecutar en Supabase SQL Editor
└── .github/workflows/
    └── collect_trends.yml   # Cron: 6am y 6pm UTC
```

## Lógica de detección de tendencias

- **Velocity**: `(score_semana_actual - score_semana_pasada) / score_semana_pasada × 100`
- **Spike**: velocity ≥ 30% → badge rojo en el dashboard
- **Fuentes**: trending diario + related queries rising + lista fija de ~150 destinos
- **Países monitoreados**: AR, BR, CL, MX, CO, ES, PT, FR, IT, DE, GB, NL, US, CA, AU

## Notas técnicas

- pytrends es una librería no oficial que hace scraping de Google Trends. Google puede aplicar rate limiting. El collector tiene delays de 8-15s entre requests para minimizar esto.
- La service role key de Supabase (usada en el collector) tiene permisos de escritura. La anon key (usada en el dashboard) solo tiene permisos de lectura.
- El botón "Actualizar datos" en el dashboard requiere un GitHub Personal Access Token con permiso `workflow`.
