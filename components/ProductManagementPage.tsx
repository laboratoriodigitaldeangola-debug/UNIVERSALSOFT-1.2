
import React, { useState, useEffect } from 'react';
import { ManagedProduct } from '../types';
import { getProducts, saveProduct, deleteProduct } from '../services/supabase';

export const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<ManagedProduct, 'id'>>({
    tipo: 'serviço',
    codigo: '',
    descricao: '',
    precoUnitario: 0,
    unidade: 'Serviço',
    taxaIVA: 14,
    status: 'active'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  const validateCode = (code: string) => {
    if (!code.trim()) return "O código é obrigatório.";
    if (!/^[a-zA-Z0-9_-]+$/.test(code)) return "O código não pode conter caracteres especiais ou espaços.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateCode(formData.codigo);
    if (error) {
      setCodeError(error);
      return;
    }
    setCodeError(null);

    const id = editingId || crypto.randomUUID();
    const productData: ManagedProduct = { ...formData, id };
    
    try {
      await saveProduct(productData);
      setEditingId(null);
      setFormData({ tipo: 'serviço', codigo: '', descricao: '', precoUnitario: 0, unidade: 'Serviço', taxaIVA: 14, status: 'active' });
      await fetchProducts();
    } catch (err) {
      alert("Erro ao gravar serviço na nuvem.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Remover este serviço do catálogo?")) {
      try {
        await deleteProduct(id);
        await fetchProducts();
      } catch (err) {
        alert("Erro ao remover item.");
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatNum = (val: number) => new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2 }).format(val);

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
          <i className="fas fa-concierge-bell text-blue-600"></i>
          Catálogo de Serviços
        </h1>
        <p className="text-slate-500 font-medium">Gestão de Honorários e Taxas Aduaneiras (Sincronizado na Nuvem)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden sticky top-8">
            <div className="bg-slate-50 p-6 border-b border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {editingId ? 'Editar Item' : 'Novo Serviço / Honorário'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Tipo</label>
                  <select className="w-full border-2 border-slate-100 p-2.5 rounded-xl text-xs font-bold outline-none" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value as any})}>
                    <option value="serviço">Serviço</option>
                    <option value="produto">Produto</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Código</label>
                  <input 
                    required 
                    className={`w-full border-2 p-2.5 rounded-xl text-xs outline-none transition-all ${codeError ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-blue-500'}`} 
                    placeholder="Ex: HON01" 
                    value={formData.codigo} 
                    onChange={e => {
                      setFormData({...formData, codigo: e.target.value.toUpperCase()});
                      if (codeError) setCodeError(validateCode(e.target.value));
                    }} 
                  />
                  {codeError && <p className="text-[8px] font-black text-rose-500 uppercase mt-1 leading-none">{codeError}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase">Descrição Completa</label>
                <textarea required className="w-full border-2 border-slate-100 p-2.5 rounded-xl text-xs outline-none font-bold h-24 resize-none" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Preço Base (Kz)</label>
                  <input type="number" required className="w-full border-2 border-slate-100 p-2.5 rounded-xl text-xs outline-none font-black" value={formData.precoUnitario} onChange={e => setFormData({...formData, precoUnitario: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">IVA (%)</label>
                  <select className="w-full border-2 border-slate-100 p-2.5 rounded-xl text-xs font-bold outline-none bg-blue-50 text-blue-700" value={formData.taxaIVA} onChange={e => setFormData({...formData, taxaIVA: parseInt(e.target.value)})}>
                    <option value={14}>14% (Regime Geral)</option>
                    <option value={7}>7% (Regime Simplificado)</option>
                    <option value={0}>Isento (0%)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase">Unidade</label>
                <input className="w-full border-2 border-slate-100 p-2.5 rounded-xl text-xs outline-none" placeholder="Un, Hora, Serviço..." value={formData.unidade} onChange={e => setFormData({...formData, unidade: e.target.value})} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg disabled:opacity-50">
                {loading ? <i className="fas fa-spinner fa-spin"></i> : (editingId ? 'Gravar Alterações' : 'Adicionar ao Catálogo')}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex gap-4">
             <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input 
                  placeholder="Pesquisar descrição ou código..." 
                  className="w-full bg-slate-50 border-none pl-11 pr-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             {loading && <div className="flex items-center px-4"><i className="fas fa-sync fa-spin text-blue-600"></i></div>}
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden min-h-[400px]">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Preço Base</th>
                  <th className="px-6 py-4 text-center">IVA</th>
                  <th className="px-6 py-4 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.length === 0 && !loading ? (
                   <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">Catálogo vazio</td></tr>
                ) : filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-800 uppercase leading-snug">{p.descricao}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{p.codigo || 'SEM COD'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[8px] font-black uppercase text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">
                        {p.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-700 text-xs">
                      {formatNum(p.precoUnitario)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${p.taxaIVA === 14 ? 'bg-blue-100 text-blue-600' : p.taxaIVA === 7 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        {p.taxaIVA}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { setEditingId(p.id); setFormData(p); }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition inline-flex items-center justify-center">
                        <i className="fas fa-edit text-[10px]"></i>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition inline-flex items-center justify-center">
                        <i className="fas fa-trash-alt text-[10px]"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
