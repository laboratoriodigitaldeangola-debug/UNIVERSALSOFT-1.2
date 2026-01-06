
import React from 'react';

export const TemplateSimplified: React.FC<{ data: any, id: string, numero: string }> = ({ data, id, numero }) => {
  const formatNum = (val: number) => new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  return (
    <div className="flex flex-col h-full bg-white text-[9px] font-sans leading-tight text-slate-800 p-2">
      {/* Cabeçalho Superior: Logo + Dados da Empresa + Título do Documento */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-white flex items-center justify-center overflow-hidden shrink-0">
            {data.empresa.logoUrl ? (
              <img src={data.empresa.logoUrl} className="w-full h-full object-contain" alt="Logo" />
            ) : (
              <div className="w-full h-full border border-slate-200 flex flex-col items-center justify-center">
                 <i className="fas fa-building text-slate-200 text-3xl"></i>
                 <span className="text-[6px] text-slate-300 font-bold uppercase mt-1">Logo</span>
              </div>
            )}
          </div>
          <div className="space-y-0.5 pt-1">
            <h1 className="text-[11px] font-black uppercase text-slate-900 leading-none">{data.empresa.nome}</h1>
            <p className="font-bold">NIF: {data.empresa.nif}</p>
            <p className="max-w-[300px] leading-tight text-[8px]">{data.empresa.endereco}</p>
            <p className="text-[8px]">Tel: {data.empresa.contactos}</p>
            <p className="text-[8px]">Email: {data.empresa.email}</p>
            {data.empresa.website && <p className="text-[8px]">Web: {data.empresa.website}</p>}
          </div>
        </div>
        <div className="text-right pt-2">
          <h2 className="text-[20px] font-black uppercase text-slate-900 leading-none tracking-tighter">FACTURA</h2>
          <p className="text-[11px] font-bold text-slate-600">Original</p>
        </div>
      </div>

      {/* Destinatário / Cliente e QR Code */}
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <p className="text-[8px] text-slate-500 italic">Exmo.(s) Sr.(s)</p>
          <p className="font-black text-[12px] uppercase text-slate-900">Cliente: {data.cliente.nome}</p>
          <p className="font-bold">Contribuinte Nº: {data.cliente.nif || '5000000000'}</p>
          <p className="max-w-[280px] text-[8px] leading-tight">{data.cliente.endereco}</p>
        </div>
        <div className="w-28 h-28 bg-white p-1">
           <img src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=FT-${data.factura.numero}`} className="w-full h-full" alt="QR Code" />
        </div>
      </div>

      {/* Identificação do Documento (Tabela em Grelha) */}
      <div className="mb-4">
        <div className="bg-slate-50 p-2 font-black uppercase text-slate-900 border-x border-t border-slate-200 text-[10px]">
          FACTURA {data.factura.numero}
        </div>
        <table className="w-full border-collapse border border-slate-200 text-center">
          <thead className="bg-slate-50 font-black uppercase text-[8px] text-slate-500">
            <tr>
              <th className="border border-slate-200 py-2 font-bold">Data Emissão</th>
              <th className="border border-slate-200 py-2 font-bold">Data Vencimento</th>
              <th className="border border-slate-200 py-2 font-bold">Contribuinte</th>
              <th className="border border-slate-200 py-2 font-bold">Data Ref. Doc</th>
            </tr>
          </thead>
          <tbody className="font-medium text-slate-800 text-[9px]">
            <tr>
              <td className="border border-slate-200 py-2">{data.factura.dataEmissao}</td>
              <td className="border border-slate-200 py-2">{data.factura.dataVencimento}</td>
              <td className="border border-slate-200 py-2">{data.cliente.nif || '5000000000'}</td>
              <td className="border border-slate-200 py-2">-</td>
            </tr>
          </tbody>
        </table>
        <p className="text-[7px] text-slate-500 mt-2 italic px-1">
          Os bens/Serviços foram colocados à disposição do adquirente na data do documento. {data.empresa.endereco}
        </p>
      </div>

      {/* Tabela de Itens (Colunas conforme modelo) */}
      <div className="flex-grow">
        <table className="w-full text-left border-collapse mt-4">
          <thead>
            <tr className="bg-slate-50 text-[8px] font-black uppercase text-slate-500 border border-slate-200">
              <th className="p-2 border border-slate-200">Cod.Produto</th>
              <th className="p-2 border border-slate-200">Descrição</th>
              <th className="p-2 border border-slate-200 text-right">Preço Uni</th>
              <th className="p-2 border border-slate-200 text-center">Unid.</th>
              <th className="p-2 border border-slate-200 text-center">Qtd</th>
              <th className="p-2 border border-slate-200 text-center">Desc</th>
              <th className="p-2 border border-slate-200 text-center">Taxa %</th>
              <th className="p-2 border border-slate-200 text-right">Total S/Imp</th>
            </tr>
          </thead>
          <tbody className="text-[9px]">
            {data.itens.map((item: any, idx: number) => (
              <tr key={idx} className="border border-slate-200">
                <td className="p-2 border border-slate-200 text-slate-500 font-mono">PRDT{String(idx+1).padStart(3, '0')}</td>
                <td className="p-2 border border-slate-200 font-medium uppercase">{item.descricao}</td>
                <td className="p-2 border border-slate-200 text-right font-medium">{formatNum(item.precoUnitario)}</td>
                <td className="p-2 border border-slate-200 text-center uppercase font-medium">UNI</td>
                <td className="p-2 border border-slate-200 text-center font-medium">{formatNum(item.quantidade)}</td>
                <td className="p-2 border border-slate-200 text-center">-</td>
                <td className="p-2 border border-slate-200 text-center">{item.taxaIVA},00</td>
                <td className="p-2 border border-slate-200 text-right font-bold">{formatNum(item.quantidade * item.precoUnitario)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Secção de Resumos e Totais (2 Colunas conforme INFOSAKUVAIA) */}
      <div className="mt-8 grid grid-cols-12 gap-8 items-start px-1 pb-10">
        {/* Lado Esquerdo: 3 Tabelas de Resumo */}
        <div className="col-span-7 space-y-6">
          <section>
            <h4 className="font-black uppercase text-[8px] mb-1.5 text-slate-900 tracking-tight">Quadro Resumo de Imposto</h4>
            <table className="w-full border-collapse border border-slate-200 text-[8px]">
              <thead className="bg-white font-black uppercase text-slate-600">
                <tr>
                  <th className="border border-slate-200 p-1.5 text-left">DESCRIÇÃO</th>
                  <th className="border border-slate-200 p-1.5 text-right">INCIDÊNCIA</th>
                  <th className="border border-slate-200 p-1.5 text-right">IMPOSTO</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                <tr>
                  <td className="border border-slate-200 p-1.5">IVA {data.itens[0]?.taxaIVA || 14} %</td>
                  <td className="border border-slate-200 p-1.5 text-right">{formatNum(data.totais.subtotal)}</td>
                  <td className="border border-slate-200 p-1.5 text-right">{formatNum(data.totais.iva)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h4 className="font-black uppercase text-[8px] mb-1.5 text-slate-900 tracking-tight">Coordenadas Bancárias</h4>
            <table className="w-full border-collapse border border-slate-200 text-[8px]">
              <thead className="bg-white font-black uppercase text-slate-600">
                <tr>
                  <th className="border border-slate-200 p-1.5 text-left">Banco</th>
                  <th className="border border-slate-200 p-1.5 text-left">Conta</th>
                  <th className="border border-slate-200 p-1.5 text-left">Iban</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                <tr>
                  <td className="border border-slate-200 p-1.5">{data.banco.nome || '-'}</td>
                  <td className="border border-slate-200 p-1.5">-</td>
                  <td className="border border-slate-200 p-1.5 font-mono">{data.banco.iban}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h4 className="font-black uppercase text-[8px] mb-1.5 text-slate-900 tracking-tight">Forma de Pagamento</h4>
            <table className="w-1/2 border-collapse border border-slate-200 text-[8px]">
              <thead className="bg-white font-black uppercase text-slate-600">
                <tr>
                  <th className="border border-slate-200 p-1.5 text-left">Nº do Borderô</th>
                  <th className="border border-slate-200 p-1.5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                <tr>
                  <td className="border border-slate-200 p-1.5 uppercase">NUMERÁRIO</td>
                  <td className="border border-slate-200 p-1.5 text-right">{formatNum(data.totais.total)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        {/* Lado Direito: Totais Acumulados */}
        <div className="col-span-5 border border-slate-200 p-5 rounded-none bg-white">
          <div className="space-y-2 text-[10px] font-medium text-slate-700">
            <div className="flex justify-between">
              <span className="font-bold">Total Iliquido:</span>
              <span>{formatNum(data.totais.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Total Desconto:</span>
              <span>0,00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Total Imposto:</span>
              <span>{formatNum(data.totais.iva)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Total Imposto Cativo:</span>
              <span>0,00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Total Retenção na Fonte:</span>
              <span>0,00</span>
            </div>
            <div className="flex justify-between pt-4">
              <span className="font-bold">Pagamento:</span>
              <span className="font-black">{formatNum(data.totais.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Troco:</span>
              <span>0,00</span>
            </div>
            <div className="flex justify-between items-center pt-5 mt-4 border-t border-slate-400">
              <span className="text-[12px] font-black uppercase tracking-tighter">Total (Kz):</span>
              <span className="text-[16px] font-black text-slate-900 tracking-tighter">{formatNum(data.totais.total)}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-700 italic text-right mt-2 capitalize">
              {data.totais.totalExtenso.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Final Institucional Certificado */}
      <div className="mt-auto pt-6">
        <div className="flex justify-center mb-6">
           <div className="border border-emerald-600 px-8 py-2 text-center rounded-none">
              <p className="text-emerald-700 font-black text-[10px] uppercase tracking-widest leading-none">FATURA ELETRÓNICA</p>
              <p className="text-emerald-600 font-bold text-[8px] uppercase tracking-widest mt-1">CERTIFICADA AGT</p>
           </div>
        </div>
        
        <div className="text-[7px] text-slate-400 text-center space-y-0.5 border-t border-slate-100 pt-4 px-10">
          <p>DRA5 - Processado por Programa Validado nº 142/AGT/2024</p>
          <p>Numeração Interna: NFT {data.factura.numero}</p>
          <p>Impresso: {new Date().toISOString()} | Utilizador: {data.operador || 'admin'}</p>
          <p>Software UniversalSoft_V_1.0.0 | Módulo: COMERCIAL</p>
        </div>
        
        <div className="flex justify-between items-center text-[8px] font-black uppercase mt-4 px-2 text-slate-500">
          <span>Regime: {data.factura.regimeFiscal === 'GERAL' ? 'Geral' : 'Exclusão'}</span>
          <span>página 1 de 1</span>
        </div>
      </div>
    </div>
  );
};
