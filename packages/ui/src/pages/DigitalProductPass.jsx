import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, Package, CheckCircle, XCircle, Image, FileText, GitBranch, 
  Layers, Tag, Settings, Download, Share2, QrCode, Zap, Clock, 
  ChevronRight, ExternalLink, FileCheck, Award, Leaf, Recycle
} from "lucide-react";

const API = `http://${window.location.hostname}:8766`;

// Animated loading card component
const LoadingCard = ({ title, icon: Icon, delay = 0 }) => (
  <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm animate-pulse" 
       style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-[#e2e8f0] flex items-center justify-center">
        <Icon size={20} className="text-[#94a3b8]" />
      </div>
      <div className="h-5 bg-[#e2e8f0] rounded w-32" />
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-[#f5f7fa] rounded w-full" />
      <div className="h-3 bg-[#f5f7fa] rounded w-3/4" />
    </div>
  </div>
);

// Animated data card that floats in
const DataCard = ({ title, icon: Icon, color, children, loaded, delay = 0 }) => (
  <div 
    className={`bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden transition-all duration-500 ${
      loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <h3 className="font-medium text-[#1a2b3c]">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// Image gallery with lazy loading
const ImageGallery = ({ images, onSelect }) => {
  const [loadedImages, setLoadedImages] = useState({});
  
  return (
    <div className="grid grid-cols-4 gap-3">
      {images.slice(0, 8).map((img, i) => (
        <div 
          key={img.id || i}
          onClick={() => onSelect(img)}
          className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:border-[#0066cc] hover:shadow-lg ${
            loadedImages[i] ? "border-[#e2e8f0]" : "border-transparent bg-[#f5f7fa]"
          }`}
        >
          <img 
            src={img.url || `${API}/api/media/serve/${img.extracted_file_path?.split('/extracted_images/')[1] || ''}`}
            alt={img.description || img.filename}
            className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages[i] ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoadedImages(prev => ({ ...prev, [i]: true }))}
            onError={(e) => { e.target.src = `https://placehold.co/200x200/f5f7fa/94a3b8?text=${img.media_category || 'Image'}`; setLoadedImages(prev => ({ ...prev, [i]: true })); }}
          />
        </div>
      ))}
      {images.length > 8 && (
        <div className="aspect-square rounded-lg bg-[#f5f7fa] flex items-center justify-center cursor-pointer hover:bg-[#e2e8f0] transition-colors">
          <span className="text-[#64748b] font-medium">+{images.length - 8}</span>
        </div>
      )}
    </div>
  );
};

export default function DigitalProductPass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState({ product: true, media: true, features: true, relations: true });
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Staggered data loading for visual effect
  useEffect(() => {
    if (!id) return;

    // Load product data with staggered reveals
    const loadData = async () => {
      try {
        const res = await fetch(`${API}/api/products/${id}/full`);
        const fullData = await res.json();
        
        // Stagger the loading states for animation
        setTimeout(() => {
          setData(prev => ({ ...prev, product: fullData.product }));
          setLoading(prev => ({ ...prev, product: false }));
        }, 200);
        
        setTimeout(() => {
          setData(prev => ({ ...prev, media: fullData.media }));
          setLoading(prev => ({ ...prev, media: false }));
        }, 600);
        
        setTimeout(() => {
          setData(prev => ({ ...prev, features: fullData.features, etim: fullData.etim }));
          setLoading(prev => ({ ...prev, features: false }));
        }, 1000);
        
        setTimeout(() => {
          setData(prev => ({ ...prev, relationships: fullData.relationships, documents: fullData.documents }));
          setLoading(prev => ({ ...prev, relations: false }));
        }, 1400);
        
      } catch (e) {
        console.error(e);
        // Fallback to search
        const searchRes = await fetch(`${API}/api/products/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: id, limit: 1 })
        });
        const searchData = await searchRes.json();
        if (searchData.products?.[0]) {
          setData({ product: searchData.products[0], media: { images: [], pdfs: [] }, features: [], relationships: [] });
        }
        setLoading({ product: false, media: false, features: false, relations: false });
      }
    };
    
    loadData();
  }, [id]);

  const product = data?.product;
  const isActive = product?.product_status === "active" || product?.product_status === "Aktiv";

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-[#1e2a38] to-[#2d3a4a] text-white">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold">Digital Product Pass</h1>
                  <span className="px-2 py-0.5 bg-[#0066cc] rounded text-xs font-medium">EU DPP</span>
                </div>
                <p className="text-sm text-white/60">Complete product lifecycle documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Download PDF">
                <Download size={20} />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Share">
                <Share2 size={20} />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="QR Code">
                <QrCode size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Hero */}
        <div className="px-6 py-8">
          <div className="flex items-start gap-8">
            {/* Main Image */}
            <div className="w-48 h-48 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {data?.media?.images?.[0] ? (
                <img 
                  src={data.media.images[0].url || `${API}/api/media/serve/${data.media.images[0].extracted_file_path?.split('/extracted_images/')[1] || ''}`}
                  alt={product?.description_short}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <Package size={64} className="text-white/20" />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-2xl font-bold">{id}</span>
                {!loading.product && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isActive ? "bg-[#059669] text-white" : "bg-[#dc2626] text-white"
                  }`}>
                    {isActive ? "Active" : "Discontinued"}
                  </span>
                )}
              </div>
              
              {loading.product ? (
                <div className="space-y-2">
                  <div className="h-6 bg-white/10 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-lg text-white/90 mb-4">{product?.description_short}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-white/60">
                    {product?.manufacturer_name && (
                      <span className="flex items-center gap-2">
                        <Tag size={14} /> {product.manufacturer_name}
                      </span>
                    )}
                    {data?.etim?.etim_class_id && (
                      <span className="flex items-center gap-2">
                        <Layers size={14} /> {data.etim.etim_class_id}
                      </span>
                    )}
                    {data?.media?.total > 0 && (
                      <span className="flex items-center gap-2">
                        <Image size={14} /> {data.media.images?.length || 0} Images
                      </span>
                    )}
                    {data?.features?.length > 0 && (
                      <span className="flex items-center gap-2">
                        <Settings size={14} /> {data.features.length} Specs
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <Leaf className="mx-auto mb-2 text-[#059669]" size={24} />
                <div className="text-xs text-white/60">Carbon Score</div>
                <div className="font-semibold">A+</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <Recycle className="mx-auto mb-2 text-[#0066cc]" size={24} />
                <div className="text-xs text-white/60">Recyclable</div>
                <div className="font-semibold">87%</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <Award className="mx-auto mb-2 text-[#ea580c]" size={24} />
                <div className="text-xs text-white/60">Certified</div>
                <div className="font-semibold">CE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-1">
          {["overview", "media", "specs", "documents", "sustainability"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab ? "bg-[#f5f7fa] text-[#1a2b3c]" : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-8 space-y-6">
              {/* Images */}
              <DataCard title="Product Images" icon={Image} color="#0066cc" loaded={!loading.media} delay={0}>
                {data?.media?.images?.length > 0 ? (
                  <ImageGallery images={data.media.images} onSelect={setSelectedImage} />
                ) : (
                  <div className="text-center py-8 text-[#64748b]">
                    <Image className="mx-auto mb-2 text-[#e2e8f0]" size={32} />
                    <p>No images available</p>
                  </div>
                )}
              </DataCard>

              {/* Technical Specifications */}
              <DataCard title="Technical Specifications" icon={Settings} color="#7c3aed" loaded={!loading.features} delay={200}>
                {data?.features?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {data.features.slice(0, 12).map((f, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-[#e2e8f0]">
                        <span className="text-sm text-[#64748b]">{f.feature_name}</span>
                        <span className="text-sm font-medium text-[#1a2b3c]">
                          {f.feature_value} {f.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-[#64748b]">Loading specifications...</div>
                )}
                {data?.features?.length > 12 && (
                  <button className="mt-4 text-sm text-[#0066cc] hover:underline">
                    Show all {data.features.length} specifications
                  </button>
                )}
              </DataCard>

              {/* Relationships */}
              <DataCard title="Related Products" icon={GitBranch} color="#059669" loaded={!loading.relations} delay={400}>
                {data?.relationships?.length > 0 ? (
                  <div className="space-y-2">
                    {data.relationships.slice(0, 5).map((r, i) => (
                      <Link 
                        key={i} 
                        to={`/dpp/${r.related_pid}`}
                        className="flex items-center justify-between p-3 bg-[#f5f7fa] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                      >
                        <div>
                          <span className="font-mono text-[#0066cc] text-sm">{r.related_pid}</span>
                          <p className="text-xs text-[#64748b] truncate max-w-md">{r.related_desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-white rounded text-xs text-[#64748b]">{r.relationship_type}</span>
                          <ChevronRight size={16} className="text-[#94a3b8]" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-[#64748b]">Loading relationships...</div>
                )}
              </DataCard>
            </div>

            {/* Right Column */}
            <div className="col-span-4 space-y-6">
              {/* Quick Info */}
              <DataCard title="Product Information" icon={FileCheck} color="#ea580c" loaded={!loading.product} delay={100}>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-[#e2e8f0]">
                    <span className="text-sm text-[#64748b]">Product ID</span>
                    <span className="text-sm font-mono font-medium text-[#1a2b3c]">{id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#e2e8f0]">
                    <span className="text-sm text-[#64748b]">GTIN</span>
                    <span className="text-sm font-mono text-[#1a2b3c]">{product?.gtin || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#e2e8f0]">
                    <span className="text-sm text-[#64748b]">Manufacturer</span>
                    <span className="text-sm text-[#1a2b3c]">{product?.manufacturer_name || "Bosch"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#e2e8f0]">
                    <span className="text-sm text-[#64748b]">Status</span>
                    <span className={`text-sm font-medium ${isActive ? "text-[#059669]" : "text-[#dc2626]"}`}>
                      {product?.product_status || "—"}
                    </span>
                  </div>
                  {data?.etim && (
                    <>
                      <div className="flex justify-between py-2 border-b border-[#e2e8f0]">
                        <span className="text-sm text-[#64748b]">ETIM Class</span>
                        <span className="text-sm text-[#1a2b3c]">{data.etim.etim_class_id}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-[#64748b]">ETIM Group</span>
                        <span className="text-sm text-[#1a2b3c]">{data.etim.etim_group_id}</span>
                      </div>
                    </>
                  )}
                </div>
              </DataCard>

              {/* Documents */}
              <DataCard title="Documents" icon={FileText} color="#0891b2" loaded={!loading.relations} delay={300}>
                {data?.media?.pdfs?.length > 0 ? (
                  <div className="space-y-2">
                    {data.media.pdfs.slice(0, 5).map((pdf, i) => (
                      <a 
                        key={i}
                        href={pdf.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-[#f5f7fa] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                      >
                        <FileText size={20} className="text-[#dc2626] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#1a2b3c] truncate">{pdf.filename}</div>
                          <div className="text-xs text-[#64748b]">{pdf.media_category}</div>
                        </div>
                        <ExternalLink size={14} className="text-[#94a3b8]" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-[#64748b]">
                    <FileText className="mx-auto mb-2 text-[#e2e8f0]" size={24} />
                    <p className="text-sm">No documents available</p>
                  </div>
                )}
              </DataCard>

              {/* Compliance */}
              <DataCard title="Compliance & Certifications" icon={Award} color="#059669" loaded={!loading.product} delay={500}>
                <div className="flex flex-wrap gap-2">
                  {["CE", "RoHS", "REACH", "Energy Label", "ISO 14001"].map(cert => (
                    <span key={cert} className="px-3 py-1.5 bg-[#059669]/10 text-[#059669] rounded-lg text-sm font-medium">
                      {cert}
                    </span>
                  ))}
                </div>
              </DataCard>
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <h2 className="text-lg font-medium text-[#1a2b3c] mb-4">All Media ({data?.media?.total || 0})</h2>
            {data?.media?.images?.length > 0 ? (
              <div className="grid grid-cols-6 gap-4">
                {data.media.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden border border-[#e2e8f0] hover:border-[#0066cc] cursor-pointer transition-colors">
                    <img 
                      src={img.url || `${API}/api/media/serve/${img.extracted_file_path?.split('/extracted_images/')[1] || ''}`}
                      alt={img.description || img.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = `https://placehold.co/200x200/f5f7fa/94a3b8?text=${img.media_category || 'Image'}`; }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#64748b]">No media files available</div>
            )}
          </div>
        )}

        {activeTab === "specs" && (
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <h2 className="text-lg font-medium text-[#1a2b3c] mb-4">Technical Specifications</h2>
            {data?.features?.length > 0 ? (
              <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                {data.features.map((f, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-[#e2e8f0]">
                    <span className="text-sm text-[#64748b]">{f.feature_name}</span>
                    <span className="text-sm font-medium text-[#1a2b3c]">{f.feature_value} {f.unit}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#64748b]">No specifications available</div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
            <h2 className="text-lg font-medium text-[#1a2b3c] mb-4">Documents & Manuals</h2>
            <div className="grid grid-cols-2 gap-4">
              {data?.media?.pdfs?.map((pdf, i) => (
                <a key={i} href={pdf.url || "#"} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-4 p-4 border border-[#e2e8f0] rounded-xl hover:border-[#0066cc] transition-colors">
                  <FileText size={32} className="text-[#dc2626]" />
                  <div>
                    <div className="font-medium text-[#1a2b3c]">{pdf.filename}</div>
                    <div className="text-sm text-[#64748b]">{pdf.media_category}</div>
                  </div>
                </a>
              )) || <div className="col-span-2 text-center py-12 text-[#64748b]">No documents available</div>}
            </div>
          </div>
        )}

        {activeTab === "sustainability" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
              <Leaf className="text-[#059669] mb-4" size={32} />
              <h3 className="font-medium text-[#1a2b3c] mb-2">Carbon Footprint</h3>
              <div className="text-3xl font-bold text-[#059669] mb-1">A+</div>
              <p className="text-sm text-[#64748b]">Low environmental impact</p>
            </div>
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
              <Recycle className="text-[#0066cc] mb-4" size={32} />
              <h3 className="font-medium text-[#1a2b3c] mb-2">Recyclability</h3>
              <div className="text-3xl font-bold text-[#0066cc] mb-1">87%</div>
              <p className="text-sm text-[#64748b]">Materials can be recycled</p>
            </div>
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
              <Zap className="text-[#ea580c] mb-4" size={32} />
              <h3 className="font-medium text-[#1a2b3c] mb-2">Energy Efficiency</h3>
              <div className="text-3xl font-bold text-[#ea580c] mb-1">A+++</div>
              <p className="text-sm text-[#64748b]">Highest efficiency class</p>
            </div>
          </div>
        )}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8" onClick={() => setSelectedImage(null)}>
          <img 
            src={selectedImage.url || `${API}/api/media/serve/${selectedImage.extracted_file_path?.split('/extracted_images/')[1] || ''}`}
            alt={selectedImage.description}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
