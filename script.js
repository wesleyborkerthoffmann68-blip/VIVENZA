/* Main interactive behavior: map, reveal on scroll, back-to-top */

import L from 'leaflet';

const coords = [
  [-29.392778, -51.005278], // 29°23'34"S 51°00'19"W
  [-29.3875,   -51.002778], // 29°23'15"S 51°00'10"W
  [-29.387222, -50.991667], // 29°23'14"S 50°59'30"W
  [-29.390278, -50.983611]  // 29°23'25"S 50°59'01"W
];

document.addEventListener('DOMContentLoaded', () => {
  // Initialize map
  const mapEl = document.getElementById('map');
  const map = L.map(mapEl, { scrollWheelZoom: false }).setView(coords[0], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const goldIcon = L.divIcon({
    className: 'vivenza-marker',
    html: '<div style="background:linear-gradient(180deg,#d4af37,#b68f2a); width:18px;height:18px;border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,0.2);border:2px solid white;"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  const markers = [];
  coords.forEach((c, i) => {
    const m = L.marker(c, { icon: goldIcon }).addTo(map)
      .bindPopup(`<strong>Ponto de Coleta ${i + 1}</strong><br>${formatDMS(c[0], c[1])}`);
    markers.push(m);
  });

  // Fit bounds to markers
  const bounds = L.latLngBounds(coords);
  map.fitBounds(bounds.pad(0.2));

  // New: Refresh/reset map button behavior
  const refreshBtn = document.getElementById('refreshMap');
  if (refreshBtn){
    refreshBtn.addEventListener('click', () => {
      // Reload tile layer tiles by invalidating size and redrawing
      map.invalidateSize(false);
      // Close any open popups
      map.closePopup();
      // Re-add markers (safe if already present) and refit to original bounds
      markers.forEach(m => { if (!map.hasLayer(m)) m.addTo(map); });
      map.fitBounds(bounds.pad(0.2));
      // small visual feedback: briefly pulse the button
      refreshBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 300 });
    });
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.12 });
  reveals.forEach(r => obs.observe(r));

  // Back to top button
  const back = document.getElementById('backTop');
  back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Show/hide back button on scroll
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 200;
    back.style.opacity = show ? '1' : '0';
    back.style.pointerEvents = show ? 'auto' : 'none';
  });
});

/* Utilities */
function formatDMS(lat, lon){
  // Convert decimal to DMS string close to the original format
  function toDMS(deg){
    const d = Math.floor(Math.abs(deg));
    const mFloat = (Math.abs(deg) - d) * 60;
    const m = Math.floor(mFloat);
    const s = Math.round((mFloat - m) * 60);
    return {d,m,s};
  }
  const la = toDMS(lat), lo = toDMS(lon);
  const latHem = lat < 0 ? "S" : "N";
  const lonHem = lon < 0 ? "W" : "E";
  return `${la.d}°${la.m}'${la.s}"${latHem} ${lo.d}°${lo.m}'${lo.s}"${lonHem}`;
}