import React, { useState, useEffect } from 'react';
import {
    Calendar, MessageCircle, CheckCircle, XCircle,
    FileText, Clock, Plus, Trash2, X, Eye, Image as ImageIcon, Link as LinkIcon, Edit3, RotateCcw,
    ChevronLeft, ChevronRight, Save, Info, Tag, Layers, Star, LayoutDashboard,
    CalendarCheck, CheckCircle2 // <-- EKSİK OLANLAR BUNLARDI, EKLENDİ
} from 'lucide-react';

const API_BASE = "http://localhost:5063/api";

// --- TİPLER ---
interface UserType { id: number; name: string; email: string; role: number; }
interface Product { id: number; name: string; price: number; stock: number; imageUrl?: string; isExpertApproved?: boolean; description: string; category: number; ageGroup: number; }
interface Appointment { id: number; parentId: number; parentName: string; date: string; time: string; topic: string; status: 'pending' | 'approved' | 'rejected'; }
interface Question { id: number; parentId: number; parentName: string; text: string; productName?: string; answer?: string; date: string; }
interface BlogPost { id: number; title: string; category: string; content: string; imageUrl: string; status: 'draft' | 'published'; views: number; date: string; relatedProductIds: number[]; }
interface AvailableSlot { id: number; date: string; time: string; }

// --- SABİTLER ---
const BLOG_CATEGORIES = ["Gelişim", "Psikoloji", "Beslenme", "Oyun", "Sağlık"];
const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const CATEGORY_NAMES = ["Bilişsel", "Dil", "Motor", "Zeka"];
const AGE_GROUP_NAMES = ["0-3 Yaş", "3-6 Yaş", "6-12 Yaş"];

const ExpertDashboard = ({ products, user }: { products: Product[], user: UserType }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'questions' | 'approvals' | 'blog'>('dashboard');

    // --- STATE'LER (Veritabanından Dolacak) ---
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

    // Ürünleri prop'tan alıyoruz ama yerel onay işlemleri için state'e atıyoruz
    const [localProducts, setLocalProducts] = useState<Product[]>(products);

    // Form ve UI State'leri
    const [replyText, setReplyText] = useState("");
    const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [postForm, setPostForm] = useState({ title: '', category: 'Gelişim', content: '', imageUrl: '', relatedProductIds: [] as number[] });
    const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);

    // --- API VERİ ÇEKME ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Randevuları Çek (Yorum satırlarını kaldırdık)
                const resApp = await fetch(`${API_BASE}/appointments?expertId=${user.id}`);
                if (resApp.ok) {
                    const data = await resApp.json();
                    // Backend'den gelen veri ile Frontend tipi uyuşmazsa burada map işlemi gerekebilir
                    // Şimdilik direkt set ediyoruz.
                    setAppointments(data);
                }

                // (Sorular ve Bloglar için de benzer endpointler yazılınca burası açılacak)

            } catch (error) {
                console.error("Veri çekme hatası:", error);
            }
        };
        fetchData();
    }, [user.id]);

    // --- TAKVİM FONKSİYONLARI ---
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const startingDay = firstDay === 0 ? 6 : firstDay - 1;
        return { days, startingDay, monthName: date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) };
    };

    const changeMonth = (delta: number) => { const newDate = new Date(currentDate); newDate.setMonth(newDate.getMonth() + delta); setCurrentDate(newDate); };

    const handleDateClick = (day: number) => {
        const d = new Date(currentDate);
        d.setDate(day);
        // Tarih formatı: YYYY-MM-DD (Backend ile uyumlu olması için)
        const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        setSelectedDate(formattedDate);

        // --- GÜNCELLEME BURADA ---
        // Veritabanından (availableSlots state'inden) bu tarihteki saatleri buluyoruz
        const existingSlotsForDate = availableSlots
            .filter(slot => {
                // Backend'den gelen tarih "2026-01-12T00:00:00" formatında olabilir, sadece ilk 10 karaktere (YYYY-MM-DD) bakıyoruz
                const slotDateStr = String(slot.availableDate).split('T')[0];
                return slotDateStr === formattedDate;
            })
            .map(slot => slot.availableTime);

        // O günün kayıtlı saatlerini seçili hale getiriyoruz
        setSelectedTimes(existingSlotsForDate);
    };

    const toggleTimeSelection = (time: string) => {
        if (selectedTimes.includes(time)) setSelectedTimes(selectedTimes.filter(t => t !== time));
        else setSelectedTimes([...selectedTimes, time]);
    };

    const handleSaveAvailability = async () => {
        if (!selectedDate) return alert("Lütfen bir tarih seçin.");

        // O tarihteki orijinal veritabanı kayıtlarını bul
        const originalSlots = availableSlots.filter(slot => String(slot.availableDate).split('T')[0] === selectedDate);
        const originalTimes = originalSlots.map(s => s.availableTime);

        // 1. SİLİNECEKLERİ BUL (Eskiden vardı ama şimdi selectedTimes içinde yok)
        const toDelete = originalSlots.filter(slot => !selectedTimes.includes(slot.availableTime));

        // 2. EKLENECEKLERİ BUL (Eskiden yoktu ama şimdi selectedTimes içinde var)
        const toAdd = selectedTimes.filter(time => !originalTimes.includes(time));

        if (toDelete.length === 0 && toAdd.length === 0) {
            return alert("Herhangi bir değişiklik yapmadınız.");
        }

        try {
            // SİLME İŞLEMLERİ (Backend'de DeleteSlot endpoint'i olmalı)
            for (const slot of toDelete) {
                await fetch(`${API_BASE}/ExpertAvailability/${slot.id}`, { method: 'DELETE' });
            }

            // EKLEME İŞLEMLERİ
            for (const time of toAdd) {
                await fetch(`${API_BASE}/ExpertAvailability`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        expertId: user.id,
                        availableDate: selectedDate,
                        availableTime: time
                    })
                });
            }

            alert("Takvim başarıyla güncellendi! ✅");

            // Listeyi Yenile
            const res = await fetch(`${API_BASE}/ExpertAvailability/${user.id}`);
            if (res.ok) setAvailableSlots(await res.json());

            setShowCalendarModal(false);
            setSelectedDate("");
            setSelectedTimes([]);

        } catch (error) {
            console.error(error);
            alert("İşlem sırasında bir hata oluştu.");
        }
    };
    const handleEditDay = (dateStr: string) => {
        setSelectedDate(dateStr);
        const existingTimes = availableSlots.filter(s => s.date === dateStr).map(s => s.time);
        setSelectedTimes(existingTimes);
        setCurrentDate(new Date(dateStr));
        setShowCalendarModal(true);
    };

    // --- ACTIONS ---
    const handleAppointmentAction = async (id: number, status: 'approved' | 'rejected') => {
        // UI Güncelleme
        setAppointments(appointments.map(app => app.id === id ? { ...app, status: status } : app));

        // API Güncelleme
        // await fetch(`${API_BASE}/appointments/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ status }) });

        alert(`Randevu ${status === 'approved' ? 'onaylandı' : 'reddedildi'} ve bildirim gönderildi.`);
    };

    const handleDeleteSlot = (id: number) => {
        if (confirm("Bu saati silmek istediğinize emin misiniz?")) setAvailableSlots(availableSlots.filter(s => s.id !== id));
    };

    const handleReply = (qId: number) => {
        if (!replyText) return;
        setQuestions(questions.map(q => q.id === qId ? { ...q, answer: replyText } : q));
        // API Call here...
        setReplyText("");
        setActiveQuestionId(null);
    };

    const toggleProductApproval = (prodId: number) => {
        const updated = localProducts.map(p => p.id === prodId ? { ...p, isApproved: !p.isApproved } : p);
        setLocalProducts(updated);
        // Eğer modal açıksa orayı da güncelle
        if (inspectingProduct && inspectingProduct.id === prodId) {
            setInspectingProduct({ ...inspectingProduct, isApproved: !inspectingProduct.isApproved });
        }
        // API Call here...
    };

    const handleEditPost = (post: BlogPost) => {
        setEditingId(post.id);
        setPostForm({ title: post.title, category: post.category, content: post.content, imageUrl: post.imageUrl, relatedProductIds: post.relatedProductIds });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => { setEditingId(null); setPostForm({ title: '', category: 'Gelişim', content: '', imageUrl: '', relatedProductIds: [] }); };

    const handleSavePost = (status: 'draft' | 'published') => {
        if (!postForm.title || !postForm.content) return alert("Başlık ve içerik zorunludur.");

        if (editingId) {
            const updatedPosts = blogPosts.map(post => post.id === editingId ? { ...post, ...postForm, status: status } : post);
            setBlogPosts(updatedPosts);
            alert("Yazı güncellendi!");
        } else {
            const newPost: BlogPost = { id: Date.now(), ...postForm, status: status, views: 0, date: new Date().toLocaleDateString('tr-TR'), relatedProductIds: postForm.relatedProductIds };
            setBlogPosts([newPost, ...blogPosts]);
            alert("Yazı eklendi!");
        }
        // API Call here...
        handleCancelEdit();
    };

    const handleDeletePost = (id: number) => { if (confirm("Silinsin mi?")) setBlogPosts(blogPosts.filter(p => p.id !== id)); };

    const toggleRelatedProduct = (prodId: number) => {
        if (postForm.relatedProductIds.includes(prodId)) setPostForm({ ...postForm, relatedProductIds: postForm.relatedProductIds.filter(id => id !== prodId) });
        else setPostForm({ ...postForm, relatedProductIds: [...postForm.relatedProductIds, prodId] });
    };

    // --- RENDERERS ---

    const renderDashboard = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F7E9CE] flex items-center gap-4">
                <div className="bg-[#F7E9CE] p-4 rounded-2xl text-[#A49EC2]"><Clock size={32} /></div>
                <div><h3 className="text-2xl font-bold text-gray-800">{appointments.filter(a => a.status === 'pending').length}</h3><p className="text-gray-500 font-medium">Bekleyen Randevu</p></div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F7E9CE] flex items-center gap-4">
                <div className="bg-[#F7E9CE] p-4 rounded-2xl text-[#A49EC2]"><MessageCircle size={32} /></div>
                <div><h3 className="text-2xl font-bold text-gray-800">{questions.filter(q => !q.answer).length}</h3><p className="text-gray-500 font-medium">Cevaplanacak Soru</p></div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F7E9CE] flex items-center gap-4">
                <div className="bg-[#F7E9CE] p-4 rounded-2xl text-[#A49EC2]"><FileText size={32} /></div>
                <div><h3 className="text-2xl font-bold text-gray-800">{blogPosts.length}</h3><p className="text-gray-500 font-medium">Toplam Yazı</p></div>
            </div>
        </div>
    );

    // --- GÜNCELLENMİŞ VE SAĞLAM RENDER FONKSİYONU ---
    const renderAppointments = () => {
        // Yardımcı Fonksiyon: Backend'den büyük harf de gelse küçük de gelse veriyi al
        // Bu fonksiyon "localeCompare" hatasını önler.
        const getSafeDate = (item: any) => item.availableDate || item.AvailableDate || item.date || item.Date || "";
        const getSafeTime = (item: any) => item.availableTime || item.AvailableTime || item.time || item.Time || "";

        // 1. Slotları tarihe göre gruplayalım
        const groupedSlots = availableSlots.reduce((groups: any, slot: any) => {
            const dateRaw = getSafeDate(slot);
            if (!dateRaw) return groups;

            const dateKey = String(dateRaw).split('T')[0]; // Sadece tarihi al (YYYY-MM-DD)
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(slot);
            return groups;
        }, {});

        // 2. Tarihleri sıralayalım
        const sortedDates = Object.keys(groupedSlots).sort((a, b) => a.localeCompare(b));

        return (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">

                {/* --- BÖLÜM 1: DOLU (SATIN ALINAN) RANDEVULAR --- */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#75AFBC]/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#75AFBC]"></div>
                    <h3 className="font-black text-2xl text-gray-800 mb-6 flex items-center gap-3">
                        <CalendarCheck size={28} className="text-[#75AFBC]" />
                        Gelecek Seanslarınız (Kesinleşmiş)
                    </h3>

                    {appointments.length === 0 ? (
                        <div className="text-center p-8 bg-blue-50/50 rounded-3xl border border-dashed border-blue-200">
                            <p className="text-[#75AFBC] font-bold">Henüz satın alınmış bir seansınız yok.</p>
                            <p className="text-sm text-gray-400 mt-1">Ebeveynler randevu aldığında burada görünecek.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map((app: any) => (
                                <div key={app.id || app.Id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#75AFBC]/10 p-3 rounded-xl text-[#75AFBC] font-black text-center min-w-[80px]">
                                            <div className="text-xl">{getSafeTime(app)}</div>
                                            <div className="text-[10px] uppercase tracking-wider">{new Date(getSafeDate(app)).toLocaleDateString('tr-TR', { weekday: 'short' })}</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-lg">{app.childName || app.ChildName} <span className="text-gray-400 text-sm font-normal">({app.childAge || app.ChildAge} Yaş)</span></div>
                                            <div className="text-sm text-gray-500 line-clamp-1">{app.topic || app.Topic}</div>
                                            <div className="text-xs text-[#75AFBC] font-bold mt-1">{new Date(getSafeDate(app)).toLocaleDateString('tr-TR')}</div>
                                        </div>
                                    </div>
                                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Onaylandı
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- BÖLÜM 2: MÜSAİT SAATLERİNİZ --- */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#A49EC2]/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#A49EC2]"></div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
                            <Clock size={28} className="text-[#A49EC2]" />
                            Müsaitlik Takviminiz
                        </h3>
                        <button onClick={() => { setShowCalendarModal(true); setSelectedDate(""); setSelectedTimes([]); }} className="bg-[#A49EC2] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#938db0] transition shadow-lg shadow-purple-100 flex items-center gap-2">
                            <Plus size={16} /> Saat Ekle / Düzenle
                        </button>
                    </div>

                    {sortedDates.length === 0 ? (
                        <div className="text-center p-8 bg-purple-50/50 rounded-3xl border border-dashed border-purple-200">
                            <p className="text-[#A49EC2] font-bold">Takviminiz boş görünüyor.</p>
                            <p className="text-sm text-gray-400 mt-1">"Saat Ekle" butonuna basarak müsait zamanlarınızı belirleyin.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedDates.map(dateKey => (
                                <div key={dateKey} className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                        <Calendar size={18} className="text-gray-400" />
                                        <span className="font-bold text-gray-700">
                                            {new Date(dateKey).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {groupedSlots[dateKey]
                                            .sort((a: any, b: any) => getSafeTime(a).localeCompare(getSafeTime(b)))
                                            .map((slot: any) => (
                                                <div key={slot.id || slot.Id} className="bg-white text-[#A49EC2] px-3 py-1.5 rounded-lg text-sm font-bold border border-purple-100 shadow-sm flex items-center gap-2 cursor-default">
                                                    {getSafeTime(slot)}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderQuestions = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.length === 0 ? <div className="col-span-full text-center p-10 text-gray-400">Henüz soru gelmemiş.</div> : questions.map(q => (
                <div key={q.id} className="bg-white p-6 rounded-3xl shadow-sm border border-[#F7E9CE]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#A49EC2] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">{q.parentName.charAt(0)}</div>
                            <div><h4 className="font-bold text-gray-800">{q.parentName}</h4><p className="text-xs text-gray-400">{q.date} • {q.productName}</p></div>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">{q.text}</p>
                    {q.answer ? <div className="bg-[#F7E9CE] p-4 rounded-xl text-sm text-gray-700 border border-[#F7DCA1]"><strong className="text-[#A49EC2]">Cevabınız:</strong> {q.answer}</div> : <div>{activeQuestionId === q.id ? <div className="space-y-2"><textarea className="w-full border p-3 rounded-xl text-sm" rows={3} placeholder="Cevabınız..." value={replyText} onChange={e => setReplyText(e.target.value)} /><div className="flex justify-end gap-2"><button onClick={() => setActiveQuestionId(null)} className="text-gray-400 text-sm">İptal</button><button onClick={() => handleReply(q.id)} className="bg-[#A49EC2] text-white px-4 py-2 rounded-lg text-sm font-bold">Gönder</button></div></div> : <button onClick={() => setActiveQuestionId(q.id)} className="w-full py-2 border border-[#A49EC2] text-[#A49EC2] rounded-xl text-sm font-bold hover:bg-[#A49EC2] hover:text-white transition">Cevapla</button>}</div>}
                </div>
            ))}
        </div>
    );

    const renderApprovals = () => (
        <div>
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-sm text-yellow-800 mb-6 flex items-center gap-2">
                <Info size={16} /><span>Ürünleri inceleyerek onay rozeti verebilirsiniz.</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {localProducts.map(p => (
                    <div key={p.id} className={`bg-white rounded-3xl shadow-sm border overflow-hidden ${p.isApproved ? 'border-[#F7DCA1] ring-2 ring-[#F7DCA1]' : 'border-gray-100'}`}>
                        <div className="h-40 bg-gray-100 relative group">
                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-[#F7E9CE]/30">{p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <LayoutDashboard size={40} />}</div>
                            {p.isApproved && <div className="absolute top-2 right-2 bg-[#F7DCA1] text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Star size={12} fill="currentColor" /> Uzman Onaylı</div>}

                            {/* HOVER İLE ÇIKAN İNCELE BUTONU */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                <button onClick={() => setInspectingProduct(p)} className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition transform">
                                    <Eye size={16} /> İncele & Onayla
                                </button>
                            </div>
                        </div>
                        <div className="p-5">
                            <h4 className="font-bold text-gray-800 mb-1 line-clamp-1">{p.name}</h4>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Stok: {p.stock}</span>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.isApproved ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {p.isApproved ? 'Onaylı' : 'Beklemede'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderBlog = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className={`p-6 rounded-3xl shadow-sm border sticky top-24 transition duration-300 ${editingId ? 'bg-purple-50 border-purple-200' : 'bg-white border-[#F7E9CE]'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-[#A49EC2] flex items-center gap-2"><Edit3 size={20} /> {editingId ? "Yazıyı Düzenle" : "Yeni Yazı Oluştur"}</h2>
                        {editingId && <button onClick={handleCancelEdit} className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1"><RotateCcw size={12} /> Vazgeç</button>}
                    </div>
                    <div className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-500 block mb-1">Başlık</label><input className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#A49EC2] outline-none" placeholder="Yazı başlığı..." value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-gray-500 block mb-1">Kategori</label><select className="w-full border border-gray-200 p-3 rounded-xl outline-none" value={postForm.category} onChange={e => setPostForm({ ...postForm, category: e.target.value })}>{BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                            <div><label className="text-xs font-bold text-gray-500 block mb-1">Görsel (URL)</label><div className="flex items-center border border-gray-200 rounded-xl overflow-hidden"><span className="pl-3 text-gray-400"><ImageIcon size={16} /></span><input className="w-full p-3 outline-none" placeholder="https://..." value={postForm.imageUrl} onChange={e => setPostForm({ ...postForm, imageUrl: e.target.value })} /></div></div>
                        </div>
                        <div><label className="text-xs font-bold text-gray-500 block mb-1">İçerik</label><textarea className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#A49EC2] outline-none min-h-[150px]" placeholder="Yazı içeriğinizi buraya girin..." value={postForm.content} onChange={e => setPostForm({ ...postForm, content: e.target.value })} /></div>
                        <div className="bg-white/50 p-4 rounded-xl border border-gray-200">
                            <label className="text-xs font-bold text-[#A49EC2] block mb-2 flex items-center gap-1"><LinkIcon size={14} /> Tavsiye Edilen Ürünler</label>
                            <div className="max-h-32 overflow-y-auto space-y-2">
                                {products.map(p => (
                                    <div key={p.id} onClick={() => toggleRelatedProduct(p.id)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${postForm.relatedProductIds.includes(p.id) ? 'bg-[#A49EC2] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                                        {postForm.relatedProductIds.includes(p.id) ? <CheckCircle size={14} /> : <Plus size={14} />}<span className="text-xs font-bold truncate">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => handleSavePost('draft')} className="flex-1 bg-gray-200 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-300">Taslak</button>
                            <button onClick={() => handleSavePost('published')} className="flex-1 bg-[#A49EC2] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-purple-200">{editingId ? "Güncelle" : "Yayınla"}</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Yazılarınız ({blogPosts.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {blogPosts.length === 0 ? <p className="text-gray-400">Henüz yazı paylaşmadınız.</p> : blogPosts.map(post => (
                        <div key={post.id} className={`bg-white rounded-3xl shadow-sm border overflow-hidden group transition ${editingId === post.id ? 'ring-2 ring-[#A49EC2]' : 'border-[#F7E9CE]'}`}>
                            <div className="h-40 bg-gray-100 relative">
                                {post.imageUrl ? <img src={post.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><FileText size={40} /></div>}
                                <div className="absolute top-3 left-3 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm">{post.category}</div>
                                <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-md shadow-sm ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{post.status === 'published' ? 'Yayında' : 'Taslak'}</div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{post.title}</h3>
                                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{post.content}</p>
                                {post.relatedProductIds.length > 0 && <div className="flex flex-wrap gap-1 mb-4">{post.relatedProductIds.map(pid => { const prod = products.find(p => p.id === pid); return prod ? <span key={pid} className="bg-[#F7E9CE] text-[#A49EC2] text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><LinkIcon size={10} /> {prod.name.substring(0, 15)}...</span> : null; })}</div>}
                                <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-auto">
                                    <div className="flex items-center gap-1 text-gray-400 text-xs font-bold"><Eye size={14} /> {post.views}</div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEditPost(post)} className="text-[#A49EC2] hover:text-purple-700 p-1 bg-purple-50 rounded-lg"><Edit3 size={16} /></button>
                                        <button onClick={() => handleDeletePost(post.id)} className="text-red-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] relative">

            {/* --- ÜRÜN İNCELEME MODALI (YENİ EKLENDİ) --- */}
            {inspectingProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300 border-4 border-[#F7E9CE]">
                        {/* Sol Taraf: Görsel */}
                        <div className="w-full md:w-1/2 bg-[#F7E9CE]/30 relative p-8 flex items-center justify-center">
                            {inspectingProduct.imageUrl ? (
                                <img src={inspectingProduct.imageUrl} className="max-w-full max-h-80 object-contain drop-shadow-xl" />
                            ) : (
                                <div className="text-gray-300 text-center"><LayoutDashboard size={80} /><p className="mt-2 font-bold">Görsel Yok</p></div>
                            )}
                            <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm border">
                                {CATEGORY_NAMES[inspectingProduct.category]}
                            </div>
                        </div>

                        {/* Sağ Taraf: Detaylar */}
                        <div className="w-full md:w-1/2 p-8 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-black text-gray-800">{inspectingProduct.name}</h2>
                                <button onClick={() => setInspectingProduct(null)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={24} className="text-gray-400" /></button>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className="flex gap-2">
                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><Users size={12} /> {AGE_GROUP_NAMES[inspectingProduct.ageGroup]}</span>
                                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><Tag size={12} /> {inspectingProduct.price} ₺</span>
                                    <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><Layers size={12} /> Stok: {inspectingProduct.stock}</span>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Ürün Açıklaması</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {inspectingProduct.description || "Bu ürün için detaylı açıklama girilmemiş. Lütfen satıcıyla iletişime geçin."}
                                    </p>
                                </div>
                            </div>

                            {/* ONAY BUTONLARI */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => toggleProductApproval(inspectingProduct.id)}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg transform active:scale-95 ${inspectingProduct.isApproved
                                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                        : 'bg-[#A49EC2] text-white hover:opacity-90 shadow-purple-200'
                                        }`}
                                >
                                    {inspectingProduct.isApproved
                                        ? <><XCircle size={24} /> Onayı İptal Et (Geri Çek)</>
                                        : <><CheckCircle size={24} /> Onayla ve Rozet Ver</>
                                    }
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-3">
                                    {inspectingProduct.isApproved
                                        ? "Bu ürünü daha önce onayladınız."
                                        : "Onayladığınızda ürün üzerinde 'Uzman Onaylı' rozeti görünecektir."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODERN TAKVİM MODALI --- */}
            {showCalendarModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 border-4 border-[#F7E9CE]">
                        <div className="flex justify-between items-center mb-6">
                            <div><h3 className="text-xl font-bold text-gray-800">Müsaitlik Yönetimi</h3><p className="text-xs text-gray-400">Birden fazla saat seçebilirsiniz</p></div>
                            <button onClick={() => setShowCalendarModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition"><X size={20} /></button>
                        </div>
                        <div className="flex items-center justify-between mb-4 bg-[#F7E9CE]/30 p-2 rounded-xl">
                            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white rounded-lg transition"><ChevronLeft size={20} className="text-[#A49EC2]" /></button>
                            <span className="font-bold text-gray-700">{getDaysInMonth(currentDate).monthName}</span>
                            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white rounded-lg transition"><ChevronRight size={20} className="text-[#A49EC2]" /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-6 text-center">
                            {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => <div key={d} className="text-xs font-bold text-gray-400 py-1">{d}</div>)}
                            {Array.from({ length: getDaysInMonth(currentDate).startingDay }).map((_, i) => <div key={`empty-${i}`} className="h-10"></div>)}
                            {Array.from({ length: getDaysInMonth(currentDate).days }).map((_, i) => {
                                const day = i + 1;
                                const d = new Date(currentDate); d.setDate(day);
                                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isSelected = selectedDate === dateStr;
                                const isToday = new Date().toISOString().split('T')[0] === dateStr;
                                return (
                                    <button key={day} onClick={() => handleDateClick(day)} className={`h-10 rounded-lg text-sm font-bold transition flex items-center justify-center ${isSelected ? 'bg-[#A49EC2] text-white shadow-md' : 'text-gray-700 hover:bg-[#F7E9CE]'} ${isToday && !isSelected ? 'border border-[#A49EC2] text-[#A49EC2]' : ''}`}>{day}</button>
                                );
                            })}
                        </div>
                        {selectedDate && (
                            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                <label className="block text-xs font-bold text-[#A49EC2] mb-2 uppercase tracking-wider">Saatleri Seçin (Çoklu)</label>
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {TIME_SLOTS.map(time => {
                                        const isActive = selectedTimes.includes(time);
                                        return (
                                            <button key={time} onClick={() => toggleTimeSelection(time)} className={`py-2 rounded-lg text-xs font-bold border transition ${isActive ? 'bg-[#A49EC2] border-[#A49EC2] text-white shadow-md' : 'border-gray-100 text-gray-500 hover:border-[#A49EC2] hover:text-[#A49EC2]'}`}>{time}</button>
                                        );
                                    })}
                                </div>
                                <button onClick={handleSaveAvailability} className="w-full bg-[#A49EC2] text-white py-3 rounded-xl font-bold hover:opacity-90 shadow-lg shadow-purple-100 flex items-center justify-center gap-2"><Save size={18} /> Kaydet & Güncelle</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SOL MENÜ */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F7E9CE] sticky top-24">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                        <div className="w-12 h-12 bg-[#A49EC2] rounded-full flex items-center justify-center text-white font-bold text-xl">{user.name.charAt(0)}</div>
                        <div><h3 className="font-bold text-gray-800 text-sm">{user.name}</h3><p className="text-xs text-[#A49EC2] font-bold">Uzman Paneli</p></div>
                    </div>
                    <nav className="space-y-2">
                        {[
                            { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
                            { id: 'appointments', label: 'Randevular', icon: Calendar },
                            { id: 'questions', label: 'Soru & Cevap', icon: MessageCircle },
                            { id: 'approvals', label: 'Ürün Onayı', icon: CheckCircle },
                            { id: 'blog', label: 'Blog Yazıları', icon: FileText },
                        ].map((item) => (
                            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition ${activeTab === item.id ? 'bg-[#A49EC2] text-white shadow-lg shadow-purple-200' : 'text-gray-500 hover:bg-[#F7E9CE] hover:text-[#A49EC2]'}`}>
                                <div className="flex items-center gap-3"><item.icon size={18} />{item.label}</div>
                                {activeTab === item.id && <ChevronRight size={16} />}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* SAĞ İÇERİK */}
            <div className="flex-1">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {activeTab === 'dashboard' && 'Hoşgeldiniz, İyi Çalışmalar!'}
                        {activeTab === 'appointments' && 'Randevu Yönetimi'}
                        {activeTab === 'questions' && 'Ebeveyn Soruları'}
                        {activeTab === 'approvals' && 'Ürün Denetimi'}
                        {activeTab === 'blog' && 'Blog Yönetimi'}
                    </h1>
                </div>

                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'appointments' && renderAppointments()}
                {activeTab === 'questions' && renderQuestions()}
                {activeTab === 'approvals' && renderApprovals()}
                {activeTab === 'blog' && renderBlog()}
            </div>
        </div>
    );
};

export default ExpertDashboard;