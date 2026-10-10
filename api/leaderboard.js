const SUPABASE_URL = 'https://brlpajcnvfsxkdozsfkl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Vd_HqlZeCgIfJarwr4SzEw_IyjHL2x-';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const url = `${SUPABASE_URL}/rest/v1/perfiles?select=alias,nivel,total_ventas,total_clics,nexo_coins&order=total_ventas.desc&limit=${limit}`;

    const r = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });

    if (!r.ok) return res.status(500).json({ error: 'Error al consultar' });

    const perfiles = await r.json();

    const ranking = perfiles.map((u, i) => ({
      posicion: i + 1,
      alias: u.alias,
      nivel: u.nivel,
      ventas: u.total_ventas,
      clics: u.total_clics
    }));

    return res.status(200).json({
      ok: true,
      fuente: 'Nexo',
      atribucion: 'Ranking de nexo.app',
      total: ranking.length,
      ranking: ranking
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno', detalle: err.message });
  }
}
