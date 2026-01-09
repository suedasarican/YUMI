import React, { useState, useEffect } from 'react';
import {
    Package, Plus, Trash2, X, Users, Mail, Key, Info,
    TrendingUp, Star, Lock, CheckCircle2
} from 'lucide-react';

// --- TİPLER ---
interface Product {
    id: number;
    name: string;
    category: number;
    ageGroup: number;
    price: number;
    description: string;
    stock: number;
    imageUrl?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: any; // Sayı veya String gelebilir, esnek yaptık
    isActive: boolean;
}

const CATEGORIES = ["Motor Beceriler", "Dil Gelişimi", "Bilişsel Zeka", "Sosyal Duygusal"];
const API_BASE = "http://localhost:5063/api/Admin";

const AdminPanel = ({ onLogout }: { onLogout: () => void }) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'experts' | 'users'>('stats');
    const [products, setProducts] = useState<Product[]>([]);
    const [experts, setExperts] = useState<User[]>([]);
    const [parents, setParents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [showProductModal, setShowProductModal] = useState(false);
    const [showExpertModal, setShowExpertModal] = useState(false);

    const [newProd, setNewProd] = useState({ name: '', category: 0, price: '', stock: '', description: '', imageUrl: '' });
    const [newExpert, setNewExpert] = useState({ name: '', email: '', password: '' });

    // --- GÜÇLENDİRİLMİŞ VERİ ÇEKME FONKSİYONU ---
    const loadData = async () => {
        setLoading(true);
        try {
            console.log("1. Veriler çekiliyor...");

            // 1. Ürünleri Çek
            // AdminController'da eklediğin [HttpGet("products")] metoduna istek atıyoruz
            const prodRes = await fetch(`${API_BASE}/products`);
            if (prodRes.ok) {
                const prodData = await prodRes.json();
                setProducts(prodData);
                console.log("2. Ürünler Geldi:", prodData.length, "adet");
            } else {
                console.error("Ürünler çekilemedi:", prodRes.status);
            }

            // 2. Kullanıcıları Çek
            const userRes = await fetch(`${API_BASE}/users`);
            if (userRes.ok) {
                const allUsers = await userRes.json();
                console.log("3. Ham Kullanıcı Listesi:", allUsers); // Konsola bakıp gelen veriyi görebilirsin

                // --- FİLTRELEME MANTIĞI (SORUN BURADAYDI) ---
                // Backend'den veri "role", "Role", "userRole" gibi farklı gelebilir.
                // Hepsini kapsayan güvenli filtreleme:

                // UZMANLARI BUL (Role: 1 veya "Expert")
                const expertList = allUsers.filter((u: any) => {
                    const r = u.role !== undefined ? u.role : u.Role;
                    // Hem sayı (1) hem string ("Expert") kontrolü
                    return r === 1 || r === "1" || r === "Expert" || r === "Uzman";
                });

                // EBEVEYNLERİ BUL (Role: 2 veya "Parent")
                const parentList = allUsers.filter((u: any) => {
                    const r = u.role !== undefined ? u.role : u.Role;
                    // Hem sayı (2) hem string ("Parent") kontrolü
                    return r === 2 || r === "2" || r === "Parent" || r === "Ebeveyn";
                });

                console.log(`4. Ayrıştırma Sonucu: ${expertList.length} Uzman, ${parentList.length} Ebeveyn`);

                setExperts(expertList);
                setParents(parentList);
            } else {
                console.error("Kullanıcılar çekilemedi:", userRes.status);
            }

        } catch (error) {
            console.error("KRİTİK HATA:", error);
            alert("Veritabanına bağlanılamadı. Backend çalışıyor mu?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // --- DİĞER FONKSİYONLAR (DEĞİŞMEDİ) ---

    const handleDeleteUser = async (id: number, roleName: string) => {
        if (!window.confirm(`Bu ${roleName} kaydını silmek istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                setExperts(prev => prev.filter(u => (u.id || (u as any).Id) !== id));
                setParents(prev => prev.filter(u => (u.id || (u as any).Id) !== id));
                alert(data.message);
            } else {
                alert(data.message || "İşlem başarısız.");
            }
        } catch (error) {
            alert("Sunucuya bağlanılamadı.");
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const productData = {
            name: newProd.name,
            category: Number(newProd.category),
            price: parseFloat(newProd.price),
            stock: parseInt(newProd.stock),
            description: newProd.description,
            imageUrl: newProd.imageUrl || "",
            ageGroup: 0
        };

        const res = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (res.ok) {
            const saved = await res.json();
            setProducts([saved, ...products]);
            setShowProductModal(false);
            setNewProd({ name: '', category: 0, price: '', stock: '', description: '', imageUrl: '' });
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
        if (res.ok) setProducts(products.filter(p => p.id !== id));
    };

    const handleAddExpert = async (e: React.FormEvent) => {
        e.preventDefault();
        const expertData = {
            name: newExpert.name,
            email: newExpert.email,
            passwordHash: newExpert.password,
            role: 1,
            isActive: true
        };

        try {
            const res = await fetch(`${API_BASE}/experts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expertData)
            });

            if (res.ok) {
                const saved = await res.json();
                setExperts(prev => [saved, ...prev]);
                setShowExpertModal(false);
                setNewExpert({ name: '', email: '', password: '' });
                alert("Uzman veritabanına başarıyla eklendi!");
            }
        } catch (error) {
            alert("Bağlantı hatası!");
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">

                {/* HEADER */}
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-[#F7E9CE]">
                    <h1 className="text-2xl font-black text-[#A49EC2] flex items-center gap-2"><Lock /> YUMI ADMIN</h1>
                    <button onClick={onLogout} className="text-sm font-bold text-gray-400 hover:text-red-500 transition">Güvenli Çıkış</button>
                </div>

                <div className="flex flex-col md:flex-row min-h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-[#F7E9CE] overflow-hidden">

                    {/* SIDEBAR */}
                    <div className="w-full md:w-64 bg-[#F7E9CE]/20 p-6 border-r border-[#F7E9CE] flex flex-col gap-2">
                        <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-3 p-3 rounded-xl font-bold ${activeTab === 'stats' ? 'bg-[#A49EC2] text-white' : 'text-gray-500'}`}><TrendingUp size={18} /> Raporlar</button>
                        <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 p-3 rounded-xl font-bold ${activeTab === 'products' ? 'bg-[#A49EC2] text-white' : 'text-gray-500'}`}><Package size={18} /> Ürünler</button>
                        <button onClick={() => setActiveTab('experts')} className={`flex items-center gap-3 p-3 rounded-xl font-bold ${activeTab === 'experts' ? 'bg-[#A49EC2] text-white' : 'text-gray-500'}`}><Star size={18} /> Uzmanlar</button>
                        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 p-3 rounded-xl font-bold ${activeTab === 'users' ? 'bg-[#A49EC2] text-white' : 'text-gray-500'}`}><Users size={18} /> Ebeveynler</button>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        {loading ? <p className="text-center font-bold text-[#A49EC2]">Supabase'e bağlanılıyor...</p> : (
                            <>
                                {activeTab === 'stats' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                                        <div className="bg-[#75AFBC]/10 p-8 rounded-3xl border border-[#75AFBC]/20">
                                            <p className="text-xs font-bold text-[#75AFBC]">TOPLAM ÜRÜN</p>
                                            <h3 className="text-4xl font-black">{products.length}</h3>
                                        </div>
                                        <div className="bg-[#FABDAD]/10 p-8 rounded-3xl border border-[#FABDAD]/20">
                                            <p className="text-xs font-bold text-[#FABDAD]">UZMAN SAYISI</p>
                                            <h3 className="text-4xl font-black">{experts.length}</h3>
                                        </div>
                                        <div className="bg-[#F7DCA1]/10 p-8 rounded-3xl border border-[#F7DCA1]/20">
                                            <p className="text-xs font-bold text-[#F7DCA1]">EBEVEYN SAYISI</p>
                                            <h3 className="text-4xl font-black">{parents.length}</h3>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'products' && (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-2xl font-bold text-gray-800">Ürün Yönetimi</h3>
                                            <button onClick={() => setShowProductModal(true)} className="bg-[#75AFBC] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus /> Ürün Ekle</button>
                                        </div>
                                        <div className="bg-white rounded-3xl border border-[#F7E9CE] overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr><th className="p-4">Ürün Adı</th><th className="p-4">Kategori</th><th className="p-4">Stok</th><th className="p-4">İşlem</th></tr>
                                                </thead>
                                                <tbody>
                                                    {products.map(p => (
                                                        <tr key={p.id} className="border-t">
                                                            <td className="p-4 font-bold">{p.name}</td>
                                                            <td className="p-4">{CATEGORIES[p.category]}</td>
                                                            <td className="p-4">{p.stock} Adet</td>
                                                            <td className="p-4"><button onClick={() => handleDeleteProduct(p.id)} className="text-red-300 hover:text-red-500"><Trash2 size={18} /></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'experts' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-2xl font-bold">Uzman Kadromuz</h3>
                                            <button onClick={() => setShowExpertModal(true)} className="bg-[#A49EC2] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus /> Uzman Kaydet</button>
                                        </div>
                                        <div className="grid gap-4">
                                            {experts.map(exp => {
                                                const id = exp.id || (exp as any).Id;
                                                const name = exp.name || (exp as any).Name;
                                                const email = exp.email || (exp as any).Email;
                                                return (
                                                    <div key={id} className="bg-white border border-[#F7E9CE] p-4 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-[#A49EC2] text-white rounded-full flex items-center justify-center font-bold">{name?.charAt(0)}</div>
                                                            <div><p className="font-bold text-gray-800">{name}</p><p className="text-xs text-gray-400">{email}</p></div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-2 text-green-500 font-bold text-xs"><CheckCircle2 size={14} /> AKTİF</div>
                                                            <button onClick={() => handleDeleteUser(id, "Uzman")} className="p-2 text-red-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition"><Trash2 size={20} /></button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'users' && (
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold">Kayıtlı Ebeveynler</h3>
                                        {parents.map(u => {
                                            const id = u.id || (u as any).Id;
                                            const name = u.name || (u as any).Name;
                                            const email = u.email || (u as any).Email;
                                            return (
                                                <div key={id} className="flex justify-between items-center p-4 bg-white border border-[#F7E9CE] rounded-2xl shadow-sm hover:shadow-md transition">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#FABDAD] text-white rounded-full flex items-center justify-center font-bold">{name?.charAt(0)}</div>
                                                        <div><p className="font-bold">{name}</p><p className="text-xs text-gray-400">{email}</p></div>
                                                    </div>
                                                    <button onClick={() => handleDeleteUser(id, "Ebeveyn")} className="text-red-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"><Trash2 size={18} /></button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ÜRÜN EKLEME MODAL */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-[2rem] p-8 shadow-2xl">
                        <h3 className="text-2xl font-black text-gray-800 mb-6">Yeni Ürün Tanımla</h3>
                        <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4">
                            <input required className="col-span-2 p-3 border-2 border-gray-100 rounded-xl outline-none" placeholder="Ürün Adı" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} />
                            <select className="p-3 border-2 border-gray-100 rounded-xl outline-none" value={newProd.category} onChange={e => setNewProd({ ...newProd, category: Number(e.target.value) })}>
                                {CATEGORIES.map((c, i) => <option key={i} value={i}>{c}</option>)}
                            </select>
                            <input required type="number" className="p-3 border-2 border-gray-100 rounded-xl outline-none" placeholder="Fiyat (₺)" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} />
                            <input required type="number" className="p-3 border-2 border-gray-100 rounded-xl outline-none" placeholder="Stok" value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: e.target.value })} />
                            <textarea required className="col-span-2 p-3 border-2 border-gray-100 rounded-xl h-24 outline-none resize-none" placeholder="Açıklama" value={newProd.description} onChange={e => setNewProd({ ...newProd, description: e.target.value })} />
                            <button className="col-span-2 bg-[#75AFBC] text-white py-4 rounded-xl font-black shadow-lg">DATABASE'E EKLE</button>
                        </form>
                    </div>
                </div>
            )}

            {/* UZMAN EKLEME MODAL */}
            {showExpertModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
                        <h3 className="text-2xl font-black text-gray-800 mb-6">Yeni Uzman Kaydı</h3>
                        <form onSubmit={handleAddExpert} className="space-y-4">
                            <input required className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none" placeholder="Ad Soyad" value={newExpert.name} onChange={e => setNewExpert({ ...newExpert, name: e.target.value })} />
                            <input required type="email" className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none" placeholder="E-posta" value={newExpert.email} onChange={e => setNewExpert({ ...newExpert, email: e.target.value })} />
                            <input required type="password" className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none" placeholder="Şifre" value={newExpert.password} onChange={e => setNewExpert({ ...newExpert, password: e.target.value })} />
                            <button className="w-full bg-[#A49EC2] text-white py-4 rounded-xl font-black shadow-lg">UZMANI SİSTEME EKLE</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;