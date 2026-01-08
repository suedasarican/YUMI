import React, { useState } from 'react';
import {
    Package, Plus, Trash2, X, Users, Mail, Key, Info,
    TrendingUp, Star, Lock
} from 'lucide-react';

// --- TİPLER (App.tsx ile uyumlu olmalı) ---
interface Product {
    id: number;
    name: string;
    category: number;
    ageGroup: number;
    price: number;
    description: string;
    stock: number;
    imageUrl?: string;
    isExpertApproved?: boolean;
}

const CATEGORIES = ["Motor Beceriler", "Dil Gelişimi", "Bilişsel Zeka", "Sosyal Duygusal"];

const getPlaceholderImage = (catId: number) => {
    const images = [
        "https://images.unsplash.com/photo-1596464716127-f9a8625579c3?w=400&q=80",
        "https://images.unsplash.com/photo-1618842676088-7e43c69bc266?w=400&q=80",
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80",
        "https://images.unsplash.com/photo-1515488042361-25f4682f0877?w=500&q=80"
    ];
    return images[catId % images.length] || images[0];
};

const AdminPanel = ({ products, setProducts, onLogout }: { products: Product[], setProducts: any, onLogout: () => void }) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'experts' | 'users'>('stats');
    const [showProductModal, setShowProductModal] = useState(false);
    const [showExpertModal, setShowExpertModal] = useState(false);

    // Form State'leri
    const [newProd, setNewProd] = useState({ name: '', category: 0, price: '', stock: '', description: '', imageUrl: '' });
    const [newExpert, setNewExpert] = useState({ name: '', email: '', password: '', info: '' });

    // Uzman Listesi State'i
    const [experts, setExperts] = useState([
        { id: 1, name: "Uzman Zeynep", email: "zeynep@yumi.com", articles: 24, answers: 156, status: "Aktif", info: "Çocuk Gelişimi Uzmanı" },
        { id: 2, name: "Uzman Mehmet", email: "mehmet@yumi.com", articles: 8, answers: 89, status: "Aktif", info: "Psikolog" }
    ]);

    const [users, setUsers] = useState([
        { id: 1, name: "Süeda Kaya", email: "sueda@test.com", date: "2024-01-08" },
        { id: 2, name: "Ahmet Yılmaz", email: "ahmet@test.com", date: "2024-01-07" }
    ]);

    // --- İŞLEMLER ---
    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const product: Product = {
            id: Date.now(),
            name: newProd.name,
            category: Number(newProd.category),
            price: Number(newProd.price),
            stock: Number(newProd.stock),
            description: newProd.description,
            imageUrl: newProd.imageUrl || getPlaceholderImage(Number(newProd.category)),
            ageGroup: 0
        };
        setProducts([product, ...products]);
        setShowProductModal(false);
        setNewProd({ name: '', category: 0, price: '', stock: '', description: '', imageUrl: '' });
    };

    const handleAddExpert = (e: React.FormEvent) => {
        e.preventDefault();
        const expert = {
            id: Date.now(),
            ...newExpert,
            articles: 0,
            answers: 0,
            status: "Aktif"
        };
        setExperts([expert, ...experts]);
        setShowExpertModal(false);
        setNewExpert({ name: '', email: '', password: '', info: '' });
    };

    const updateStock = (id: number, val: number) => {
        setProducts(products.map((p: any) => p.id === id ? { ...p, stock: Math.max(0, p.stock + val) } : p));
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">

                {/* HEADER */}
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-[#F7E9CE]">
                    <h1 className="text-2xl font-black text-[#A49EC2] flex items-center gap-2"><Lock /> YUMI ADMIN</h1>
                    <button onClick={onLogout} className="text-sm font-bold text-gray-400 hover:text-red-500 transition">Panelden Çık</button>
                </div>

                <div className="flex flex-col md:flex-row min-h-[600px] bg-white/95 backdrop-blur rounded-[2.5rem] shadow-2xl border border-[#F7E9CE] overflow-hidden animate-in zoom-in duration-300">

                    {/* --- ÜRÜN EKLEME MODAL --- */}
                    {showProductModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                            <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl border-4 border-white animate-in slide-in-from-bottom-8">
                                <div className="p-6 bg-[#75AFBC] text-white flex justify-between items-center">
                                    <h3 className="text-xl font-bold flex items-center gap-2"><Package /> Yeni Ürün Ekle</h3>
                                    <button onClick={() => setShowProductModal(false)}><X /></button>
                                </div>
                                <form onSubmit={handleAddProduct} className="p-8 grid grid-cols-2 gap-4">
                                    <input required className="col-span-2 p-3 border-2 border-[#F7E9CE] rounded-xl outline-none focus:border-[#75AFBC]" placeholder="Ürün Adı" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} />
                                    <select className="p-3 border-2 border-[#F7E9CE] rounded-xl outline-none" value={newProd.category} onChange={e => setNewProd({ ...newProd, category: Number(e.target.value) })}>
                                        {CATEGORIES.map((c, i) => <option key={i} value={i}>{c}</option>)}
                                    </select>
                                    <input required type="number" className="p-3 border-2 border-[#F7E9CE] rounded-xl outline-none" placeholder="Fiyat (₺)" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} />
                                    <input required type="number" className="p-3 border-2 border-[#F7E9CE] rounded-xl outline-none" placeholder="Stok Adedi" value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: e.target.value })} />
                                    <input className="p-3 border-2 border-[#F7E9CE] rounded-xl outline-none" placeholder="Görsel URL" value={newProd.imageUrl} onChange={e => setNewProd({ ...newProd, imageUrl: e.target.value })} />
                                    <textarea required className="col-span-2 p-3 border-2 border-[#F7E9CE] rounded-xl outline-none h-24 resize-none" placeholder="Ürün Açıklaması" value={newProd.description} onChange={e => setNewProd({ ...newProd, description: e.target.value })} />
                                    <button className="col-span-2 bg-[#75AFBC] text-white py-4 rounded-xl font-black shadow-lg">KATALOĞA EKLE</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* --- UZMAN EKLEME MODAL --- */}
                    {showExpertModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border-4 border-white animate-in slide-in-from-bottom-8">
                                <div className="p-6 bg-[#A49EC2] text-white flex justify-between items-center">
                                    <h3 className="text-xl font-bold flex items-center gap-2"><Users /> Yeni Uzman Ekle</h3>
                                    <button onClick={() => setShowExpertModal(false)}><X /></button>
                                </div>
                                <form onSubmit={handleAddExpert} className="p-8 space-y-4">
                                    <div className="flex items-center gap-2 p-3 border-2 border-[#F7E9CE] rounded-xl"><Users size={18} className="text-gray-400" /><input required className="flex-1 outline-none" placeholder="Ad Soyad" value={newExpert.name} onChange={e => setNewExpert({ ...newExpert, name: e.target.value })} /></div>
                                    <div className="flex items-center gap-2 p-3 border-2 border-[#F7E9CE] rounded-xl"><Mail size={18} className="text-gray-400" /><input required type="email" className="flex-1 outline-none" placeholder="E-Posta" value={newExpert.email} onChange={e => setNewExpert({ ...newExpert, email: e.target.value })} /></div>
                                    <div className="flex items-center gap-2 p-3 border-2 border-[#F7E9CE] rounded-xl"><Key size={18} className="text-gray-400" /><input required type="password" placeholder="Şifre" className="flex-1 outline-none" value={newExpert.password} onChange={e => setNewExpert({ ...newExpert, password: e.target.value })} /></div>
                                    <div className="flex items-start gap-2 p-3 border-2 border-[#F7E9CE] rounded-xl"><Info size={18} className="text-gray-400 mt-1" /><textarea required className="flex-1 outline-none h-20 resize-none" placeholder="Uzmanlık Alanı / Bio" value={newExpert.info} onChange={e => setNewExpert({ ...newExpert, info: e.target.value })} /></div>
                                    <button className="w-full bg-[#A49EC2] text-white py-4 rounded-xl font-black shadow-lg">UZMANI KAYDET</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-[#F7E9CE]/20 p-6 border-r border-[#F7E9CE] flex flex-col gap-2">
                        <h2 className="text-xl font-black text-[#A49EC2] mb-6 flex items-center gap-2"><Lock size={20} /> ADMİN</h2>
                        <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${activeTab === 'stats' ? 'bg-[#A49EC2] text-white shadow-lg' : 'text-gray-500 hover:bg-white'}`}><TrendingUp size={18} /> Raporlar</button>
                        <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${activeTab === 'products' ? 'bg-[#A49EC2] text-white shadow-lg' : 'text-gray-500 hover:bg-white'}`}><Package size={18} /> Ürünler</button>
                        <button onClick={() => setActiveTab('experts')} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${activeTab === 'experts' ? 'bg-[#A49EC2] text-white shadow-lg' : 'text-gray-500 hover:bg-white'}`}><Star size={18} /> Uzmanlar</button>
                        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${activeTab === 'users' ? 'bg-[#A49EC2] text-white shadow-lg' : 'text-gray-500 hover:bg-white'}`}><Users size={18} /> Kullanıcılar</button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        {activeTab === 'stats' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                                <div className="bg-[#75AFBC]/10 p-8 rounded-3xl border border-[#75AFBC]/20">
                                    <p className="text-xs font-bold text-[#75AFBC] uppercase tracking-widest">Aylık Ciro</p>
                                    <h3 className="text-4xl font-black text-gray-800">₺24.500</h3>
                                </div>
                                <div className="bg-[#FABDAD]/10 p-8 rounded-3xl border border-[#FABDAD]/20">
                                    <p className="text-xs font-bold text-[#FABDAD] uppercase tracking-widest">Aktif Ebeveyn</p>
                                    <h3 className="text-4xl font-black text-gray-800">{users.length}</h3>
                                </div>
                                <div className="bg-[#F7DCA1]/10 p-8 rounded-3xl border border-[#F7DCA1]/20">
                                    <p className="text-xs font-bold text-[#F7DCA1] uppercase tracking-widest">Kritik Stok</p>
                                    <h3 className="text-4xl font-black text-gray-800">{products.filter(p => p.stock < 5).length}</h3>
                                </div>
                            </div>
                        )}

                        {activeTab === 'products' && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-gray-800">Stok & Ürün Yönetimi</h3>
                                    <button onClick={() => setShowProductModal(true)} className="bg-[#75AFBC] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-blue-100"><Plus /> Yeni Ürün Ekle</button>
                                </div>
                                <div className="bg-white rounded-3xl border border-[#F7E9CE] shadow-sm overflow-hidden text-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b">
                                            <tr><th className="p-4">Ürün</th><th className="p-4">Kategori</th><th className="p-4">Stok</th><th className="p-4">İşlem</th></tr>
                                        </thead>
                                        <tbody>
                                            {products.map(p => (
                                                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                                    <td className="p-4 flex items-center gap-3">
                                                        <img src={p.imageUrl || getPlaceholderImage(p.category)} className="w-10 h-10 rounded-lg object-cover" />
                                                        <div><p className="font-bold">{p.name}</p><p className="text-xs text-[#75AFBC] font-bold">₺{p.price}</p></div>
                                                    </td>
                                                    <td className="p-4"><span className="bg-[#F7E9CE]/50 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">{CATEGORIES[p.category]}</span></td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => updateStock(p.id, -1)} className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-red-50">-</button>
                                                            <span className="font-bold w-6 text-center">{p.stock}</span>
                                                            <button onClick={() => updateStock(p.id, 1)} className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-green-50">+</button>
                                                        </div>
                                                    </td>
                                                    <td className="p-4"><button onClick={() => setProducts(products.filter((pr: any) => pr.id !== p.id))} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'experts' && (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-gray-800">Uzman Aktivite Kontrolü</h3>
                                    <button onClick={() => setShowExpertModal(true)} className="bg-[#A49EC2] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-purple-100"><Plus /> Yeni Uzman Ekle</button>
                                </div>
                                <div className="grid gap-4">
                                    {experts.map(exp => (
                                        <div key={exp.id} className="bg-white border border-[#F7E9CE] p-6 rounded-3xl flex justify-between items-center shadow-sm hover:shadow-md transition">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#A49EC2] rounded-full flex items-center justify-center text-white font-bold text-xl">{exp.name.charAt(6)}</div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-lg">{exp.name}</p>
                                                    <p className="text-xs text-[#A49EC2] font-bold italic">{exp.info}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-6 text-center border-l pl-6 items-center">
                                                <div className="hidden sm:block"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Yazı</p><p className="font-black text-[#A49EC2]">{exp.articles}</p></div>
                                                <div className="hidden sm:block"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Yanıt</p><p className="font-black text-[#75AFBC]">{exp.answers}</p></div>
                                                <button onClick={() => setExperts(experts.filter(e => e.id !== exp.id))} className="p-3 text-red-300 hover:bg-red-50 rounded-xl transition"><Trash2 size={20} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="space-y-4 animate-in fade-in text-sm">
                                <h3 className="text-2xl font-bold text-gray-800">Kullanıcı Yönetimi</h3>
                                {users.map(u => (
                                    <div key={u.id} className="flex justify-between items-center p-4 bg-white border border-[#F7E9CE] rounded-2xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#F7E9CE] rounded-full flex items-center justify-center text-[#A49EC2] font-bold">{u.name.charAt(0)}</div>
                                            <div><p className="font-bold text-gray-800">{u.name}</p><p className="text-xs text-gray-400">{u.email} • {u.date}</p></div>
                                        </div>
                                        <button onClick={() => setUsers(users.filter(us => us.id !== u.id))} className="text-red-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;