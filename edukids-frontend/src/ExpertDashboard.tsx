import React, { useState } from 'react';
import {
    Calendar, MessageCircle, CheckCircle, XCircle,
    FileText, Star, Clock, Users, Bell, Search, LayoutDashboard, ChevronRight,
    Plus, Trash2, X, Eye, Image as ImageIcon, Link as LinkIcon, Edit3, RotateCcw,
    ChevronLeft, Save, Info, Tag, Layers
} from 'lucide-react';

// --- RENK PALETİ ---
// Lila (Primary): #A49EC2
// Krem (Background): #F7E9CE
// Altın (Accent): #F7DCA1

// --- TİPLER ---
interface UserType { id: number; name: string; email: string; role: number; }
interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    imageUrl?: string;
    isApproved?: boolean;
    description: string; // İnceleme için gerekli
    category: number;
    ageGroup: number;
}

interface Appointment {
    id: number;
    parentId: number;
    parentName: string;
    date: string;
    time: string;
    topic: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface Question {
    id: number;
    parentId: number;
    parentName: string;
    text: string;
    productName?: string;
    answer?: string;
    date: string;
}

interface AvailableSlot {
    id: number;
    date: string;
    time: string;
}

interface BlogPost {
    id: number;
    title: string;
    category: string;
    content: string;
    imageUrl: string;
    status: 'draft' | 'published';
    views: number;
    date: string;
    relatedProductIds: number[];
}

// --- MOCK DATA ---
const MOCK_APPOINTMENTS: Appointment[] = [
    { id: 1, parentId: 101, parentName: "Ayşe Yılmaz", date: "2026-02-15", time: "14:00", topic: "2 yaşındaki oğlumun konuşma gecikmesi hakkında görüşmek istiyorum.", status: 'pending' },
    { id: 2, parentId: 102, parentName: "Mehmet Demir", date: "2026-02-16", time: "10:30", topic: "Dikkat eksikliği için oyuncak önerisi.", status: 'approved' }
];

const MOCK_QUESTIONS: Question[] = [
    { id: 1, parentId: 101, parentName: "Selin K.", text: "Bu oyuncak 18 aylık bebek için güvenli mi? Küçük parça riski var mı?", productName: "Ahşap Blok Seti", date: "2 saat önce" },
    { id: 2, parentId: 103, parentName: "Burak Ö.", text: "Oğlum çok çabuk sıkılıyor, bu set ilgisini uzun süre çeker mi?", productName: "Kodlama Tırtılı", date: "1 gün önce" }
];

const MOCK_BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        title: "Çocuklarda İnce Motor Becerileri Nasıl Gelişir?",
        category: "Gelişim",
        content: "İnce motor becerileri, küçük kas gruplarının kullanımıyla ilgilidir...",
        imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=300",
        status: "published",
        views: 1250,
        date: "2026-01-10",
        relatedProductIds: [1, 4]
    },
    {
        id: 2,
        title: "2 Yaş Sendromuyla Başa Çıkma Yolları",
        category: "Psikoloji",
        content: "Bu dönemde çocuklar bağımsızlıklarını ilan etmeye başlarlar...",
        imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300",
        status: "draft",
        views: 0,
        date: "2026-02-01",
        relatedProductIds: []
    }
];

const BLOG_CATEGORIES = ["Gelişim", "Psikoloji", "Beslenme", "Oyun", "Sağlık"];
const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const CATEGORY_NAMES = ["Bilişsel", "Dil", "Motor", "Zeka"];
const AGE_GROUP_NAMES = ["0-3 Yaş", "3-6 Yaş", "6-12 Yaş"];

const ExpertDashboard = ({ products, user }: { products: Product[], user: UserType }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'questions' | 'approvals' | 'blog'>('dashboard');

    // STATE'LER
    const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
    const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
    const [localProducts, setLocalProducts] = useState<Product[]>(products);
    const [replyText, setReplyText] = useState("");
    const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);

    // Takvim State
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([
        { id: 1, date: "2026-02-20", time: "09:00" },
        { id: 2, date: "2026-02-20", time: "10:00" }
    ]);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

    // Blog State
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>(MOCK_BLOG_POSTS);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [postForm, setPostForm] = useState({
        title: '',
        category: 'Gelişim',
        content: '',
        imageUrl: '',
        relatedProductIds: [] as number[]
    });

    // YENİ: Ürün İnceleme State'i
    const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);

    // --- TAKVİM FONKSİYONLARI ---
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const startingDay = firstDay === 0 ? 6 : firstDay - 1;
        return { days, startingDay, monthName: date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) };
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const handleDateClick = (day: number) => {
        const d = new Date(currentDate);
        d.setDate(day);
        const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(formattedDate);
        const existingTimes = availableSlots.filter(slot => slot.date === formattedDate).map(slot => slot.time);
        setSelectedTimes(existingTimes);
    };

    const toggleTimeSelection = (time: string) => {
        if (selectedTimes.includes(time)) setSelectedTimes(selectedTimes.filter(t => t !== time));
        else setSelectedTimes([...selectedTimes, time]);
    };

    const handleSaveAvailability = () => {
        if (!selectedDate) return alert("Lütfen bir tarih seçin.");
        if (selectedTimes.length === 0) return alert("Lütfen en az bir saat seçin.");
        const otherSlots = availableSlots.filter(s => s.date !== selectedDate);
        const newSlots = selectedTimes.map(time => ({ id: Date.now() + Math.random(), date: selectedDate, time: time }));
        setAvailableSlots([...otherSlots, ...newSlots]);
        setShowCalendarModal(false);
        setSelectedDate("");
        setSelectedTimes([]);
    };

    const handleEditDay = (dateStr: string) => {
        setSelectedDate(dateStr);
        const existingTimes = availableSlots.filter(s => s.date === dateStr).map(s => s.time);
        setSelectedTimes(existingTimes);
        setCurrentDate(new Date(dateStr));
        setShowCalendarModal(true);
    };

    // --- ACTIONS ---
    const handleAppointmentAction = (id: number, status: 'approved' | 'rejected') => {
        const updated = appointments.map(app => app.id === id ? { ...app, status: status } : app);
        setAppointments(updated);
        alert(`Randevu ${status === 'approved' ? 'onaylandı' : 'reddedildi'} ve bildirim gönderildi.`);
    };

    const handleDeleteSlot = (id: number) => {
        if (confirm("Bu saati silmek istediğinize emin misiniz?")) setAvailableSlots(availableSlots.filter(s => s.id !== id));
    };

    const handleReply = (qId: number) => {
        if (!replyText) return;
        const updated = questions.map(q => q.id === qId ? { ...q, answer: replyText } : q);
        setQuestions(updated);
        setReplyText("");
        setActiveQuestionId(null);
    };

    // GÜNCELLENDİ: Ürün onaylama artık modal içinden de çalışabiliyor
    const toggleProductApproval = (prodId: number) => {
        const updated = localProducts.map(p => p.id === prodId ? { ...p, isApproved: !p.isApproved } : p);
        setLocalProducts(updated);

        // Eğer inceleme penceresi açıksa oradaki veriyi de güncelle (Anlık yansıması için)
        if (inspectingProduct && inspectingProduct.id === prodId) {
            setInspectingProduct({ ...inspectingProduct, isApproved: !inspectingProduct.isApproved });
        }
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
            const newPost: BlogPost = { id: Date.now(), ...postForm, status: status, views: 0, date: new Date().toLocaleDateString('tr-TR') };
            setBlogPosts([newPost, ...blogPosts]);
            alert("Yazı eklendi!");
        }
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

    const renderAppointments = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#A49EC2]">Randevu Yönetimi</h2>
                <button onClick={() => { setShowCalendarModal(true); setSelectedDate(""); setSelectedTimes([]); }} className="bg-[#A49EC2] text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-lg shadow-purple-200 flex items-center gap-2">
                    <Plus size={16} /> Takvimi Düzenle
                </button>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F7E9CE]">
                <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide flex items-center gap-2"><Calendar size={16} /> Müsait Olduğunuz Günler ve Saatler</h3>
                {availableSlots.length === 0 ? (
                    <div className="text-center py-8 bg-[#FDFBF7] rounded-2xl border border-dashed border-[#F7DCA1]">
                        <p className="text-gray-400 text-sm">Henüz müsait zaman eklemediniz.</p>
                        <button onClick={() => setShowCalendarModal(true)} className="text-[#A49EC2] text-xs font-bold mt-2 hover:underline">Şimdi Ekle</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(availableSlots.reduce((acc, slot) => { (acc[slot.date] = acc[slot.date] || []).push(slot); return acc; }, {} as Record<string, AvailableSlot[]>)).map(([date, slots]) => (
                            <div key={date} className="bg-[#FDFBF7] border border-[#F7E9CE] rounded-2xl p-4 relative group">
                                <button onClick={() => handleEditDay(date)} className="absolute top-3 right-3 text-[#A49EC2] bg-white p-1.5 rounded-lg border border-purple-100 hover:bg-purple-50 transition shadow-sm" title="Bu günü düzenle"><Edit3 size={14} /></button>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F7E9CE]">
                                    <div className="bg-[#A49EC2] text-white p-1.5 rounded-lg"><Calendar size={14} /></div>
                                    <span className="font-bold text-gray-700 text-sm">{new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {slots.sort((a, b) => a.time.localeCompare(b.time)).map(slot => (
                                        <div key={slot.id} className="bg-white text-[#A49EC2] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#A49EC2]/20 flex items-center gap-2 shadow-sm">
                                            {slot.time}
                                            <button onClick={() => handleDeleteSlot(slot.id)} className="text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition"><X size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-[#F7E9CE] overflow-hidden">
                {appointments.length === 0 ? <div className="p-8 text-center text-gray-400">Talep yok.</div> : appointments.map(app => (
                    <div key={app.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <div className="bg-[#F7E9CE] text-[#A49EC2] p-4 rounded-2xl flex flex-col items-center min-w-[80px]">
                            <span className="text-xs font-bold uppercase">{new Date(app.date).toLocaleString('tr-TR', { month: 'short' })}</span>
                            <span className="text-2xl font-bold">{new Date(app.date).getDate()}</span>
                            <span className="text-xs font-medium">{app.time}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-800 text-lg">{app.parentName}</h3>
                                {app.status === 'pending' && <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-bold">Onay Bekliyor</span>}
                                {app.status === 'approved' && <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-bold">Onaylandı</span>}
                                {app.status === 'rejected' && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">Reddedildi</span>}
                            </div>
                            <p className="text-gray-600 text-sm italic">"{app.topic}"</p>
                        </div>
                        {app.status === 'pending' && <div className="flex gap-2"><button onClick={() => handleAppointmentAction(app.id, 'approved')} className="bg-green-500 text-white p-3 rounded-xl"><CheckCircle size={20} /></button><button onClick={() => handleAppointmentAction(app.id, 'rejected')} className="bg-red-400 text-white p-3 rounded-xl"><XCircle size={20} /></button></div>}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderQuestions = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map(q => (
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
                    {blogPosts.map(post => (
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