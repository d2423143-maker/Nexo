const SUPABASE_URL = 'https://brlpajcnvfsxkdozsfkl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Vd_HqlZeCgIfJarwr4SzEw_IyjHL2x-';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'count=exact'
    };

    const [rOfertas, rUsuarios, rComisiones] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/ofertas?select=id&activa=eq.true&limit=1`, { headers: { ...headers, Range: '0-0' } }),
      fetch(`${SUPABASE_URL}/rest/v1/perfiles?select=id&limit=1`, { headers: { ...headers, Range: '0-0' } }),
      fetch(`${SUPABASE_URL}/rest/v1/comisiones?select=monto_usuario&estado=in.(confirmada,pagada)`, { headers })
    ]);

    const contar = (r) => {
      const range = r.headers.get('content-range');
      if (!range) return 0;
      const total = range.split('/')[1];
      return parseInt(total, 10) || 0;
    };

    const ofertas = contar(rOfertas);
    const usuarios = contar(rUsuarios);
    const comisionesData = await rComisiones.json();
    const comisiones = Array.isArray(comisionesData)
      ? comisionesData.reduce((s, c) => s + parseFloat(c.monto_usuario || 0), 0)
      : 0;

    return res.status(200).json({
      ok: true,
      fuente: 'Nexo',
      stats: {
        ofertas_activas: ofertas,
        cazadores: usuarios,
        comisiones_pagadas_usd: parseFloat(comisiones.toFixed(2))
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno', detalle: err.message });
  }
}
