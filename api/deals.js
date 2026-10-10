const SUPABASE_URL = 'https://brlpajcnvfsxkdozsfkl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Vd_HqlZeCgIfJarwr4SzEw_IyjHL2x-';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { categoria = '', tienda = '', orden = 'recientes', buscar = '', limit = 50 } = req.query;
    const limite = Math.min(parseInt(limit, 10) || 50, 100);

    let url = `${SUPABASE_URL}/rest/v1/ofertas?select=id,titulo,slug,descripcion,precio,precio_antes,moneda,categoria_id,tienda_id,link_afiliado,imagen_url,votos_total,favoritos_total,clics_total,creado_en,patrocinada,verificada&activa=eq.true`;

    if (categoria) {
      const cat = await fetch(`${SUPABASE_URL}/rest/v1/categorias?select=id&slug=eq.${encodeURIComponent(categoria)}`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      const catData = await cat.json();
      if (catData && catData[0]) url += `&categoria_id=eq.${catData[0].id}`;
    }

    if (tienda) {
      const tie = await fetch(`${SUPABASE_URL}/rest/v1/tiendas?select=id&slug=eq.${encodeURIComponent(tienda)}`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      const tieData = await tie.json();
      if (tieData && tieData[0]) url += `&tienda_id=eq.${tieData[0].id}`;
    }

    if (buscar) {
      const q = encodeURIComponent(`%${buscar}%`);
      url += `&or=(titulo.ilike.${q},descripcion.ilike.${q})`;
    }

    const ordenes = {
      recientes: 'creado_en.desc',
      votos: 'votos_total.desc',
      clics: 'clics_total.desc',
      'precio-asc': 'precio.asc',
      'precio-desc': 'precio.desc'
    };
    url += `&order=patrocinada.desc,${ordenes[orden] || 'creado_en.desc'}&limit=${limite}`;

    const r = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });

    if (!r.ok) return res.status(500).json({ error: 'Error al consultar ofertas' });

    const ofertas = await r.json();

    return res.status(200).json({
      ok: true,
      fuente: 'Nexo',
      atribucion: 'Datos de nexo.app',
      total: ofertas.length,
      ofertas: ofertas
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno', detalle: err.message });
  }
}
