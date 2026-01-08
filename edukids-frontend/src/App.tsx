import React, { useState, useEffect } from 'react';
import {
    ShoppingCart, Plus, LogOut, X, Trash2,
    Filter, LayoutDashboard, Star, Menu, CheckCircle2, ChevronDown, BookOpen,
    ArrowRight, ShieldCheck, Heart, Sparkles, User, Briefcase, Rocket, TrendingUp,
    ChevronLeft, ChevronRight, Lock, Eye
} from 'lucide-react';

// --- DIŞARI AKTARILAN PANELLER ---
import ExpertDashboard from './ExpertDashboard';
import AdminPanel from './AdminPanel';

// --- CONFIG ---
const API_BASE = "http://localhost:5063/api";

// --- RENKLER ---
// Mor: #A49EC2, Sarı: #F7DCA1, Arka Plan: #F7E9CE, Mavi: #75AFBC, Pembe: #FABDAD

// --- TİPLER ---
type UserRole = 0 | 1 | 2; // 0: Admin, 1: Uzman, 2: Ebeveyn

interface UserType { id: number; name: string; email: string; role: UserRole; isActive: boolean; }
interface Product { id: number; name: string; category: number; ageGroup: number; price: number; description: string; stock: number; imageUrl?: string; isExpertApproved?: boolean; }
interface ChildProfile { id: number; parentId: number; name: string; age: number; interests: string; }

// --- SABİTLER ---
const CATEGORIES = ["Motor Beceriler", "Dil Gelişimi", "Bilişsel Zeka", "Sosyal Duygusal"];
const AGE_GROUPS = ["0-3 Yaş", "3-6 Yaş", "6-12 Yaş"];

const getPlaceholderImage = (catId: number) => {
    const images = [
        "https://images.unsplash.com/photo-1596464716127-f9a8625579c3?w=500&q=80",
        "https://images.unsplash.com/photo-1618842676088-7e43c69bc266?w=500&q=80",
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&q=80",
        "https://images.unsplash.com/photo-1515488042361-25f4682f0877?w=500&q=80"
    ];
    return images[catId % images.length] || images[0];
};

// --- MOCK VERİLER ---
const MOCK_PRODUCTS: Product[] = [
    { id: 1, name: "Yumuşak Duyu Blokları", category: 0, ageGroup: 0, price: 450, description: "Bebeğinizin dokunma duyusunu geliştiren yumuşak ve renkli bloklar.", stock: 15, isExpertApproved: true, imageUrl: "https://images.unsplash.com/photo-1596464716127-f9a8625579c3?w=500&q=80" },
    { id: 2, name: "Ahşap Şekil Eşleştirme", category: 2, ageGroup: 0, price: 320, description: "Problem çözme ve şekil tanıma yeteneklerini destekleyen klasik ahşap set.", stock: 12, isExpertApproved: true, imageUrl: "https://images.unsplash.com/photo-1618842676088-7e43c69bc266?w=500&q=80" },
    { id: 3, name: "Konuşan Kelime Kartları", category: 1, ageGroup: 1, price: 850, description: "Sesli telaffuz özelliği ile kelime dağarcığını geliştiren interaktif set.", stock: 5, isExpertApproved: true, imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&q=80" },
    { id: 4, name: "Duygu Kartları", category: 3, ageGroup: 1, price: 120, description: "50 farklı duygu durumu kartı ile sosyal zekayı destekler.", stock: 50, isExpertApproved: false, imageUrl: "https://images.unsplash.com/photo-1515488042361-25f4682f0877?w=500&q=80" },
    { id: 5, name: "Kodlama Robotu", category: 2, ageGroup: 2, price: 1250, description: "Algoritma mantığı öğreten sevimli robot arkadaş.", stock: 8, isExpertApproved: true, imageUrl: "https://images.unsplash.com/photo-1535378437327-b71494669e9d?w=500&q=80" },
    { id: 6, name: "Gökkuşağı Denge Oyunu", category: 0, ageGroup: 1, price: 280, description: "El-göz koordinasyonu için eğlenceli denge oyunu.", stock: 20, isExpertApproved: false, imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80" },
];
const MOCK_CHILDREN: ChildProfile[] = [{ id: 101, parentId: 1, name: "Can (Demo)", age: 4, interests: "Arabalar" }];

// --- YILDIZLI ARKA PLAN ---
const StarBackground = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Star className="absolute top-10 left-10 text-orange-300 opacity-40" size={48} fill="currentColor" />
        <Star className="absolute top-40 left-32 text-yumi-purple opacity-20" size={24} fill="currentColor" />
        <Star className="absolute top-20 right-20 text-yumi-blue opacity-30" size={56} fill="currentColor" />
        <Star className="absolute top-60 right-10 text-pink-300 opacity-40 animate-pulse" size={32} fill="currentColor" />
        <Star className="absolute top-1/3 left-1/4 text-yumi-yellow opacity-60" size={20} fill="currentColor" />
        <Star className="absolute bottom-1/3 right-1/4 text-yumi-purple opacity-20" size={40} fill="currentColor" />
        <Star className="absolute bottom-20 left-20 text-yumi-blue opacity-30" size={36} fill="currentColor" />
        <Star className="absolute bottom-40 right-32 text-orange-300 opacity-40" size={28} fill="currentColor" />
    </div>
);

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin, onAdminClick }: { onLogin: (user: UserType) => void, onAdminClick: () => void }) => {
    const [activeTab, setActiveTab] = useState<'parent' | 'expert'>('parent');
    const [loading, setLoading] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPass, setLoginPass] = useState("");

    const performLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            let role = activeTab === 'expert' ? 1 : 2;
            // Admin girişi buradan değil, URL'den veya gizli butondan yapılır ama yine de bırakalım
            if (loginEmail.includes('admin')) role = 0;
            onLogin({ id: role === 1 ? 11 : 101, name: loginEmail.split('@')[0] || "Kullanıcı", email: loginEmail, role: role, isActive: true });
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#F7E9CE] flex items-center justify-center p-4 relative">
            <StarBackground />
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-gray-100 relative overflow-hidden z-10">
                <div className="mb-6 flex flex-col items-center">
                    <div className="bg-[#A49EC2] p-3 rounded-2xl mb-3 shadow-lg shadow-purple-200"><User size={40} className="text-white" /></div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">YUMİ</h1>
                    <p className="text-gray-400 text-sm font-medium">Gelişim Odaklı Çocuk Market</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl mb-6 relative">
                    <button onClick={() => setActiveTab('parent')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'parent' ? 'bg-white text-[#A49EC2] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                        <User size={16} /> Ebeveyn
                    </button>
                    <button onClick={() => setActiveTab('expert')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'expert' ? 'bg-white text-[#75AFBC] shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                        <Briefcase size={16} /> Uzman
                    </button>
                </div>

                <form onSubmit={performLogin} className="space-y-4 mb-6 text-left">
                    <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={`w-full border border-gray-200 p-3 rounded-xl outline-none transition focus:ring-2 focus:ring-[#F7DCA1]`} placeholder={activeTab === 'expert' ? "uzman@sirket.com" : "anne@mail.com"} />
                    <input required type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} className={`w-full border border-gray-200 p-3 rounded-xl outline-none transition focus:ring-2 focus:ring-[#F7DCA1]`} placeholder="******" />
                    <button type="submit" disabled={loading} className={`w-full text-white py-3.5 rounded-xl font-bold transition hover:shadow-lg hover:scale-[1.02] active:scale-95 ${activeTab === 'expert' ? 'bg-[#75AFBC] hover:bg-[#6499A5] shadow-[#75AFBC]/30' : 'bg-[#A49EC2] hover:bg-[#938db0] shadow-[#A49EC2]/30'}`}>
                        {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>

                {/* Gizli Admin Girişi Linki */}
                <button onClick={onAdminClick} className="text-xs text-gray-300 hover:text-[#A49EC2] font-bold mt-4 uppercase tracking-widest transition">
                    Yönetici Girişi
                </button>
            </div>
        </div>
    );
};

// --- [YENİ] LANDING PAGE (VİTRİN + SLIDER) ---
const LandingPage = ({ onStartShopping, products }: { onStartShopping: () => void, products: Product[] }) => {
    const showcaseProducts = products.slice(0, 3);
    const [currentSlide, setCurrentSlide] = useState(0);

    const HERO_SLIDES = [
        {
            id: 1,
            title: "Hayal Gücünün Sınırı Yok!",
            subtitle: "YENİ SEZON",
            desc: "YUMI ile çocuklarınızın gelişimine katkıda bulunurken pedagog onaylı güvenli eğlencenin tadını çıkarın.",
            bgGradient: "from-[#FF9A9E] to-[#FECFEF]",
            badgeColor: "text-yellow-300",
            buttonColor: "text-[#A49EC2]",
            image: "https://images.unsplash.com/photo-1596464716127-f9a8625579c3?w=600&q=80"
        },
        {
            id: 2,
            title: "Minik Eller Büyük İşler!",
            subtitle: "MOTOR BECERİLER",
            desc: "İnce motor becerilerini geliştiren özel setlerle çocuğunuzun el-göz koordinasyonunu destekleyin.",
            bgGradient: "from-blue-200 to-cyan-100",
            badgeColor: "text-blue-500",
            buttonColor: "text-blue-500",
            image: "https://images.unsplash.com/photo-1515488042361-25f4682f0877?w=600&q=80"
        },
        {
            id: 3,
            title: "Doğayı Keşfetme Zamanı",
            subtitle: "BİLİM & DOĞA",
            desc: "Meraklı kaşifler için hazırlanan doğa dostu oyuncaklarla dünyayı öğrenin.",
            bgGradient: "from-green-200 to-emerald-100",
            badgeColor: "text-green-600",
            buttonColor: "text-green-600",
            image: "https://images.unsplash.com/photo-1535378437327-b71494669e9d?w=600&q=80"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [HERO_SLIDES.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));

    return (
        <div className="flex flex-col gap-16 pb-16">
            {/* HERO SLIDER */}
            <div className={`relative z-10 bg-gradient-to-r ${HERO_SLIDES[currentSlide].bgGradient} rounded-[2.5rem] p-8 md:p-12 border border-white shadow-sm overflow-hidden transition-all duration-700 ease-in-out`}>
                <div className="absolute top-0 right-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white backdrop-blur-sm transition z-20"><ChevronLeft size={24} /></button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white backdrop-blur-sm transition z-20"><ChevronRight size={24} /></button>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 min-h-[320px]">
                    <div className="flex-1 space-y-6 animate-in slide-in-from-left duration-500" key={currentSlide}>
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-white/40">
                            <Rocket size={14} className={HERO_SLIDES[currentSlide].badgeColor} /> {HERO_SLIDES[currentSlide].subtitle}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-sm">
                            {HERO_SLIDES[currentSlide].title}
                        </h1>
                        <p className="text-lg text-white/90 leading-relaxed max-w-lg">
                            {HERO_SLIDES[currentSlide].desc}
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button onClick={onStartShopping} className={`bg-white ${HERO_SLIDES[currentSlide].buttonColor} px-8 py-4 rounded-2xl font-bold text-lg hover:bg-opacity-90 transition shadow-lg shadow-black/10 flex items-center gap-2 transform hover:-translate-y-1`}>
                                Alışverişe Başla <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative hidden md:block animate-in zoom-in duration-700" key={`img-${currentSlide}`}>
                        <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl transform scale-75"></div>
                        <img src={HERO_SLIDES[currentSlide].image} alt="Slide" className="relative z-10 w-80 h-80 object-cover rounded-[2rem] shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500 border-4 border-white/50 mx-auto" />
                    </div>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {HERO_SLIDES.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`} />
                    ))}
                </div>
            </div>

            {/* Güven Sinyalleri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: ShieldCheck, color: "text-[#75AFBC]", bg: "bg-[#75AFBC]/10", title: "Uzman Onaylı", desc: "Her ürün pedagoglarımız tarafından gelişim kriterlerine göre incelenir." },
                    { icon: Heart, color: "text-[#FABDAD]", bg: "bg-[#FABDAD]/10", title: "Güvenli İçerik", desc: "Çocuk sağlığına zararlı hiçbir materyal içermeyen, sertifikalı ürünler." },
                    { icon: BookOpen, color: "text-[#A49EC2]", bg: "bg-[#A49EC2]/10", title: "Gelişim Rehberi", desc: "Hangi oyuncağın hangi yaşta hangi beceriyi desteklediğini öğrenin." }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition duration-300">
                        <div className={`${item.bg} ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}>
                            <item.icon size={32} />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Vitrin */}
            <div>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Çok Satanlar</h2>
                        <p className="text-gray-500 mt-1">Annelerin en çok tercih ettiği gelişim setleri.</p>
                    </div>
                    <button onClick={onStartShopping} className="text-[#A49EC2] font-bold hover:underline flex items-center gap-1">Tümünü Gör <ArrowRight size={16} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {showcaseProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-[2rem] border border-gray-100 p-4 hover:shadow-xl transition duration-300 group cursor-pointer" onClick={onStartShopping}>
                            <div className="h-64 relative rounded-2xl overflow-hidden bg-gray-50 mb-4">
                                <img src={getPlaceholderImage(product.category)} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                {product.isExpertApproved && (
                                    <div className="absolute top-3 right-3 bg-[#F7DCA1] text-yellow-900 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                                        <CheckCircle2 size={12} fill="currentColor" className="text-white" /> Uzman Onaylı
                                    </div>
                                )}
                            </div>
                            <div className="px-2 pb-2">
                                <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
                                <div className="text-[#75AFBC] font-black text-xl">₺{product.price}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- [ESKİ] SHOP PAGE (ÜRÜN LİSTELEME) ---
const ShopPage = ({ products, onAddToCartClick }: any) => {
    return (
        <div id="shop-top" className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* SIDEBAR (FİLTRELER) */}
            <div className="w-full lg:w-72 shrink-0 bg-white/90 p-6 rounded-[2rem] shadow-sm border border-white sticky top-24">
                <div className="flex items-center gap-2 mb-6 text-gray-800">
                    <Filter size={20} className="text-yumi-blue" />
                    <h3 className="font-bold text-lg">Filtreler</h3>
                </div>
                {/* Yaş Grubu */}
                <div className="mb-8">
                    <h4 className="font-bold text-gray-700 mb-3 text-sm">Yaş Grubu</h4>
                    <div className="space-y-2">
                        {AGE_GROUPS.map((age, i) => (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center group-hover:border-[#75AFBC] transition bg-white">
                                    <input type="checkbox" className="hidden peer" />
                                    <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100 bg-[#75AFBC] rounded-sm w-full h-full p-0.5 transition-all" />
                                </div>
                                <span className="text-gray-600 text-sm group-hover:text-[#75AFBC] transition font-medium">{age}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Gelişim Alanı */}
                <div>
                    <h4 className="font-bold text-gray-700 mb-3 text-sm">Gelişim Alanı</h4>
                    <div className="space-y-2">
                        {CATEGORIES.map((cat, i) => (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center group-hover:border-[#A49EC2] transition bg-white">
                                    <input type="checkbox" className="hidden peer" />
                                    <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100 bg-[#A49EC2] rounded-sm w-full h-full p-0.5 transition-all" />
                                </div>
                                <span className="text-gray-600 text-sm group-hover:text-[#A49EC2] transition font-medium">{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT (ÜRÜNLER) */}
            <div className="flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">Tüm Ürünler</h1>
                        <p className="text-gray-500 text-sm font-medium">{products.length} ürün listeleniyor</p>
                    </div>
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm">
                        Önerilen Sıralama <ChevronDown size={16} />
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product: Product) => (
                        <div key={product.id} className="bg-white rounded-[2rem] border border-white p-4 hover:shadow-xl hover:shadow-purple-100 transition duration-500 group flex flex-col h-full relative">
                            <div className="h-56 relative rounded-2xl overflow-hidden bg-gray-50 mb-4">
                                <img src={getPlaceholderImage(product.category)} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                {product.isExpertApproved && (
                                    <div className="absolute top-3 right-3 bg-[#F7DCA1] text-yellow-900 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md transform group-hover:scale-105 transition">
                                        <CheckCircle2 size={12} fill="currentColor" className="text-white" />
                                        Uzman Onaylı
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col px-1">
                                <div className="flex gap-2 mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A49EC2] bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                                        {CATEGORIES[product.category]}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                        {AGE_GROUPS[product.ageGroup]}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight group-hover:text-[#A49EC2] transition">{product.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">{product.description}</p>
                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className="text-2xl font-black text-gray-800">
                                        {product.price} <span className="text-sm font-bold text-gray-400">TL</span>
                                    </span>
                                    <button onClick={() => onAddToCartClick(product)} className="w-10 h-10 rounded-full bg-[#F7DCA1] text-yellow-900 flex items-center justify-center hover:bg-[#A49EC2] hover:text-white transition shadow-md hover:scale-110 active:scale-95">
                                        <Plus size={24} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- EBEVEYN PANELİ ---
const ParentPanel = ({ products, user, onAddToCart }: any) => {
    const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'kids'>('home');
    const [children, setChildren] = useState<ChildProfile[]>(MOCK_CHILDREN);
    const [newChildName, setNewChildName] = useState("");

    const handleAddChild = () => {
        setChildren([...children, { id: Date.now(), parentId: user.id, name: newChildName, age: 3, interests: "Oyun" }]);
        setNewChildName("");
    };

    const handleGoToShop = () => {
        setActiveTab('shop');
        setTimeout(() => {
            document.getElementById('shop-top')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div>
            <div className="flex justify-center mb-8 sticky top-24 z-20">
                <div className="bg-white/90 backdrop-blur p-1.5 rounded-2xl shadow-sm border border-white inline-flex gap-2">
                    <button onClick={() => setActiveTab('home')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${activeTab === 'home' ? 'bg-[#F7DCA1] text-yellow-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Star size={16} /> Vitrin
                    </button>
                    <button onClick={() => setActiveTab('shop')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${activeTab === 'shop' ? 'bg-[#A49EC2] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <ShoppingCart size={16} /> Mağaza
                    </button>
                    <button onClick={() => setActiveTab('kids')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${activeTab === 'kids' ? 'bg-[#75AFBC] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <User size={16} /> Çocuklarım
                    </button>
                </div>
            </div>

            {activeTab === 'home' && <LandingPage onStartShopping={handleGoToShop} products={products} />}
            {activeTab === 'shop' && <ShopPage products={products} onAddToCartClick={onAddToCart} />}

            {activeTab === 'kids' && (
                <div className="space-y-6 pb-12">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-white flex gap-2 items-center">
                        <input className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-[#75AFBC]" placeholder="Çocuk Adı" value={newChildName} onChange={e => setNewChildName(e.target.value)} />
                        <button onClick={handleAddChild} className="bg-[#75AFBC] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#6499A5] transition">Ekle</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {children.map(c => (
                            <div key={c.id} className="bg-white p-5 rounded-3xl border border-white shadow-sm flex justify-between items-center hover:border-[#FABDAD] transition">
                                <div className="flex items-center gap-4"><div className="bg-[#FABDAD] p-4 rounded-2xl text-white"><User size={24} /></div><div><h3 className="font-bold text-gray-800 text-lg">{c.name}</h3><p className="text-sm text-gray-500">{c.age} Yaşında</p></div></div>
                                <button className="text-gray-300 hover:text-red-400 p-2"><Trash2 size={20} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- ANA APP ---
export default function App() {
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<Product[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(window.location.hash === '#admin');

    useEffect(() => {
        const handleHash = () => setIsAdminMode(window.location.hash === '#admin');
        window.addEventListener('hashchange', handleHash);

        const mockProducts = [
            { id: 1, name: "Ahşap Şekil Seti", category: 2, ageGroup: 0, price: 450, stock: 15, description: "Motor becerileri geliştiren doğal ahşap set." },
            { id: 2, name: "Duygu Kartları", category: 1, ageGroup: 1, price: 120, stock: 50, description: "50 farklı duygu durumu kartı." },
        ];
        setProducts(mockProducts);
        return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    const handleAddToCart = (product: Product) => {
        setCart([...cart, product]);
    };

    const handleCheckout = () => {
        if (!currentUser) {
            setShowCart(false);
            setShowAuthModal(true);
        } else {
            alert("Sipariş başarıyla oluşturuldu! 🎉");
            setCart([]);
            setShowCart(false);
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        if (isAdminMode) {
            window.location.hash = ''; // Hash'i temizle
            setIsAdminMode(false);
        }
    };

    if (isAdminMode) {
        return <AdminPanel products={products} setProducts={setProducts} onLogout={handleLogout} />;
    }

    // Kullanıcı girişi yoksa LoginScreen göster
    if (!currentUser) {
        return (
            <LoginScreen
                onLogin={setCurrentUser}
                onGoAdmin={() => {
                    window.location.hash = 'admin';
                    setIsAdminMode(true);
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFDF7] font-sans text-gray-600 relative">
            <StarBackground />

            {/* NAVBAR */}
            <nav className="bg-[#FFFDF7]/95 backdrop-blur-sm sticky top-0 z-30 border-b border-[#FFFDF7] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition duration-300">
                        <div className="bg-[#A49EC2] p-1.5 rounded-lg text-white"><User size={24} /></div>
                        <span className="font-black text-3xl text-[#A49EC2] tracking-tighter hidden sm:block drop-shadow-sm">YUMI</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 font-bold text-[#75AFBC]">
                        <a href="#" className="hover:text-[#A49EC2] transition">Hakkımızda</a>
                        <a href="#" className="hover:text-[#A49EC2] transition">Blog</a>
                        <a href="#" className="hover:text-[#A49EC2] transition">İletişim</a>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-[#FABDAD] rounded-full flex items-center justify-center text-xl text-white">👤</div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-800 leading-none">{currentUser.name}</p>
                                    <p className="text-[10px] uppercase font-bold text-[#A49EC2] tracking-wide">{currentUser.role === 0 ? "Admin" : currentUser.role === 1 ? "Uzman" : "Ebeveyn"}</p>
                                </div>
                                <button onClick={handleLogout} className="ml-2 p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition" title="Çıkış"><LogOut size={18} /></button>
                            </div>
                        ) : (
                            <button onClick={() => setShowAuthModal(true)} className="hidden sm:block text-sm font-bold text-[#75AFBC] hover:text-[#A49EC2] transition px-4 py-2 rounded-full hover:bg-white/50">Giriş Yap</button>
                        )}

                        <button onClick={() => setShowCart(true)} className="relative p-3 text-[#75AFBC] hover:text-[#A49EC2] transition bg-white/80 rounded-full shadow-sm hover:shadow-md border border-white">
                            <ShoppingCart size={24} />
                            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-white animate-bounce">{cart.length}</span>}
                        </button>

                        <button className="md:hidden p-2 text-[#75AFBC]"><Menu size={28} /></button>
                    </div>
                </div>
            </nav>

            {/* MODALS */}
            {showAuthModal && <AuthModal onLogin={setCurrentUser} onClose={() => setShowAuthModal(false)} />}

            {/* SEPET MODAL */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex justify-end backdrop-blur-sm bg-[#A49EC2]/10">
                    <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right border-l-4 border-yumi-blue">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ShoppingCart className="text-yumi-blue" /> Sepetim</h2>
                            <button onClick={() => setShowCart(false)} className="hover:bg-red-50 text-gray-400 p-2 rounded-full transition"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-center bg-white border border-yumi-skin p-3 rounded-2xl shadow-sm">
                                    <img src={item.imageUrl || getPlaceholderImage(item.category)} className="w-16 h-16 rounded-xl object-cover" />
                                    <div className="flex-1"><div className="font-bold text-gray-800">{item.name}</div><div className="text-yumi-blue font-bold">₺{item.price}</div></div>
                                    <button onClick={() => { const n = [...cart]; n.splice(idx, 1); setCart(n); }} className="text-red-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 border-t border-yumi-skin bg-gray-50">
                            <div className="flex justify-between font-bold text-xl mb-4 text-gray-800"><span>Toplam</span><span>₺{cart.reduce((a, b) => a + b.price, 0)}</span></div>
                            <button className="w-full bg-yumi-blue text-white py-4 rounded-xl font-bold shadow-lg">Ödemeyi Tamamla</button>
                        </div>
                    </div>
                </div>
            )}

            {/* İÇERİK */}
            <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                {currentUser?.role === 1 ? (
                    <ExpertDashboard products={products} user={currentUser} />
                ) : (
                    /* Ebeveyn veya Misafir (Landing/Shop) */
                    <ParentPanel products={products} user={currentUser || { id: 0, name: 'Misafir', email: '', role: 2, isActive: true }} onAddToCart={handleAddToCart} />
                )}
            </main>
        </div>
    );
}