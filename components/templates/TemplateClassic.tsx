
import React from 'react';

export const TemplateClassic: React.FC<{ data: any, id: string, numero: string, emissor?: string }> = ({ data, id, numero, emissor }) => {
  const formatNum = (val: number) => new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  return (
    <div className="flex flex-col h-full bg-white text-[9px] font-sans leading-tight text-slate-800 p-2">
      {/* Top Header - Factura Title */}
      <div className="text-right mb-4">
        <h1 className="text-[18px] font-black uppercase text-slate-900 leading-none">Factura</h1>
        <p className="text-[10px] font-bold text-slate-500">Original</p>
        <p className="text-[8px] text-slate-400">...</p>
      </div>

      {/* Company and Client Info Row */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-white flex items-center justify-center overflow-hidden shrink-0">
            {data.empresa.logoUrl ? (
              <img src={data.empresa.logoUrl} className="w-full h-full object-contain" alt="Logo" />
            ) : (
              <div className="w-full h-full border border-slate-100 flex items-center justify-center bg-slate-50">
                <i className="fas fa-building text-slate-200 text-2xl"></i>
              </div>
            )}
          </div>
          <div className="space-y-0.5 pt-1">
            <h2 className="text-[10px] font-black uppercase text-slate-900 leading-tight">{data.empresa.nome}</h2>
            <p className="font-bold">Contribuinte Nº: {data.empresa.nif}</p>
            <p className="font-bold">Telefone: {data.empresa.contactos}/</p>
            <div className="pt-2 text-[8px] space-y-0">
              <p><span className="font-bold">Site:</span> {data.empresa.website || ''}</p>
              <p><span className="font-bold">Email:</span> {data.empresa.email}</p>
              <p className="max-w-[200px]">{data.empresa.endereco}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-right space-y-0.5">
            <p className="text-[8px] text-slate-500 italic">Exmo.(s) Sr.(s)</p>
            <h2 className="font-black text-[10px] uppercase text-slate-900">Cliente: {data.cliente.nome}</h2>
            <p className="font-bold">Contribuinte Nº: {data.cliente.nif || '5000000000'}</p>
            <p className="max-w-[220px] text-[8px] leading-tight text-slate-600">{data.cliente.endereco}</p>
          </div>
          <div className="w-20 h-20 bg-white border border-slate-100 p-1">
             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=FT-${data.factura.numero}`} className="w-full h-full" alt="QR Code" />
          </div>
        </div>
      </div>

      {/* Invoice ID Banner */}
      <div className="mb-4">
        <h3 className="text-[11px] font-black uppercase text-slate-900 mb-1">{data.factura.numero}</h3>
        <table className="w-full border-collapse border-y border-slate-800 text-center">
          <thead className="bg-white font-black uppercase text-[8px] text-slate-900 border-b border-slate-800">
            <tr>
              <th className="py-1 text-left pl-1">Data Emissão</th>
              <th className="py-1">Data Vencimento</th>
              <th className="py-1">Contribuinte</th>
              <th className="py-1 text-right pr-1">Data Ref. Doc</th>
            </tr>
          </thead>
          <tbody className="font-bold text-slate-800 text-[9px]">
            <tr>
              <td className="py-1 text-left pl-1">{data.factura.dataEmissao}</td>
              <td className="py-1">{data.factura.dataVencimento}</td>
              <td className="py-1">{data.cliente.nif || '5000000000'}</td>
              <td className="py-1 text-right pr-1">-</td>
            </tr>
          </tbody>
        </table>
        <p className="text-[7px] text-slate-500 mt-1 italic px-1">
          Os bens/Serviços foram colocados à disposição do adquirente na data do documento. {data.empresa.endereco}
        </p>
      </div>

      {/* Items Table */}
      <div className="flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-[8px] font-black uppercase text-slate-900 border-b border-slate-800">
              <th className="py-1.5 px-1">Descrição</th>
              <th className="py-1.5 px-1">Cod.Produto</th>
              <th className="py-1.5 px-1 text-right">Preço Uni</th>
              <th className="py-1.5 px-1 text-center">Unid.</th>
              <th className="py-1.5 px-1 text-center">Qtd</th>
              <th className="py-1.5 px-1 text-center">Desc</th>
              <th className="py-1.5 px-1 text-center">IEC %</th>
              <th className="py-1.5 px-1 text-center">Taxa %</th>
              <th className="py-1.5 px-1 text-right pr-1">Total S/Imp</th>
            </tr>
          </thead>
          <tbody className="text-[8px]">
            {data.itens.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-1.5 px-1 font-bold uppercase">{item.descricao}</td>
                <td className="py-1.5 px-1 font-mono text-slate-500">PRDT{String(idx+1).padStart(3, '0')}</td>
                <td className="py-1.5 px-1 text-right">{formatNum(item.precoUnitario)}</td>
                <td className="py-1.5 px-1 text-center uppercase">UNI</td>
                <td className="py-1.5 px-1 text-center">{formatNum(item.quantidade)}</td>
                <td className="py-1.5 px-1 text-center">0,00</td>
                <td className="py-1.5 px-1 text-center">0</td>
                <td className="py-1.5 px-1 text-center">{item.taxaIVA},00</td>
                <td className="py-1.5 px-1 text-right pr-1 font-bold">{formatNum(item.quantidade * item.precoUnitario)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lower Summary Section */}
      <div className="mt-4 grid grid-cols-12 gap-4 items-start pb-10">
        {/* Summaries Column */}
        <div className="col-span-7 space-y-4">
          <section>
            <h4 className="font-black uppercase text-[8px] mb-1 text-slate-900">Quadro Resumo de Imposto</h4>
            <table className="w-full border-collapse border-y border-slate-800 text-[8px]">
              <thead className="bg-white font-black uppercase text-slate-900 border-b border-slate-800">
                <tr>
                  <th className="py-1 text-left px-1">DESCRIÇÃO</th>
                  <th className="py-1 text-right px-1">INCIDÊNCIA</th>
                  <th className="py-1 text-right px-1">IMPOSTO</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                <tr>
                  <td className="py-1 px-1 uppercase">{data.totais.iva > 0 ? `IVA ${data.itens[0]?.taxaIVA || 14} %` : 'Isento'}</td>
                  <td className="py-1 px-1 text-right">{formatNum(data.totais.subtotal)}</td>
                  <td className="py-1 px-1 text-right">{formatNum(data.totais.iva)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h4 className="font-black uppercase text-[8px] mb-1 text-slate-900">Coordenadas Bancárias</h4>
            <table className="w-full border-collapse border-y border-slate-800 text-[8px]">
              <thead className="bg-white font-black uppercase text-slate-900 border-b border-slate-800">
                <tr>
                  <th className="py-1 text-left px-1">Banco</th>
                  <th className="py-1 text-left px-1">Conta</th>
                  <th className="py-1 text-left px-1">Iban</th>
                </tr>
              </thead>
              <tbody className="font-medium text-slate-700">
                <tr>
                  <td className="py-1 px-1 uppercase">{data.banco.nome || 'BFA'}</td>
                  <td className="py-1 px-1">0000000000001</td>
                  <td className="py-1 px-1 font-mono">{data.banco.iban}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        {/* Totals Column */}
        <div className="col-span-5 space-y-1 text-[9px]">
          <div className="flex justify-between font-bold border-b border-slate-200 py-0.5">
            <span className="uppercase text-slate-500">Total Iliquido:</span>
            <span className="text-slate-900">{formatNum(data.totais.subtotal)}</span>
          </div>
          <div className="flex justify-between font-bold border-b border-slate-200 py-0.5">
            <span className="uppercase text-slate-500">Total Desconto:</span>
            <span className="text-slate-900">0,00</span>
          </div>
          <div className="flex justify-between font-bold border-b border-slate-200 py-0.5">
            <span className="uppercase text-slate-500">Total Imposto:</span>
            <span className="text-slate-900">{formatNum(data.totais.iva)}</span>
          </div>
          <div className="flex justify-between font-bold border-b border-slate-200 py-0.5">
            <span className="uppercase text-slate-500">Total IEC:</span>
            <span className="text-slate-900">0,0000</span>
          </div>
          <div className="flex justify-between font-bold border-b border-slate-200 py-0.5">
            <span className="uppercase text-rose-600">Total Retenção na Fonte (6,5%):</span>
            <span className="text-rose-600">{formatNum(data.totais.retencao)}</span>
          </div>
          
          <div className="flex justify-between font-bold py-2">
            <span className="uppercase text-slate-900">Total Sem Retenção</span>
            <span className="text-slate-900">{formatNum(data.totais.subtotal + data.totais.iva)}</span>
          </div>

          <div className="border border-slate-900 p-2 bg-slate-50/30">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[11px] font-black uppercase tracking-tighter">Total (Kz)</span>
               <span className="text-[14px] font-black text-slate-900 tracking-tighter">{formatNum(data.totais.total)}</span>
            </div>
            <p className="text-[9px] font-black uppercase text-slate-600 italic text-right leading-none border-t border-slate-300 pt-1">
              {data.totais.totalExtenso.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="mt-auto pt-4 text-center border-t border-slate-100">
        <div className="text-[7px] text-slate-400 space-y-0.5">
          <p>vBnk - Processado por Programa Validado nº 385/AGT/2022</p>
          <p className="font-bold">Numeração Interna: NFT {data.factura.numero} Impresso aos {new Date().toLocaleTimeString('pt-AO')}T{new Date().toISOString().split('T')[0]} Utilizador: {emissor || 'admin'}</p>
          <p>Software Negomil_V_6.3.11 B4 Módulo: COMERCIAL</p>
        </div>
        <div className="text-[7px] font-black uppercase text-slate-500 mt-2 flex justify-between px-2">
           <span>Regime: {data.totais.iva > 0 ? 'Geral' : 'Exclusão'}</span>
           <span>página 1 de 1</span>
           <span>Utilizador: {emissor || 'admin'}</span>
        </div>
      </div>
    </div>
  );
};
