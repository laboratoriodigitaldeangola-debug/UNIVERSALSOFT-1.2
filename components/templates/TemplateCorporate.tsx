
import React from 'react';

export const TemplateCorporate: React.FC<{ data: any, id: string, numero: string }> = ({ data, id, numero }) => {
  const formatNum = (val: number) => new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  return (
    <div className="flex flex-col h-full bg-white text-[10px] font-sans">
      {/* Header Art Ousada Style */}
      <div className="flex justify-between mb-10">
        <div className="flex gap-4 items-center">
          <img src={data.empresa.logoUrl || "https://api.dicebear.com/7.x/shapes/svg?seed=ART"} className="w-20 h-20 rounded-lg shadow-sm" />
          <div>
            <h1 className="text-sm font-black uppercase text-slate-800">{data.empresa.nome}</h1>
            <p className="font-bold">Contribuinte: {data.empresa.nif}</p>
            <p>Telefone: {data.empresa.contactos}</p>
            <p>Email: {data.empresa.email || "simaopaulino13@hotmail.com"}</p>
            <p className="leading-tight">{data.empresa.endereco}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-sm font-black uppercase">FACTURA</h2>
          <p className="text-xs">ORIGINAL</p>
          <div className="mt-6">
            <p className="text-[9px] text-slate-500 italic">Exmo.(s) Sr.(s)</p>
            <p className="font-bold text-xs uppercase">{data.cliente.nome}</p>
            <p className="max-w-[180px] ml-auto">{data.cliente.endereco || "Av. 4 de Fevereiro, n.º 151, Luanda"}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-end">
           <h3 className="text-sm font-black text-slate-900">{data.factura.numero}</h3>
           {/* QR Code Placeholder */}
           <div className="w-16 h-16 bg-slate-100 border p-1">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=FT-ART" className="w-full h-full grayscale opacity-70" />
           </div>
        </div>
        <div className="grid grid-cols-4 border-y-2 border-slate-900 py-1 mt-2 font-black text-[9px] uppercase">
          <div>Data de Emissão</div>
          <div>Hora</div>
          <div>Vencimento</div>
          <div>Contribuinte</div>
        </div>
        <div className="grid grid-cols-4 py-1.5 text-[10px] font-bold">
          <div>{data.factura.dataEmissao}</div>
          <div>{new Date().toLocaleTimeString('pt-AO')}</div>
          <div>{data.factura.dataVencimento}</div>
          <div>{data.cliente.nif}</div>
        </div>
        <p className="mt-2 text-[9px] font-medium text-slate-500 italic">
          Bens colocados à disposição do cliente {data.factura.dataEmissao} em .-COMERCIAL
        </p>
      </div>

      {/* Main Table Corporate */}
      <div className="flex-grow">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-[9px] font-black uppercase">
              <th className="py-3 pl-2">Descrição</th>
              <th>Código</th>
              <th>Lote</th>
              <th className="text-right">Preço Uni.</th>
              <th className="text-center">Qtd</th>
              <th className="text-center">Desconto</th>
              <th className="text-center">Taxa Imp</th>
              <th className="text-right pr-2">Total</th>
            </tr>
          </thead>
          <tbody className="text-[10px]">
            {data.itens.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-50">
                <td className="py-4 pl-2 pr-6 font-bold uppercase leading-snug">{item.descricao}</td>
                <td className="text-slate-400">---</td>
                <td className="text-slate-400">---</td>
                <td className="text-right">{formatNum(item.precoUnitario)}</td>
                <td className="text-center">{item.quantidade}</td>
                <td className="text-center">0,00</td>
                <td className="text-center">{item.taxaIVA},00</td>
                <td className="text-right pr-2 font-black">{formatNum(item.quantidade * item.precoUnitario)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Quadro Resumo Imposto Corporate */}
        <div className="mt-8">
            <div className="grid grid-cols-2 gap-12">
                <div>
                   <h4 className="text-[9px] font-black uppercase bg-slate-50 p-1 border-b-2 border-slate-900 mb-2">Quadro Resumo de Imposto</h4>
                   <table className="w-full text-[9px]">
                     <thead className="text-slate-400 font-black uppercase">
                       <tr><th className="text-left">DESCRICAO</th><th className="text-center">TAXA</th><th className="text-center">INCIDENCIA</th><th className="text-right">IMPOSTO</th></tr>
                     </thead>
                     <tbody className="font-bold">
                       <tr>
                         <td>{data.factura.regimeFiscal === 'GERAL' ? 'IVA 14%' : 'ISENTO'}</td>
                         <td className="text-center">{data.itens[0]?.taxaIVA || 0},00</td>
                         <td className="text-center">{formatNum(data.totais.subtotal)}</td>
                         <td className="text-right">{formatNum(data.totais.iva)}</td>
                       </tr>
                     </tbody>
                   </table>
                </div>
                <div>
                   <h4 className="text-[9px] font-black uppercase bg-slate-50 p-1 border-b-2 border-slate-900 mb-2">Quadro Resumo dos motivos de Isenção</h4>
                   <div className="text-[9px] text-slate-500">Isenção de acordo com a legislação vigente em Angola.</div>
                </div>
            </div>
        </div>
      </div>

      {/* Footer Area Corporate */}
      <div className="mt-10 grid grid-cols-12 gap-8">
        <div className="col-span-7 space-y-4">
            <div className="border border-slate-900">
               <h4 className="text-[9px] font-black uppercase bg-slate-900 text-white p-1">Coordernadas Bancárias</h4>
               <div className="p-2 grid grid-cols-3 text-[9px]">
                  <div className="font-black">BANCO<p className="font-normal">BFA</p></div>
                  <div className="font-black">CONTA<p className="font-normal">4193847230</p></div>
                  <div className="font-black">IBAN<p className="font-normal">0006 0000 4193 8472 3010 2</p></div>
               </div>
            </div>
            <p className="font-black uppercase text-[8px] leading-relaxed">{data.totais.totalExtenso || "CATORZE MILHÕES E OITOCENTOS E OITO MIL E DUZENTOS E NOVENTA E SETE KWANZAS"}</p>
        </div>
        
        <div className="col-span-5 space-y-2">
            <div className="flex justify-between border-b pb-1">
               <span className="font-black uppercase text-slate-400">Total Iliquido:</span>
               <span className="font-black">{formatNum(data.totais.subtotal)}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
               <span className="font-black uppercase text-slate-400">Total Desconto:</span>
               <span className="font-black">0,00</span>
            </div>
            <div className="flex justify-between border-b pb-1">
               <span className="font-black uppercase text-slate-400">Total Imposto:</span>
               <span className="font-black">{formatNum(data.totais.iva)}</span>
            </div>
            <div className="flex justify-between text-xs font-black bg-slate-900 text-white p-2">
               <span>Total (Kz)</span>
               <span>{formatNum(data.totais.total)}</span>
            </div>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <div className="text-[8px] text-slate-400 text-center border-t border-slate-200 pt-4 mb-2 uppercase font-medium">
          Processado por programa validado nº LICENÇA FACTURA ELECTRÓNICA: FE/9/AGT/2025 - LICENÇA SAFT: 385/AGT/2022 NEGOMIL - WWW.NEGOMIL.COM
        </div>
        <div className="flex justify-between text-[8px] font-black uppercase">
           <span>Regime: {data.factura.regimeFiscal === 'GERAL' ? 'Regime Geral' : 'Regime de Exclusão'}</span>
           <span>Página 1 de 1</span>
           <span>Utilizador: ADMINISTRADOR DO SISTEMA</span>
        </div>
      </div>
    </div>
  );
};
