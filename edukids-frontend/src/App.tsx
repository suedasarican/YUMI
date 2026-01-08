import React, { useState, useEffect } from 'react';
import {
  User, ShoppingCart, BookOpen, CheckCircle, Plus,
  BarChart3, Baby, LogOut, Trash2, X, ArrowLeft, AlertTriangle, LogIn,
  Search, Filter, LayoutDashboard, DollarSign, Package, Users, Image as ImageIcon, Database
} from 'lucide-react';

// --- CONFIG ---
const API_BASE = "http://localhost:5063/api";

// --- TYPES ---
type UserRole = 'Admin' | 'Expert' | 'Parent';
interface UserType { id: number; name: string; email: string; role: number; }
interface Product {
  id: number;
  name: string;
  category: number; // 0: Bilişsel, 1: Dil, 2: Motor, 3: Zeka
  ageGroup: number; // 0: 0-3, 1: 3-6, 2: 6-12
  price: number;
  description: string;
  stock: number;
  imageUrl?: string;
}
interface ChildProfile { id: number; parentId: number; name: string; age: number; interests: string; }
interface GameGuide { id: number; productId: number; expertId: number; content: string; productName?: string; }

// --- HELPERS & CONSTANTS ---
const CATEGORIES = ["Bilişsel", "Dil", "Motor", "Zeka"];
const AGE_GROUPS = ["0-3 Yaş", "3-6 Yaş", "6-12 Yaş"];

// --- MOCK DATA ---
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Montessori Şekil Seti", category: 2, ageGroup: 0, price: 450, stock: 15, description: "Ahşap geometrik şekillerle motor beceri geliştirme.", imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=300" },
  { id: 2, name: "Duygu Kartları", category: 1, ageGroup: 1, price: 120, stock: 50, description: "Çocukların duygularını ifade etmesini sağlayan 50 kart.", imageUrl: "https://images.unsplash.com/photo-1606092195730-5d7b9af1ef4d?auto=format&fit=crop&q=80&w=300" },
  { id: 3, name: "Kodlama Robotu", category: 3, ageGroup: 2, price: 1250, stock: 5, description: "Temel algoritma mantığı öğreten programlanabilir robot.", imageUrl: "https://images.unsplash.com/photo-1535378437327-b71494669e9d?auto=format&fit=crop&q=80&w=300" },
  { id: 4, name: "Ahşap Bloklar", category: 2, ageGroup: 1, price: 300, stock: 20, description: "Yaratıcılığı geliştiren doğal ahşap bloklar.", imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=300" },
  { id: 5, name: "İlk Kelimelerim Kitabı", category: 1, ageGroup: 0, price: 85, stock: 100, description: "Resimli sözlük ile dil gelişimi.", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300" },
  { id: 6, name: "Zeka Küpü Seti", category: 3, ageGroup: 2, price: 150, stock: 30, description: "Problem çözme yeteneğini artıran zeka oyunları.", imageUrl: "https://images.unsplash.com/photo-1595758117029-943063f2780e?auto=format&fit=crop&q=80&w=300" },
  { id: 7, name: "Sayı Eşleştirme Puzzle", category: 0, ageGroup: 1, price: 180, stock: 25, description: "Matematiğe ilk adım sayı eşleştirme.", imageUrl: "https://images.unsplash.com/photo-1583324621878-436336340317?auto=format&fit=crop&q=80&w=300" },
  { id: 8, name: "Renkli Ksilofon", category: 0, ageGroup: 0, price: 220, stock: 12, description: "Müzik kulağını geliştiren eğitici çalgı.", imageUrl: "https://images.unsplash.com/photo-1576331189483-39446d32ce7d?auto=format&fit=crop&q=80&w=300" },
];

const MOCK_CHILDREN: ChildProfile[] = [
  { id: 101, parentId: 1, name: "Can (Demo)", age: 4, interests: "Arabalar" }
];

const MOCK_GUIDES: GameGuide[] = [
  { id: 1, productId: 1, expertId: 11, content: "Bu set ile önce daireden başlayın...", productName: "Montessori Şekil Seti" }
];

// --- COMPONENTS ---

const LoginScreen = ({ onLogin }: { onLogin: (user: UserType) => void }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });

  const performLogin = async (email: string, pass: string, isDemo: boolean = false) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (res.ok) {
        onLogin(await res.json());
      } else {
        if (confirm("Kullanıcı bulunamadı. " + (isDemo ? "Demo hesap oluşturulsun mu?" : "Demo modunda devam edilsin mi?"))) throw new Error("Demo");
      }
    } catch (error) {
      console.warn(`Backend'e ulaşılamadı. Demo moduna geçiliyor.`);
      let role = 2;
      if (email.includes('admin')) role = 0;
      if (email.includes('expert')) role = 1;
      onLogin({ id: role === 0 ? 1 : role === 1 ? 11 : 101, name: isDemo ? `Demo Kullanıcı` : email.split('@')[0], email, role: role });
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => { e.preventDefault(); performLogin(loginEmail, loginPass); };
  const handleDemoLogin = (role: UserRole) => {
    // E-Postalar güncellendi: @yumi.com
    let email = role === 'Admin' ? "admin@yumi.com" : role === 'Expert' ? "expert@yumi.com" : "parent@yumi.com";
    performLogin(email, "demo", true);
  };

  // --- YENİ EKLENEN: Veritabanına Admin/Uzman Ekleme Fonksiyonu ---
  const handleCreateDefaultUsers = async () => {
    setLoading(true);
    try {
      // Admin Ekle
      await fetch(`${API_BASE}/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "Sistem Yöneticisi", email: "admin@yumi.com", passwordHash: "demo", role: 0, isActive: true })
      });

      // Uzman Ekle
      await fetch(`${API_BASE}/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "Pedagog Zeynep", email: "expert@yumi.com", passwordHash: "demo", role: 1, isActive: true })
      });

      alert("✅ Başarılı! Admin ve Uzman hesapları veritabanına eklendi.\n\nAdmin: admin@yumi.com\nUzman: expert@yumi.com\nŞifreler: demo");
    } catch (e) {
      alert("❌ Hata: Backend sunucusuna ulaşılamadı veya hesaplar zaten var.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regForm.name, email: regForm.email, passwordHash: regForm.password, role: 2, isActive: true })
      });
      if (res.ok) { alert("Kayıt başarılı!"); setView('login'); setLoginEmail(regForm.email); setLoginPass(""); }
      else { const err = await res.json(); alert("Hata: " + (err.message || "Kayıt yapılamadı.")); }
    } catch (error) { alert("Backend bağlantı hatası!"); }
  };

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-8 border-blue-500 relative">
          <button onClick={() => setView('login')} className="absolute top-4 left-4 text-gray-400"><ArrowLeft size={24} /></button>
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">YUMİ Ailesine Katıl</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <input required placeholder="Ad Soyad" className="w-full border p-2 rounded" value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} />
            <input required type="email" placeholder="E-Posta" className="w-full border p-2 rounded" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
            <input required type="password" placeholder="Şifre" className="w-full border p-2 rounded" value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Hesap Oluştur</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-8 border-orange-500">
        <div className="mb-6 flex justify-center"><div className="bg-orange-100 p-4 rounded-full"><Baby size={48} className="text-orange-600" /></div></div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">YUMİ</h1>
        <p className="text-gray-500 mb-6">Gelişim Odaklı Çocuk Market</p>
        <form onSubmit={handleManualLogin} className="space-y-3 mb-6 text-left">
          <div><label className="text-xs font-bold text-gray-500 ml-1">E-Posta</label><input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full border p-2 rounded" placeholder="ornek@email.com" /></div>
          <div><label className="text-xs font-bold text-gray-500 ml-1">Şifre</label><input required type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full border p-2 rounded" placeholder="******" /></div>
          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition">{loading ? "Giriş Yapılıyor..." : <><LogIn size={18} /> Giriş Yap</>}</button>
        </form>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => handleDemoLogin('Parent')} className="bg-blue-50 text-blue-600 py-2 rounded text-xs font-bold flex flex-col items-center"><User size={16} /> Ebeveyn</button>
          <button onClick={() => handleDemoLogin('Expert')} className="bg-emerald-50 text-emerald-600 py-2 rounded text-xs font-bold flex flex-col items-center"><BookOpen size={16} /> Uzman</button>
          <button onClick={() => handleDemoLogin('Admin')} className="bg-gray-100 text-gray-600 py-2 rounded text-xs font-bold flex flex-col items-center"><BarChart3 size={16} /> Yönetici</button>
        </div>

        {/* VERİTABANI OLUŞTURMA BUTONU */}
        <button onClick={handleCreateDefaultUsers} className="mt-4 w-full bg-slate-800 text-white text-xs py-2 rounded flex items-center justify-center gap-2 hover:bg-slate-900">
          <Database size={14} /> Admin & Uzman Hesaplarını Oluştur
        </button>

        <div className="mt-4 pt-4 border-t border-gray-100"><button onClick={() => setView('register')} className="text-orange-600 font-bold hover:underline">Hemen Kayıt Ol</button></div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/Public/products`);
      if (res.ok) { setProducts(await res.json()); setIsOffline(false); }
      else throw new Error("Hata");
    } catch (err) {
      console.warn("Backend yok. Demo veri.");
      setProducts(MOCK_PRODUCTS); setIsOffline(true);
    }
  };

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    alert(`${product.name} sepete eklendi!`);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />;
  const getRoleName = (r: number) => r === 0 ? 'Admin' : r === 1 ? 'Uzman' : 'Ebeveyn';

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      {isOffline && <div className="bg-yellow-100 border-b border-yellow-200 text-yellow-800 px-4 py-2 text-sm font-bold flex items-center justify-center gap-2"><AlertTriangle size={16} /><span>Backend Bağlantısı Yok - Demo Modu</span></div>}

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="bg-orange-500 p-2 rounded-lg text-white"><Baby size={20} /></div><span className="font-bold text-xl text-gray-800">YUMİ</span></div>
          <div className="flex items-center gap-6">
            {currentUser.role === 2 && (
              <button onClick={() => setShowCart(true)} className="relative p-2 text-gray-600 hover:text-orange-600">
                <ShoppingCart size={24} />
                {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>}
              </button>
            )}
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-gray-700">{currentUser.name}</span>
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase font-bold">{getRoleName(currentUser.role)}</span>
            </div>
            <button onClick={() => setCurrentUser(null)} className="text-gray-400 hover:text-red-500"><LogOut size={20} /></button>
          </div>
        </div>
      </nav>

      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-96 h-full shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b pb-4"><h2 className="text-xl font-bold">Sepetim ({cart.length})</h2><button onClick={() => setShowCart(false)}><X /></button></div>
            <div className="flex-1 overflow-auto space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <div><div className="font-bold text-sm">{item.name}</div><div className="text-xs text-gray-500">₺{item.price}</div></div>
                  <button onClick={() => removeFromCart(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold text-lg mb-4"><span>Toplam:</span><span>₺{cart.reduce((a, b) => a + b.price, 0)}</span></div>
              <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600">Ödemeye Geç</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentUser.role === 0 && <AdminPanel products={products} refresh={fetchProducts} />}
        {currentUser.role === 2 && <ParentPanel products={products} user={currentUser} onAddToCart={addToCart} />}
        {currentUser.role === 1 && <ExpertPanel products={products} user={currentUser} />}
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

const AdminPanel = ({ products, refresh }: { products: Product[], refresh: () => void }) => {
  const [form, setForm] = useState({ name: '', price: '', stock: '10', imageUrl: '' });

  const handleAdd = async () => {
    try {
      await fetch(`${API_BASE}/Admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
          description: "Yeni ürün",
          ageGroup: 1,
          category: 0,
          imageUrl: form.imageUrl
        })
      });
      setForm({ name: '', price: '', stock: '10', imageUrl: '' });
      refresh();
    } catch (e) { alert("Bağlantı yok."); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Silinsin mi?")) return;
    try { await fetch(`${API_BASE}/Admin/products/${id}`, { method: 'DELETE' }); refresh(); }
    catch (e) { alert("Bağlantı yok."); }
  };

  return (
    <div className="space-y-8">
      {/* 1. DASHBOARD İSTATİSTİKLERİ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><DollarSign /></div>
          <div><p className="text-sm text-gray-500">Toplam Ciro</p><h3 className="text-2xl font-bold text-gray-800">₺48,250</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Package /></div>
          <div><p className="text-sm text-gray-500">Toplam Sipariş</p><h3 className="text-2xl font-bold text-gray-800">142</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600"><LayoutDashboard /></div>
          <div><p className="text-sm text-gray-500">Aktif Ürünler</p><h3 className="text-2xl font-bold text-gray-800">{products.length}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600"><Users /></div>
          <div><p className="text-sm text-gray-500">Kayıtlı Ebeveyn</p><h3 className="text-2xl font-bold text-gray-800">1,204</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. ÜRÜN EKLEME FORMU */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus className="text-orange-500" size={20} /> Yeni Ürün Ekle</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500">Ürün Adı</label>
              <input className="w-full border p-2 rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-500">Fiyat (₺)</label>
                <input className="w-full border p-2 rounded" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Stok</label>
                <input className="w-full border p-2 rounded" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Görsel URL</label>
              <div className="flex items-center gap-2">
                <input className="w-full border p-2 rounded" placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                <ImageIcon className="text-gray-400" size={20} />
              </div>
            </div>
            <button onClick={handleAdd} className="w-full bg-gray-800 text-white py-2 rounded font-bold hover:bg-gray-900 mt-2">Ürünü Kaydet</button>
          </div>
        </div>

        {/* 3. ÜRÜN LİSTESİ */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-700">Ürün Envanteri</h3></div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">Görsel</th><th className="p-4">Ad</th><th className="p-4">Stok</th><th className="p-4">Fiyat</th><th className="p-4">İşlem</th></tr></thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p.id}>
                  <td className="p-4">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={16} /></div>}
                    </div>
                  </td>
                  <td className="p-4 font-bold">{p.name}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{p.stock} Adet</span></td>
                  <td className="p-4">₺{p.price}</td>
                  <td className="p-4"><button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ParentPanel = ({ products, user, onAddToCart }: any) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'kids'>('shop');
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [newChildName, setNewChildName] = useState("");

  // FİLTRELEME STATE'LERİ
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);

  useEffect(() => { if (activeTab === 'kids') fetchChildren(); }, [activeTab]);

  const fetchChildren = async () => {
    try {
      const res = await fetch(`${API_BASE}/Parent/children/${user.id}`);
      if (res.ok) setChildren(await res.json()); else setChildren(MOCK_CHILDREN);
    } catch (e) { setChildren(MOCK_CHILDREN); }
  };

  const handleAddChild = async () => {
    try {
      await fetch(`${API_BASE}/Parent/children`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parentId: user.id, name: newChildName, age: 5, interests: "Oyun" }) });
      setNewChildName(""); fetchChildren();
    } catch (e) { alert("Backend yok."); }
  };

  const handleDeleteChild = (id: number) => {
    if (confirm("Profil silinsin mi?")) setChildren(children.filter(c => c.id !== id));
  };

  // Ürünleri Filtrele
  const filteredProducts = products.filter((p: Product) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === null || p.category === selectedCat;
    const matchesAge = selectedAge === null || p.ageGroup === selectedAge;
    return matchesSearch && matchesCat && matchesAge;
  });

  return (
    <div>
      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setActiveTab('shop')} className={`pb-3 px-4 ${activeTab === 'shop' ? 'border-b-2 border-orange-500 text-orange-600 font-bold' : ''}`}>Mağaza</button>
        <button onClick={() => setActiveTab('kids')} className={`pb-3 px-4 ${activeTab === 'kids' ? 'border-b-2 border-orange-500 text-orange-600 font-bold' : ''}`}>Çocuklarım</button>
      </div>

      {activeTab === 'shop' ? (
        <div className="flex flex-col md:flex-row gap-6">
          {/* FİLTRELEME MENÜSÜ (SIDEBAR) */}
          <div className="w-full md:w-64 shrink-0 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" placeholder="Ürün ara..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2"><Filter size={14} /> Kategoriler</h3>
                <div className="space-y-1">
                  {["Tümü", "Bilişsel", "Dil", "Motor", "Zeka"].map((cat, idx) => (
                    <button key={cat} onClick={() => setSelectedCat(idx === 0 ? null : idx - 1)}
                      className={`w-full text-left px-3 py-1.5 rounded text-sm ${((selectedCat === null && idx === 0) || selectedCat === idx - 1) ? 'bg-orange-100 text-orange-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2"><Baby size={14} /> Yaş Grubu</h3>
                <div className="space-y-1">
                  {["Tümü", "0-3 Yaş", "3-6 Yaş", "6-12 Yaş"].map((age, idx) => (
                    <button key={age} onClick={() => setSelectedAge(idx === 0 ? null : idx - 1)}
                      className={`w-full text-left px-3 py-1.5 rounded text-sm ${((selectedAge === null && idx === 0) || selectedAge === idx - 1) ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}>
                      {age}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ÜRÜN LİSTESİ (GRID) */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-gray-500 font-medium">{filteredProducts.length} ürün bulundu</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProducts.map((product: any) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition">
                  <div className="h-48 bg-gray-100 relative">
                    {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={32} /></div>}
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">{CATEGORIES[product.category]}</div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-xs text-blue-600 font-medium bg-blue-50 w-fit px-2 py-0.5 rounded mb-2">{AGE_GROUPS[product.ageGroup]}</p>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="font-bold text-xl text-gray-900">₺{product.price}</span>
                      <button onClick={() => onAddToCart(product)} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition flex items-center gap-2">
                        <ShoppingCart size={16} /> Ekle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400">Aradığınız kriterlere uygun ürün bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm flex gap-2 items-center">
            <input className="border p-2 rounded" placeholder="Çocuk Adı" value={newChildName} onChange={e => setNewChildName(e.target.value)} />
            <button onClick={handleAddChild} className="bg-blue-600 text-white px-4 py-2 rounded">Kaydet (Create)</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-xl border flex justify-between items-center">
                <div className="flex items-center gap-4"><div className="bg-blue-100 p-3 rounded-full text-blue-600"><Baby /></div><div><h3 className="font-bold">{c.name}</h3><p className="text-sm">{c.age} Yaşında</p></div></div>
                <button onClick={() => handleDeleteChild(c.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- YENİ EKLENEN UZMAN PANELİ ---
const ExpertPanel = ({ products, user }: { products: Product[], user: UserType }) => {
  const [guides, setGuides] = useState<GameGuide[]>(MOCK_GUIDES);
  const [content, setContent] = useState("");
  const [selectedProd, setSelectedProd] = useState(0);

  const handleCreateGuide = async () => {
    if (!selectedProd || !content) return alert("Lütfen ürün seçin ve içerik girin.");
    try {
      await fetch(`${API_BASE}/Expert/guides`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: selectedProd, expertId: user.id, content }) });
      alert("Rehber yayınlandı!");
    } catch (e) { console.warn("Backend yok, UI'da gösteriliyor."); }
    const prodName = products.find(p => p.id === Number(selectedProd))?.name;
    setGuides([...guides, { id: Date.now(), productId: Number(selectedProd), expertId: user.id, content, productName: prodName }]);
    setContent("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BookOpen className="text-emerald-500" size={20} /> Yeni Rehber Oluştur</h2>
        <div className="space-y-3">
          <select className="w-full border p-2 rounded" onChange={e => setSelectedProd(Number(e.target.value))}>
            <option value={0}>Rehber yazılacak ürünü seçin...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <textarea className="w-full border p-2 rounded h-32 text-sm" placeholder="Pedagojik içerik..." value={content} onChange={e => setContent(e.target.value)}></textarea>
          <button onClick={handleCreateGuide} className="w-full bg-emerald-500 text-white py-2 rounded font-medium hover:bg-emerald-600">Rehberi Yayınla</button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4">Yayınlanan Rehberler</h2>
        <div className="space-y-4 max-h-96 overflow-auto">
          {guides.map(g => (
            <div key={g.id} className="p-3 bg-gray-50 rounded border border-gray-100">
              <div className="flex justify-between items-start mb-1"><span className="text-xs font-bold text-emerald-700">{g.productName || "Ürün #" + g.productId}</span><span className="text-xs text-gray-400">Az önce</span></div>
              <p className="text-sm text-gray-600">{g.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};