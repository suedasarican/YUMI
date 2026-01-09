import React, { useState, useEffect } from 'react';
import {
    ShoppingCart, Plus, LogOut, X, Trash2,
    Filter, LayoutDashboard, Star, Menu, CheckCircle2, ChevronDown, BookOpen,
    ArrowRight, ShieldCheck, Heart, Sparkles, User, Briefcase, Rocket, TrendingUp,
    ChevronLeft, ChevronRight, Lock, Eye, Calendar, Stethoscope,
    CalendarCheck, Search, Instagram, Twitter, Facebook, Clock, FileText, MessageCircle,
    Info // <--- BURAYA BUNU EKLE
} from 'lucide-react';
import logoParent from './assets/logo.png';
import logoExpert from './assets/expert-logo.png'; // Uzman için de aynısını koydum, farklıysa değiştir.
import ExpertDashboard from './ExpertDashboard';
import AdminPanel from './AdminPanel';

import sliderResim1 from './assets/p1.jpeg';
import sliderResim2 from './assets/p2.jpeg';
import sliderResim3 from './assets/p3.jpeg';
// --- CONFIG ---
const API_BASE = "http://localhost:5063/api";
// Diğer importların altına ekle:
import psikologImg from './assets/psikolog.jpeg';
// --- TİPLER ---
type UserRole = 0 | 1 | 2; // 0: Admin, 1: Uzman, 2: Ebeveyn

interface UserType { id: number; name: string; email: string; role: UserRole; isActive: boolean; }
interface Product { id: number; name: string; category: number; ageGroup: number; price: number; description: string; stock: number; imageUrl?: string; isExpertApproved?: boolean; }

// UZMAN PROFİL TİPİ
interface ExpertProfile {
    id: number;
    name: string;
    title?: string; // Soru işareti (?) ekledik, null gelebilir
    bio?: string;
    imageUrl?: string;
    expertise?: string[]; // Bu da null gelebilir
}

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


// --- GÜNCELLENMİŞ LOGIN SCREEN (DOSYA IMPORTLU) ---
const LoginScreen = ({ onLogin, onAdminClick }: { onLogin: (user: UserType) => void, onAdminClick: () => void }) => {

    const [activeTab, setActiveTab] = useState<'parent' | 'expert'>('parent');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form Verileri
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleTabChange = (tab: 'parent' | 'expert') => {
        setActiveTab(tab);
        setIsRegistering(false);
        setError("");
        setEmail("");
        setPassword("");
        setName("");
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!isRegistering && email.includes('admin')) {
                onAdminClick();
                return;
            }

            const endpoint = isRegistering ? '/auth/register' : '/auth/login';

            const payload = isRegistering
                ? { name, email, passwordHash: password, role: 2, isActive: true }
                : { email, password };

            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                onLogin(data);
            } else {
                setError(isRegistering ? "Kayıt yapılamadı." : "Giriş başarısız. Bilgilerinizi kontrol edin.");
            }

        } catch (err) {
            console.error(err);
            setError("Sunucuya bağlanılamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7E9CE] flex items-center justify-center p-4 relative font-sans">
            <StarBackground />

            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border border-white/50 relative overflow-hidden z-10 animate-in fade-in zoom-in duration-300">

                {/* --- LOGO ALANI --- */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="relative group">
                        {/* Arkadaki parıltı efekti */}
                        <div className={`absolute -inset-6 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 ${activeTab === 'parent' ? 'bg-[#A49EC2]' : 'bg-[#75AFBC]'}`}></div>

                        {/* Logo boyutu w-64 h-64 olarak büyütüldü */}
                        <img
                            src={activeTab === 'parent' ? logoParent : logoExpert}
                            alt="YUMI Logo"
                            className="relative w-64 h-64 object-contain transition-all duration-500 transform hover:scale-105 drop-shadow-2xl"
                        />
                    </div>

                    {/* YUMİ Yazısı Kaldırıldı, Alt slogan duruyor */}
                    <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-4">
                        {activeTab === 'parent' ? 'Gelişim Odaklı Çocuk Market' : 'Uzman Danışman Paneli'}
                    </p>
                </div>

                {/* SEKME (TAB) BUTONLARI */}
                <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 relative border border-gray-100">
                    <button
                        onClick={() => handleTabChange('parent')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'parent' ? 'bg-white text-[#A49EC2] shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <User size={18} /> Ebeveyn
                    </button>
                    <button
                        onClick={() => handleTabChange('expert')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'expert' ? 'bg-white text-[#75AFBC] shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Briefcase size={18} /> Uzman
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleAuth} className="space-y-4 mb-6 text-left">

                    {isRegistering && activeTab === 'parent' && (
                        <div className="animate-in slide-in-from-top-2">
                            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl outline-none transition focus:ring-2 focus:ring-[#FABDAD] focus:bg-white text-gray-700 font-bold placeholder:font-normal" placeholder="Adınız Soyadınız" />
                        </div>
                    )}

                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl outline-none transition focus:ring-2 focus:ring-[#F7DCA1] focus:bg-white text-gray-700 font-bold placeholder:font-normal" placeholder="E-posta Adresi" />

                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl outline-none transition focus:ring-2 focus:ring-[#F7DCA1] focus:bg-white text-gray-700 font-bold placeholder:font-normal" placeholder="Şifre" />

                    {error && <p className="text-red-500 text-sm font-bold ml-1 animate-pulse">{error}</p>}

                    <button type="submit" disabled={loading} className={`w-full text-white py-4 rounded-2xl font-black text-lg transition hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-4 ${activeTab === 'expert' ? 'bg-[#75AFBC] hover:bg-[#6499A5] shadow-[#75AFBC]/30' : 'bg-[#A49EC2] hover:bg-[#938db0] shadow-[#A49EC2]/30'}`}>
                        {loading ? "İşlem Yapılıyor..." : (isRegistering ? "Kayıt Ol" : "Giriş Yap")}
                    </button>
                </form>

                {/* ALT LİNKLER */}
                <div className="text-sm font-medium text-gray-500">
                    {activeTab === 'parent' ? (
                        <>
                            {isRegistering ? "Zaten hesabınız var mı? " : "Hesabınız yok mu? "}
                            <button onClick={() => setIsRegistering(!isRegistering)} className="text-[#A49EC2] font-bold hover:underline ml-1">
                                {isRegistering ? "Giriş Yap" : "Hemen Kayıt Ol"}
                            </button>
                        </>
                    ) : (
                        <div className="p-3 bg-blue-50 text-[#75AFBC] rounded-xl text-xs leading-relaxed flex items-start gap-2 text-left">
                            <Info size={16} className="shrink-0 mt-0.5" />
                            <span>Uzman hesapları sadece <strong>Yumi Yönetimi</strong> tarafından oluşturulabilir.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};




// --- LANDING PAGE ---
// --- GÜNCELLENMİŞ LANDING PAGE (ESKİ TASARIM + YENİ BLOG) ---
// --- GÜNCELLENMİŞ LANDING PAGE (LOGO STİLİ SLIDER İLE) ---
const LandingPage = ({ onStartShopping, products }: { onStartShopping: () => void, products: Product[] }) => {
    // 1. STATE VE TANIMLAR
    const showcaseProducts = products.slice(0, 3);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<any | null>(null);

    // SENİN SLIDER VERİLERİN (image kısımları sen değiştirene kadar placeholder olarak kalır)
    const HERO_SLIDES = [
        {
            id: 1,
            title: "Hayal Gücünün Sınırı Yok!",
            subtitle: "YENİ SEZON",
            desc: "YUMI ile çocuklarınızın gelişimine katkıda bulunurken pedagog onaylı güvenli eğlencenin tadını çıkarın.",
            bgGradient: "from-[#FF9A9E] to-[#FECFEF]",
            badgeColor: "text-yellow-300",
            buttonColor: "text-[#A49EC2]",
            image: sliderResim1
        },
        {
            id: 2,
            title: "Minik Eller Büyük İşler!",
            subtitle: "MOTOR BECERİLER",
            desc: "İnce motor becerilerini geliştiren özel setlerle çocuğunuzun el-göz koordinasyonunu destekleyin.",
            bgGradient: "from-blue-200 to-cyan-100",
            badgeColor: "text-blue-500",
            buttonColor: "text-blue-500",
            // Odaklanmış çocuk ve eğitici montessori materyalleri
            image: sliderResim2
        },
        {
            id: 3,
            title: "Doğayı Keşfetme Zamanı",
            subtitle: "BİLİM & DOĞA",
            desc: "Meraklı kaşifler için hazırlanan doğa dostu oyuncaklarla dünyayı öğrenin.",
            bgGradient: "from-green-200 to-emerald-100",
            badgeColor: "text-green-600",
            buttonColor: "text-green-600",
            image: sliderResim3
        }
    ];


    // 2. VERİ ÇEKME
    useEffect(() => {
        fetch(`${API_BASE}/blog`)
            .then(res => res.json())
            .then(data => {
                const publishedBlogs = data.filter((b: any) => b.status?.toLowerCase() === 'published');
                setBlogs(publishedBlogs);
            })
            .catch(err => console.error("Bloglar çekilemedi", err));
    }, []);

    // Otomatik Kaydırma
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));

    return (
        <div className="flex flex-col gap-16 pb-16 relative">

            {/* --- BÖLÜM 1: HERO SLIDER (GÜNCELLENDİ) --- */}
            <div className={`relative z-10 bg-gradient-to-r ${HERO_SLIDES[currentSlide].bgGradient} rounded-[2.5rem] p-8 md:p-12 border border-white shadow-sm overflow-hidden transition-all duration-700 ease-in-out group`}>
                <div className="absolute top-0 right-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                {/* Oklar */}
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white backdrop-blur-sm transition z-20 opacity-0 group-hover:opacity-100"><ChevronLeft size={24} /></button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white backdrop-blur-sm transition z-20 opacity-0 group-hover:opacity-100"><ChevronRight size={24} /></button>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 min-h-[320px]">

                    {/* SOL METİN ALANI */}
                    <div className="flex-1 space-y-6 animate-in slide-in-from-left duration-500" key={currentSlide}>
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-white/40">
                            <Rocket size={14} className={HERO_SLIDES[currentSlide].badgeColor} /> {HERO_SLIDES[currentSlide].subtitle}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-sm">{HERO_SLIDES[currentSlide].title}</h1>
                        <p className="text-lg text-white/90 leading-relaxed max-w-lg">{HERO_SLIDES[currentSlide].desc}</p>
                        <div className="flex gap-4 pt-4">
                            <button onClick={onStartShopping} className={`bg-white ${HERO_SLIDES[currentSlide].buttonColor} px-8 py-4 rounded-2xl font-bold text-lg hover:bg-opacity-90 transition shadow-lg shadow-black/10 flex items-center gap-2 transform hover:-translate-y-1`}>
                                Alışverişe Başla <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* --- GÜNCELLENEN KISIM: SAĞ GÖRSEL ALANI (LOGO STİLİ) --- */}
                    {/* 'object-cover' yerine 'object-contain' yapıldı ve arka plan blur efekti eklendi */}
                    <div className="flex-1 relative hidden md:flex items-center justify-center animate-in zoom-in duration-700" key={`img-${currentSlide}`}>
                        <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl transform scale-75"></div>
                        <img
                            src={HERO_SLIDES[currentSlide].image}
                            alt="Slide"
                            className="relative z-10 w-80 h-80 object-contain rounded-[2rem] shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500 border-4 border-white/50 mx-auto bg-white/10 backdrop-blur-sm p-6"
                        />
                    </div>
                    {/* -------------------------------------------------------- */}

                </div>

                {/* Slider Noktaları */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {HERO_SLIDES.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`} />
                    ))}
                </div>
            </div>

            {/* --- BÖLÜM 2: ÖZELLİK KARTLARI --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: ShieldCheck, color: "text-[#75AFBC]", bg: "bg-[#75AFBC]/10", title: "Uzman Onaylı", desc: "Her ürün pedagoglarımız tarafından gelişim kriterlerine göre incelenir." },
                    { icon: Heart, color: "text-[#FABDAD]", bg: "bg-[#FABDAD]/10", title: "Güvenli İçerik", desc: "Çocuk sağlığına zararlı hiçbir materyal içermeyen, sertifikalı ürünler." },
                    { icon: BookOpen, color: "text-[#A49EC2]", bg: "bg-[#A49EC2]/10", title: "Gelişim Rehberi", desc: "Hangi oyuncağın hangi yaşta hangi beceriyi desteklediğini öğrenin." }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition duration-300">
                        <div className={`${item.bg} ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}><item.icon size={32} /></div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* --- BÖLÜM 3: ÇOK SATANLAR --- */}
            <div>
                <div className="flex justify-between items-end mb-8">
                    <div><h2 className="text-3xl font-bold text-gray-800">Çok Satanlar</h2><p className="text-gray-500 mt-1">Annelerin en çok tercih ettiği gelişim setleri.</p></div>
                    <button onClick={onStartShopping} className="text-[#A49EC2] font-bold hover:underline flex items-center gap-1">Tümünü Gör <ArrowRight size={16} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {showcaseProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-[2rem] border border-gray-100 p-4 hover:shadow-xl transition duration-300 group cursor-pointer" onClick={onStartShopping}>
                            <div className="h-64 relative rounded-2xl overflow-hidden bg-gray-50 mb-4">
                                <img src={product.imageUrl || "https://images.unsplash.com/photo-1596464716127-f9a0859d0437?w=500&q=80"} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                {product.isExpertApproved && <div className="absolute top-3 right-3 bg-[#F7DCA1] text-yellow-900 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md"><CheckCircle2 size={12} fill="currentColor" className="text-white" /> Uzman Onaylı</div>}
                            </div>
                            <div className="px-2 pb-2">
                                <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
                                <div className="text-[#75AFBC] font-black text-xl">₺{product.price}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- BÖLÜM 4: BLOG / UZMAN KÖŞESİ --- */}
            <div className="animate-in slide-in-from-bottom-8 duration-700 pt-8 border-t border-gray-100">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-800">Uzman Köşesi</h2>
                        <p className="text-gray-500 mt-1 font-medium">Pedagoglarımızdan gelişim önerileri ve makaleler.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {blogs.length === 0 ? (
                        <div className="col-span-3 text-center py-12 bg-white rounded-[2rem] border border-dashed border-gray-200">
                            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-400 font-bold">Henüz yayınlanmış bir yazı yok.</p>
                            <p className="text-xs text-gray-400 mt-1">Uzmanlarımız içerik hazırlıyor...</p>
                        </div>
                    ) : (
                        blogs.slice(0, 3).map((blog) => (
                            <div key={blog.id} onClick={() => setSelectedBlog(blog)} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition duration-300 group cursor-pointer h-full flex flex-col">
                                <div className="h-48 overflow-hidden relative">
                                    <img src={blog.imageUrl || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&q=80"} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm uppercase tracking-wider">
                                        {blog.category || "Gelişim"}
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <h3 className="font-bold text-gray-800 text-xl mb-3 line-clamp-2 group-hover:text-[#75AFBC] transition">
                                        {blog.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed flex-1">
                                        {blog.content}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-white shadow-sm">
                                                {blog.author?.imageUrl ? <img src={blog.author.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-[#75AFBC] text-white font-bold text-xs">{blog.author?.name?.charAt(0) || "U"}</div>}
                                            </div>
                                            <span className="text-xs font-bold text-gray-600">{blog.author?.name || "Uzman"}</span>
                                        </div>
                                        <span className="text-xs text-gray-400 font-bold">{new Date(blog.createdAt).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- BÖLÜM 5: BLOG OKUMA MODALI --- */}
            {selectedBlog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedBlog(null)}></div>
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col animate-in fade-in zoom-in duration-300">
                        <button onClick={() => setSelectedBlog(null)} className="absolute top-6 right-6 bg-white/50 hover:bg-white p-2 rounded-full backdrop-blur-md transition shadow-sm z-20 group">
                            <X size={24} className="text-gray-800 group-hover:scale-110 transition" />
                        </button>
                        <div className="h-64 md:h-80 w-full relative flex-shrink-0">
                            <img src={selectedBlog.imageUrl || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&q=80"} className="w-full h-full object-cover" alt={selectedBlog.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 md:left-10 text-white">
                                <span className="bg-[#75AFBC] text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 inline-block shadow-lg">{selectedBlog.category || "Genel"}</span>
                                <h2 className="text-3xl md:text-4xl font-black leading-tight shadow-sm">{selectedBlog.title}</h2>
                            </div>
                        </div>
                        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow-md overflow-hidden">
                                        {selectedBlog.author?.imageUrl ? <img src={selectedBlog.author.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-[#A49EC2] text-white font-bold text-lg">{selectedBlog.author?.name?.charAt(0)}</div>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-lg">{selectedBlog.author?.name || "Misafir Uzman"}</div>
                                        <div className="text-xs text-[#75AFBC] font-bold">{selectedBlog.author?.title || "Pedagog / Uzman"}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-400">{new Date(selectedBlog.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                    <div className="text-xs text-gray-300 font-bold flex items-center justify-end gap-1 mt-1"><Eye size={12} /> {selectedBlog.views || 0} Okunma</div>
                                </div>
                            </div>
                            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {selectedBlog.content}
                            </div>
                            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
                                <button onClick={() => setSelectedBlog(null)} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">Kapat</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
// --- SHOP PAGE ---
// --- GÜNCELLENMİŞ SHOP PAGE (FİLTRELİ & GÖRSEL DÜZELTİLMİŞ) ---
const ShopPage = ({ products, onAddToCartClick }: { products: Product[], onAddToCartClick: (p: Product) => void }) => {

    // Filtreleme State'leri
    const [selectedAgeGroups, setSelectedAgeGroups] = useState<number[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    // Yaş Grubu Filtresi (Toggle)
    const toggleAge = (index: number) => {
        setSelectedAgeGroups(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    // Kategori Filtresi (Toggle)
    const toggleCat = (index: number) => {
        setSelectedCategories(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    // Ürünleri Filtrele
    const filteredProducts = products.filter(product => {
        // Eğer hiçbir yaş seçilmediyse hepsini göster, seçildiyse eşleşeni göster
        const ageMatch = selectedAgeGroups.length === 0 || selectedAgeGroups.includes(product.ageGroup);
        // Eğer hiçbir kategori seçilmediyse hepsini göster, seçildiyse eşleşeni göster
        const catMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);

        return ageMatch && catMatch;
    });

    return (
        <div id="shop-top" className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* SOL FİLTRE PANELİ */}
            <div className="w-full lg:w-72 shrink-0 bg-white/90 p-6 rounded-[2rem] shadow-sm border border-white sticky top-24">
                <div className="flex items-center gap-2 mb-6 text-gray-800">
                    <Filter size={20} className="text-[#75AFBC]" />
                    <h3 className="font-bold text-lg">Filtreler</h3>
                </div>

                {/* Yaş Filtresi */}
                <div className="mb-8">
                    <h4 className="font-bold text-gray-700 mb-3 text-sm">Yaş Grubu</h4>
                    <div className="space-y-2">
                        {AGE_GROUPS.map((age, i) => (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${selectedAgeGroups.includes(i) ? 'bg-[#75AFBC] border-[#75AFBC]' : 'border-gray-300 bg-white group-hover:border-[#75AFBC]'}`}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedAgeGroups.includes(i)}
                                        onChange={() => toggleAge(i)}
                                    />
                                    <CheckCircle2 size={14} className={`text-white transition-all ${selectedAgeGroups.includes(i) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                </div>
                                <span className={`text-sm transition font-medium ${selectedAgeGroups.includes(i) ? 'text-[#75AFBC]' : 'text-gray-600 group-hover:text-[#75AFBC]'}`}>{age}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Kategori Filtresi */}
                <div>
                    <h4 className="font-bold text-gray-700 mb-3 text-sm">Gelişim Alanı</h4>
                    <div className="space-y-2">
                        {CATEGORIES.map((cat, i) => (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${selectedCategories.includes(i) ? 'bg-[#A49EC2] border-[#A49EC2]' : 'border-gray-300 bg-white group-hover:border-[#A49EC2]'}`}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedCategories.includes(i)}
                                        onChange={() => toggleCat(i)}
                                    />
                                    <CheckCircle2 size={14} className={`text-white transition-all ${selectedCategories.includes(i) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                </div>
                                <span className={`text-sm transition font-medium ${selectedCategories.includes(i) ? 'text-[#A49EC2]' : 'text-gray-600 group-hover:text-[#A49EC2]'}`}>{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* SAĞ ÜRÜN LİSTESİ */}
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">Tüm Ürünler</h1>
                        <p className="text-gray-500 text-sm font-medium">
                            {filteredProducts.length} ürün listeleniyor
                        </p>
                    </div>
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm">
                        Önerilen Sıralama <ChevronDown size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-3 text-center py-20 text-gray-400 font-medium bg-white rounded-[2rem] border border-dashed">
                            Aradığınız kriterlere uygun ürün bulunamadı.
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-[2rem] border border-white p-4 hover:shadow-xl hover:shadow-purple-100 transition duration-500 group flex flex-col h-full relative">
                                <div className="h-56 relative rounded-2xl overflow-hidden bg-gray-50 mb-4">
                                    {/* --- GÖRSEL URL DÜZELTMESİ --- */}
                                    <img
                                        src={product.imageUrl || getPlaceholderImage(product.category)}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                        alt={product.name}
                                    />
                                    {/* ----------------------------- */}

                                    {product.isExpertApproved && (
                                        <div className="absolute top-3 right-3 bg-[#F7DCA1] text-yellow-900 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md transform group-hover:scale-105 transition">
                                            <CheckCircle2 size={12} fill="currentColor" className="text-white" /> Uzman Onaylı
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
                                    <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight group-hover:text-[#A49EC2] transition">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                                        {product.description}
                                    </p>
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
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const BookingModal = ({ expert, isOpen, onClose, user }: { expert: ExpertProfile | null, isOpen: boolean, onClose: () => void, user: UserType }) => {
    const [slots, setSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [childName, setChildName] = useState("");
    const [childAge, setChildAge] = useState("");
    const [topic, setTopic] = useState("");

    // Modal açılınca uzmanın müsait saatlerini çek
    useEffect(() => {
        if (isOpen && expert) {
            fetch(`${API_BASE}/expertavailability/${expert.id}`)
                .then(res => res.json())
                .then(data => setSlots(data));
        }
    }, [isOpen, expert]);

    if (!isOpen || !expert) return null;

    const handleBuySession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return alert("Lütfen bir saat seçin!");

        try {
            const response = await fetch(`${API_BASE}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expertId: expert.id,
                    parentId: user.id,
                    childName,
                    childAge: parseInt(childAge),
                    topic,
                    date: selectedSlot.availableDate, // Seçilen slotun tarihi
                    time: selectedSlot.availableTime, // Seçilen slotun saati
                    status: 1 // 1 = Approved (Direkt onaylı/satın alınmış)
                })
            });

            if (response.ok) {
                alert("Ödeme alındı ve seans onaylandı! Takviminizde görebilirsiniz.");
                onClose();
            } else {
                alert("Bu saat az önce başkası tarafından alındı!");
            }
        } catch (error) { alert("Hata oluştu."); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in">
                <div className="bg-[#A49EC2] p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">Seans Satın Al</h3>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="p-6 space-y-6">
                    {/* Uzman Bilgisi */}
                    <div className="flex items-center gap-4">
                        <img src={expert.imageUrl} className="w-16 h-16 rounded-full border-2 border-white shadow-md" />
                        <div><h4 className="font-bold text-gray-800">{expert.name}</h4><p className="text-sm text-purple-600">{expert.title}</p></div>
                    </div>

                    {/* 1. ADIM: SAAT SEÇİMİ */}
                    <div>
                        <label className="text-sm font-bold text-gray-500 mb-2 block">Müsait Saat Seçin</label>
                        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                            {slots.length === 0 ? <p className="text-sm text-red-400 col-span-3">Bu uzman için müsait saat bulunamadı.</p> :
                                slots.map(slot => (
                                    <button
                                        key={slot.id}
                                        type="button"
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-2 rounded-lg text-xs font-bold border transition ${selectedSlot?.id === slot.id ? 'bg-[#A49EC2] text-white border-[#A49EC2]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#A49EC2]'}`}
                                    >
                                        {new Date(slot.availableDate).getDate()} {new Date(slot.availableDate).toLocaleString('tr-TR', { month: 'short' })} <br />
                                        {slot.availableTime}
                                    </button>
                                ))
                            }
                        </div>
                    </div>

                    {/* 2. ADIM: ÇOCUK BİLGİLERİ */}
                    {selectedSlot && (
                        <form onSubmit={handleBuySession} className="space-y-4 animate-in slide-in-from-bottom-2">
                            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-sm text-yellow-800 mb-2">
                                <span className="font-bold">Seçilen Seans:</span> {new Date(selectedSlot.availableDate).toLocaleDateString()} - {selectedSlot.availableTime} <br />
                                <span className="font-bold">Ücret:</span> 750 TL
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input required value={childName} onChange={e => setChildName(e.target.value)} className="border p-3 rounded-xl w-full text-sm" placeholder="Çocuğun Adı" />
                                <input required type="number" value={childAge} onChange={e => setChildAge(e.target.value)} className="border p-3 rounded-xl w-full text-sm" placeholder="Yaş" />
                            </div>
                            <textarea required value={topic} onChange={e => setTopic(e.target.value)} className="border p-3 rounded-xl w-full text-sm h-20 resize-none" placeholder="Danışmak istediğiniz konuyu özetleyin..." />

                            <button className="w-full bg-[#75AFBC] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 shadow-lg transition">
                                Öde ve Randevuyu Onayla (750₺)
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- EBEVEYN PANELİ ---
// --- GÜNCELLENMİŞ EBEVEYN PANELİ ---
// --- GÜNCELLENMİŞ EBEVEYN PANELİ (TAM HALİ) ---
const ParentPanel = ({ products, user, onAddToCart }: any) => {
    // 1. STATE TANIMLARI
    // 'sessions' sekmesini buraya ekledik
    const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'experts' | 'sessions'>('home');
    const [experts, setExperts] = useState<ExpertProfile[]>([]);
    const [mySessions, setMySessions] = useState<any[]>([]); // Randevuları tutacak kutu
    const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // 2. VERİ ÇEKME İŞLEMLERİ (useEffect)
    useEffect(() => {
        // Uzmanları çek
        if (activeTab === 'experts') {
            fetch(`${API_BASE}/users/experts`)
                .then(res => res.json())
                .then(data => setExperts(data))
                .catch(err => console.error(err));
        }

        // YENİ: Seanslarımı Çek (Backend'den)
        if (activeTab === 'sessions') {
            // Backend'de AppointmentsController'da parentId ile filtreleme yazmıştık
            fetch(`${API_BASE}/appointments?parentId=${user.id}`)
                .then(res => res.json())
                .then(data => setMySessions(data))
                .catch(err => console.error("Randevular çekilemedi:", err));
        }
    }, [activeTab, user.id]);

    const handleGoToShop = () => {
        setActiveTab('shop');
        setTimeout(() => document.getElementById('shop-top')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleBookSession = (expert: ExpertProfile) => {
        setSelectedExpert(expert);
        setShowBookingModal(true);
    };

    // 3. GÖRÜNÜM (JSX) - Senin attığın kısım burası
    return (
        <div>
            {/* --- MENÜ (Navigasyon) --- */}
            <div className="flex justify-center mb-8 sticky top-24 z-20 overflow-x-auto py-2">
                <div className="bg-white/90 backdrop-blur p-1.5 rounded-2xl shadow-sm border border-white inline-flex gap-2 min-w-max">
                    <button onClick={() => setActiveTab('home')} className={`px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${activeTab === 'home' ? 'bg-[#F7DCA1] text-yellow-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><Star size={16} /> Vitrin</button>
                    <button onClick={() => setActiveTab('shop')} className={`px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${activeTab === 'shop' ? 'bg-[#A49EC2] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><ShoppingCart size={16} /> Mağaza</button>
                    <button onClick={() => setActiveTab('experts')} className={`px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${activeTab === 'experts' ? 'bg-[#75AFBC] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><Stethoscope size={16} /> Danışmanlar</button>
                    {/* YENİ BUTON */}
                    <button onClick={() => setActiveTab('sessions')} className={`px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${activeTab === 'sessions' ? 'bg-orange-400 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><Calendar size={16} /> Seanslarım</button>
                </div>
            </div>

            {/* MEVCUT SAYFALAR */}
            {activeTab === 'home' && <LandingPage onStartShopping={handleGoToShop} products={products} />}
            {activeTab === 'shop' && <ShopPage products={products} onAddToCartClick={onAddToCart} />}

            {/* UZMANLAR SAYFASI */}
            {activeTab === 'experts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 pb-12">
                    {experts.map(expert => (
                        <div key={expert.id} className="bg-white p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-lg transition flex flex-col md:flex-row gap-6 items-center">
                            <img
                                src={expert.imageUrl || psikologImg}
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                            />
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-black text-gray-800">{expert.name}</h3>
                                <p className="text-[#75AFBC] font-bold text-sm mb-2">{expert.title || "Uzman"}</p>
                                <button onClick={() => handleBookSession(expert)} className="w-full bg-[#A49EC2] text-white py-2 rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-purple-100 flex items-center justify-center gap-2">
                                    <Calendar size={16} /> Randevu Al
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- YENİ: SEANSLARIM EKRANI --- */}
            {activeTab === 'sessions' && (
                <div className="animate-in slide-in-from-bottom-4 space-y-6 pb-12">
                    <h2 className="text-2xl font-black text-gray-800 text-center">Seanslarım</h2>
                    {mySessions.length === 0 ? (
                        <div className="text-center p-10 bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400">
                            Henüz alınmış bir randevunuz yok. "Danışmanlar" sekmesinden randevu alabilirsiniz.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mySessions.map((session: any) => (
                                <div key={session.id} className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-orange-400"></div>
                                    <div className="bg-orange-50 p-4 rounded-2xl text-orange-500">
                                        <CalendarCheck size={32} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                                            {new Date(session.date).toLocaleDateString('tr-TR')} - {session.time}
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-lg mb-1">
                                            Konu: {session.topic}
                                        </h3>
                                        <div className="text-sm text-gray-600">
                                            Çocuk: <strong>{session.childName}</strong> ({session.childAge} Yaş)
                                        </div>
                                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            Onaylandı
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <BookingModal expert={selectedExpert} isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} user={user} />
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

        // --- DEĞİŞİKLİK BURADA: MOCK YERİNE GERÇEK VERİTABANI ---
        // AdminController'da yazdığımız GetProducts metodunu çağırıyoruz
        fetch(`${API_BASE}/Admin/products`)
            .then(res => res.json())
            .then(data => {
                setProducts(data); // Veritabanından gelenleri state'e at
                console.log("Veritabanından çekilen ürünler:", data);
            })
            .catch(err => console.error("Ürünler çekilemedi:", err));
        // ---------------------------------------------------------

        return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    const handleAddToCart = (product: Product) => { setCart([...cart, product]); };
    const handleLogout = () => { setCurrentUser(null); if (isAdminMode) { window.location.hash = ''; setIsAdminMode(false); } };

    if (isAdminMode) return <AdminPanel products={products} setProducts={setProducts} onLogout={handleLogout} />;
    if (!currentUser) return <LoginScreen onLogin={setCurrentUser} onAdminClick={() => { window.location.hash = 'admin'; setIsAdminMode(true); }} />;

    return (
        <div className="min-h-screen bg-[#FFFDF7] font-sans text-gray-600 relative">
            <StarBackground />
            <nav className="bg-[#FFFDF7]/95 backdrop-blur-sm sticky top-0 z-30 border-b border-[#FFFDF7] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer">
                        {/* LOGO KULLANIMI: İkon ve Yazı yerine Resim */}
                        <img src={logoParent} alt="YUMI Logo" className="h-20 w-auto object-contain" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full border border-gray-100 shadow-sm">
                            <div className="w-10 h-10 bg-[#FABDAD] rounded-full flex items-center justify-center text-xl text-white">👤</div>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-800 leading-none">{currentUser.name}</p>
                                <p className="text-[10px] uppercase font-bold text-[#A49EC2] tracking-wide">{currentUser.role === 0 ? "Admin" : currentUser.role === 1 ? "Uzman" : "Ebeveyn"}</p>
                            </div>
                            <button onClick={handleLogout} className="ml-2 p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"><LogOut size={18} /></button>
                        </div>
                        <button onClick={() => setShowCart(true)} className="relative p-3 text-[#75AFBC] hover:text-[#A49EC2] transition bg-white/80 rounded-full shadow-sm border border-white">
                            <ShoppingCart size={24} />
                            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-sm animate-bounce">{cart.length}</span>}
                        </button>
                    </div>
                </div>
            </nav>
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
                                    <div clasliderssName="flex-1"><div className="font-bold text-gray-800">{item.name}</div><div className="text-yumi-blue font-bold">₺{item.price}</div></div>
                                    <button onClick={() => { const n = [...cart]; n.splice(idx, 1); setCart(n); }} className="text-red-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 border-t border-yumi-skin bg-gray-50">
                            <div className="flex justify-between font-bold text-xl mb-4 text-gray-800"><span>Toplam</span><span>₺{cart.reduce((a, b) => a + b.price, 0)}</span></div>
                            <button className="w-full bg-[#A49EC2] text-white py-4 rounded-xl font-bold shadow-lg">Ödemeyi Tamamla</button>
                        </div>
                    </div>
                </div>
            )}
            <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                {currentUser?.role === 1 ? <ExpertDashboard products={products} user={currentUser} /> : <ParentPanel products={products} user={currentUser} onAddToCart={handleAddToCart} />}
            </main>
        </div>
    );
}