import { useState, useEffect } from "react";
import { 
  Image, Grid3X3, LayoutGrid, RefreshCw, Download, ZoomIn, 
  ChevronLeft, ChevronRight, X, Package, Search, Filter
} from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid"); // grid | large
  const [lightbox, setLightbox] = useState(null);
  const [page, setPage] = useState(0);
  const LIMIT = 24;

  const loadImages = async (offset = 0) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/images?limit=${LIMIT}&offset=${offset}`);
      const data = await res.json();
      setImages(data.images || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Failed to load images:", e);
    }
    setLoading(false);
  };

  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/gallery`);
      const data = await res.json();
      setImages(data.images || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Failed to load gallery:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadImages(page * LIMIT);
  }, [page]);

  const nextPage = () => {
    if ((page + 1) * LIMIT < total) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const openLightbox = (index) => {
    setLightbox(index);
  };

  const closeLightbox = () => {
    setLightbox(null);
  };

  const nextImage = () => {
    if (lightbox !== null && lightbox < images.length - 1) {
      setLightbox(lightbox + 1);
    }
  };

  const prevImage = () => {
    if (lightbox !== null && lightbox > 0) {
      setLightbox(lightbox - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (lightbox === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox]);

  const STATS = [
    { label: "Bilder gesamt", value: total.toString(), icon: Image, color: "#0066cc" },
    { label: "Aktuelle Seite", value: `${page + 1}/${Math.ceil(total/LIMIT)}`, icon: Grid3X3, color: "#7c3aed" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a2b3c]">Produktbilder</h1>
            <p className="text-sm text-[#64748b]">Thermotechnik Bildergalerie</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadGallery}
              className="px-4 py-2 bg-white border border-[#e2e8f0] text-[#64748b] text-sm font-medium rounded-lg hover:bg-[#f5f7fa] flex items-center gap-2"
            >
              <RefreshCw size={16} /> Zufällige Auswahl
            </button>
            <div className="flex items-center gap-1 bg-[#f5f7fa] rounded-lg p-1">
              <button 
                onClick={() => setView("grid")}
                className={`p-2 rounded ${view === "grid" ? "bg-white shadow-sm" : ""}`}
              >
                <Grid3X3 size={16} className={view === "grid" ? "text-[#0066cc]" : "text-[#64748b]"} />
              </button>
              <button 
                onClick={() => setView("large")}
                className={`p-2 rounded ${view === "large" ? "bg-white shadow-sm" : ""}`}
              >
                <LayoutGrid size={16} className={view === "large" ? "text-[#0066cc]" : "text-[#64748b]"} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Icon size={20} style={{ color: s.color }} />
                  <span className="text-xs text-[#94a3b8]">{s.label}</span>
                </div>
                <div className="text-2xl font-semibold text-[#1a2b3c]">{s.value}</div>
              </div>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="animate-spin text-[#0066cc]" size={32} />
          </div>
        ) : (
          <>
            <div className={`grid gap-4 ${view === "grid" ? "grid-cols-6" : "grid-cols-4"}`}>
              {images.map((img, i) => (
                <div 
                  key={img.filename}
                  onClick={() => openLightbox(i)}
                  className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shadow-sm hover:shadow-lg hover:border-[#0066cc] transition-all cursor-pointer group"
                >
                  <div className={`relative ${view === "grid" ? "aspect-square" : "aspect-[4/3]"}`}>
                    <img 
                      src={`${API}${img.url}`} 
                      alt={img.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ZoomIn className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-mono text-[#0066cc] truncate">{img.id || img.filename}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 bg-white rounded-xl border border-[#e2e8f0] p-4">
              <button 
                onClick={prevPage}
                disabled={page === 0}
                className="px-4 py-2 bg-[#f5f7fa] hover:bg-[#e2e8f0] disabled:opacity-50 disabled:cursor-not-allowed text-sm text-[#1a2b3c] rounded-lg flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Zurück
              </button>
              <span className="text-sm text-[#64748b]">
                Zeige {page * LIMIT + 1}-{Math.min((page + 1) * LIMIT, total)} von {total} Bildern
              </span>
              <button 
                onClick={nextPage}
                disabled={(page + 1) * LIMIT >= total}
                className="px-4 py-2 bg-[#f5f7fa] hover:bg-[#e2e8f0] disabled:opacity-50 disabled:cursor-not-allowed text-sm text-[#1a2b3c] rounded-lg flex items-center gap-2"
              >
                Weiter <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </main>

      {/* Lightbox */}
      {lightbox !== null && images[lightbox] && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <X size={24} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            disabled={lightbox === 0}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-full text-white"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img 
              src={`${API}${images[lightbox].url}`}
              alt={images[lightbox].filename}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <p className="text-white font-mono">{images[lightbox].id || images[lightbox].filename}</p>
              <p className="text-white/60 text-sm">{lightbox + 1} / {images.length}</p>
            </div>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            disabled={lightbox === images.length - 1}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-full text-white"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
