
import React, { useState, useEffect } from 'react';
import { SaftSubmission, Broker, Invoice } from '../types';

interface ValidationError {
  code: string;
  message: string;
  type: 'error' | 'warning';
}

export const SaftSubmissionPage: React.FC = () => {
  const [companies, setCompanies] = useState<Broker[]>([]);
  const [history, setHistory] = useState<SaftSubmission[]>(() => {
    const saved = localStorage.getItem('saft_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth());
  const [selectedAno, setSelectedAno] = useState(new Date().getFullYear());
  const [subType, setSubType] = useState<'Normal' | 'Substituição'>('Normal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationError[]>([]);
  const [currentStep, setCurrentStep] = useState(1); 

  useEffect(() => {
    const savedCompanies = JSON.parse(localStorage.getItem('registered_companies') || '[]');
    setCompanies(savedCompanies);
    if (savedCompanies.length > 0) setSelectedCompanyId(savedCompanies[0].id);
  }, []);

  useEffect(() => {
    localStorage.setItem('saft_history', JSON.stringify(history));
  }, [history]);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const isCompanyReady = selectedCompany?.status === 'active';

  const runAgtValidation = (): boolean => {
    const reports: ValidationError[] = [];
    const company = selectedCompany;
    
    if (!company) {
      reports.push({ code: 'AGT-001', message: 'Empresa não seleccionada ou inexistente.', type: 'error' });
    } else {
      if (company.status !== 'active') {
        reports.push({ code: 'AGT-LOCKED', message: 'Esta empresa aguarda aprovação administrativa. Extração SAF-T impossibilitada.', type: 'error' });
      }
      if (!company.nif || company.nif.length < 9) {
        reports.push({ code: 'AGT-001', message: 'Empresa sem NIF válido. Submissão SAF-T interdita.', type: 'error' });
      }
      if (!company.nome) reports.push({ code: 'AGT-006', message: 'Razão Social da empresa não definida.', type: 'error' });
    }

    const allInvoices: Invoice[] = JSON.parse(localStorage.getItem('last_invoice') ? `[${localStorage.getItem('last_invoice')}]` : '[]');
    const periodInvoices = allInvoices.filter(inv => {
      const date = new Date(inv.data);
      return date.getMonth() === selectedMes && date.getFullYear() === selectedAno && inv.broker.id === selectedCompanyId;
    });

    if (periodInvoices.length === 0) {
      reports.push({ code: 'AGT-003', message: 'Nenhuma factura encontrada para o período seleccionado.', type: 'error' });
    } else {
      periodInvoices.forEach(inv => {
        if (!inv.client.nif) {
          reports.push({ code: 'AGT-002', message: `Cliente [${inv.client.nome}] sem NIF na factura ${inv.numero}.`, type: 'error' });
        }
        if (!inv.numero || !inv.numero.includes('/')) {
          reports.push({ code: 'AGT-003', message: `Numeração de factura inválida detectada: ${inv.numero}.`, type: 'error' });
        }
        if (inv.taxaIVA !== 14 && inv.taxaIVA !== 0) {
          reports.push({ code: 'AGT-005', message: `Taxa de IVA (${inv.taxaIVA}%) fora dos padrões AGT na factura ${inv.numero}.`, type: 'error' });
        }
      });
    }

    if (company && !company.endereco) {
      reports.push({ code: 'AGT-101', message: 'Empresa sem endereço completo (Sede).', type: 'warning' });
    }
    
    setValidationReport(reports);
    return !reports.some(r => r.type === 'error');
  };

  const generateSaftXmlContent = (submission: SaftSubmission, company: Broker, invoices: Invoice[]) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:AO_1.0">
  <Header>
    <AuditFileVersion>1.0</AuditFileVersion>
    <CompanyID>${company.nif}</CompanyID>
    <TaxRegistrationNumber>${company.nif}</TaxRegistrationNumber>
    <CompanyName>${company.nome}</CompanyName>
    <BusinessName>${company.nome}</BusinessName>
    <CompanyAddress>
      <AddressDetail>${company.endereco}</AddressDetail>
      <City>Luanda</City>
      <Country>AO</Country>
    </CompanyAddress>
    <FiscalYear>${submission.ano}</FiscalYear>
    <StartDate>${submission.ano}-${String(submission.mes).padStart(2, '0')}-01</StartDate>
    <EndDate>${submission.ano}-${String(submission.mes).padStart(2, '0')}-31</EndDate>
    <CurrencyCode>AOA</CurrencyCode>
    <DateCreated>${new Date().toISOString().split('T')[0]}</DateCreated>
    <TaxEntity>Global</TaxEntity>
    <ProductCompanyTaxID>${company.nif}</ProductCompanyTaxID>
    <SoftwareCertificateNumber>385/AGT/2022</SoftwareCertificateNumber>
    <ProductID>UniversalSoft</ProductID>
    <ProductVersion>1.0.0</ProductVersion>
  </Header>
  <MasterFiles>
    ${invoices.map(inv => `
    <Customer>
      <CustomerID>${inv.client.nif || 'C-MOCK'}</CustomerID>
      <CustomerTaxID>${inv.client.nif}</CustomerTaxID>
      <CompanyName>${inv.client.nome}</CompanyName>
      <BillingAddress>
        <AddressDetail>${inv.client.endereco}</AddressDetail>
        <Country>AO</Country>
      </BillingAddress>
    </Customer>`).join('')}
  </MasterFiles>
  <SourceDocuments>
    <SalesInvoices>
      ${invoices.map(inv => `
      <Invoice>
        <InvoiceNo>${inv.numero}</InvoiceNo>
        <InvoiceDate>${inv.data}</InvoiceDate>
        <CustomerID>${inv.client.nif}</CustomerID>
        <DocumentTotals>
          <TaxPayable>${((inv.items.reduce((s,i)=>s+(i.quantidade*i.precoUnitario),0)) * inv.taxaIVA / 100).toFixed(2)}</TaxPayable>
          <NetTotal>${inv.items.reduce((s,i)=>s+(i.quantidade*i.precoUnitario),0).toFixed(2)}</NetTotal>
          <GrossTotal>${(inv.items.reduce((s,i)=>s+(i.quantidade*i.precoUnitario),0) * (1 + inv.taxaIVA/100)).toFixed(2)}</GrossTotal>
        </DocumentTotals>
      </Invoice>`).join('')}
    </SalesInvoices>
  </SourceDocuments>
</AuditFile>`;
  };

  const handleProcessSaft = async () => {
    setIsGenerating(true);
    setValidationReport([]);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    const isReady = runAgtValidation();
    
    if (isReady) {
      const company = selectedCompany!;
      const newSubmission: SaftSubmission = {
        id: crypto.randomUUID(),
        companyId: company.id,
        companyName: company.nome,
        nif: company.nif,
        mes: selectedMes + 1,
        ano: selectedAno,
        tipo: subType,
        dataGeracao: new Date().toISOString(),
        estado: 'Gerado',
        utilizador: 'Administrador',
        xmlUrl: 'blob'
      };
      
      setHistory([newSubmission, ...history]);
      setCurrentStep(2);
      alert("✅ AGT-200: SAF-T gerado com sucesso.");
    } else {
      alert("❌ Falha na Validação Técnica.");
    }
    setIsGenerating(false);
  };

  const downloadSaftFile = (submission: SaftSubmission) => {
    const company = companies.find(c => c.id === submission.companyId);
    if (!company) return;
    
    const allInvoices: Invoice[] = JSON.parse(localStorage.getItem('last_invoice') ? `[${localStorage.getItem('last_invoice')}]` : '[]');
    const periodInvoices = allInvoices.filter(inv => {
      const date = new Date(inv.data);
      return date.getMonth() === (submission.mes - 1) && date.getFullYear() === submission.ano && inv.broker.id === submission.companyId;
    });

    const xml = generateSaftXmlContent(submission, company, periodInvoices);
    const fileName = `SAF-T_AO_${submission.nif}_${submission.ano}_${String(submission.mes).padStart(2, '0')}.xml`;
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  };

  const downloadConsolidatedArchive = () => {
    if (history.length === 0) {
      alert("Histórico vazio.");
      return;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<SaftHistoryExport timestamp="${new Date().toISOString()}">\n`;
    history.forEach(sub => {
      xml += `  <Submission id="${sub.id}">
    <Period>${String(sub.mes).padStart(2, '0')}/${sub.ano}</Period>
    <CompanyName>${sub.companyName}</CompanyName>
    <NIF>${sub.nif}</NIF>
    <Status>${sub.estado}</Status>
    <DateGenerated>${sub.dataGeracao}</DateGenerated>
  </Submission>\n`;
    });
    xml += `</SaftHistoryExport>`;

    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UniversalSoft_Consolidado_SAFT_${Date.now()}.xml`;
    a.click();
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <i className="fas fa-file-invoice-dollar"></i>
            </div>
            Extração SAF-T AO
          </h1>
          <p className="text-slate-500 font-medium">Conformidade Legal • Ministério das Finanças (AGT)</p>
        </div>
      </div>

      {!isCompanyReady && selectedCompanyId && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-6">
           <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
             <i className="fas fa-exclamation-triangle"></i>
           </div>
           <div>
             <h4 className="text-sm font-black text-red-900 uppercase">Empresa Bloqueada para SAF-T</h4>
             <p className="text-[11px] text-red-700 font-medium max-w-lg">
               A empresa <span className="font-bold">{selectedCompany?.nome}</span> aguarda activação por parte do Administrador do sistema. De acordo com os regulamentos AGT, apenas empresas verificadas podem gerar ficheiros de auditoria.
             </p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden sticky top-8">
            <div className="bg-slate-900 p-6 border-b border-slate-800">
              <h3 className="text-[10px] font-black text-indigo-200 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-cog"></i> Configurar Extração
              </h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase">Empresa de Facturação</label>
                <select 
                  className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none bg-white focus:border-indigo-500 transition-all"
                  value={selectedCompanyId}
                  onChange={e => setSelectedCompanyId(e.target.value)}
                >
                  {companies.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.nif})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Mês de Referência</label>
                  <select className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm outline-none bg-white" value={selectedMes} onChange={e => setSelectedMes(parseInt(e.target.value))}>
                    {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Ano Fiscal</label>
                  <select className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm outline-none bg-white" value={selectedAno} onChange={e => setSelectedAno(parseInt(e.target.value))}>
                    {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleProcessSaft}
                disabled={isGenerating || !isCompanyReady}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
                Executar Validação & XML
              </button>

              {validationReport.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                   {validationReport.map((rep, i) => (
                     <div key={i} className={`p-3 rounded-xl border text-[10px] font-bold ${rep.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                        {rep.message}
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-archive"></i> Arquivo de Submissões
              </h3>
              <button 
                onClick={downloadConsolidatedArchive}
                className="text-[9px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-slate-800 transition flex items-center gap-2"
              >
                <i className="fas fa-file-archive"></i> Exportar Histórico XML
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Período</th>
                    <th className="px-6 py-4">Empresa</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4 text-right">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-slate-800">{String(item.mes).padStart(2, '0')}/{item.ano}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[10px] font-bold text-slate-700 truncate max-w-[120px] uppercase">{item.companyName}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => downloadSaftFile(item)} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-indigo-900 hover:text-white transition-all inline-flex items-center justify-center">
                          <i className="fas fa-file-code"></i>
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
    </div>
  );
};
