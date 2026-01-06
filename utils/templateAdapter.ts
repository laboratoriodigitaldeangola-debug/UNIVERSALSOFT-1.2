
import { Invoice } from '../types';

function valorPorExtenso(n: number): string {
  if (n === 0) return "ZERO KWANZAS";
  const unidades = ["", "UM", "DOIS", "TRÊS", "QUATRO", "CINCO", "SEIS", "SETE", "OITO", "NOVE"];
  const dezenas = ["", "DEZ", "VINTE", "TRINTA", "QUARENTA", "CINQUENTA", "SESSENTA", "SETENTA", "OITENTA", "NOVENTA"];
  const especiais = ["DEZ", "ONZE", "DOZE", "TREZE", "CATORZE", "QUINZE", "DEZASSEIS", "DEZASSETE", "DEZOITO", "DEZANOVE"];
  const centenas = ["", "CENTO", "DUZENTOS", "TREZENTOS", "QUATROCENTOS", "QUINHENTOS", "SEISCENTOS", "SETECENTOS", "OITOCENTOS", "NOVECENTOS"];

  const formatPart = (num: number) => {
    if (num === 0) return "";
    if (num === 100) return "CEM";
    let s = "";
    if (num >= 100) { s += centenas[Math.floor(num / 100)]; num %= 100; if (num > 0) s += " E "; }
    if (num >= 20) { s += dezenas[Math.floor(num / 10)]; num %= 10; if (num > 0) s += " E " + unidades[num]; }
    else if (num >= 10) s += especiais[num - 10];
    else if (num > 0) s += unidades[num];
    return s;
  };

  const milhoes = Math.floor(n / 1000000);
  const milhares = Math.floor((n % 1000000) / 1000);
  const resto = Math.floor(n % 1000);
  let resultado = [];
  if (milhoes > 0) resultado.push(formatPart(milhoes) + (milhoes > 1 ? " MILHÕES" : " MILHÃO"));
  if (milhares > 0) resultado.push(formatPart(milhares) + " MIL");
  if (resto > 0) resultado.push(formatPart(resto));
  return resultado.join(" E ") + " KWANZAS";
}

export const mapInvoiceToTemplateContract = (invoice: Invoice) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);
  const iva = (subtotal * invoice.taxaIVA) / 100;
  const retencao = (subtotal * invoice.taxaRetencao) / 100;
  const total = subtotal + iva - retencao;

  return {
    empresa: {
      id: invoice.broker.id,
      nome: invoice.broker.nome,
      nif: invoice.broker.nif,
      endereco: invoice.broker.endereco,
      contactos: invoice.broker.telefone,
      email: invoice.broker.email,
      logoUrl: invoice.broker.logoUrl || ""
    },
    cliente: { nome: invoice.client.nome, nif: invoice.client.nif, endereco: invoice.client.endereco },
    factura: { numero: invoice.numero, tipo: "FACTURA", dataEmissao: invoice.data, dataVencimento: invoice.vencimento, regimeFiscal: invoice.taxaIVA > 0 ? "REGIME GERAL" : "REGIME DE EXCLUSÃO", observacoes: invoice.notas },
    itens: invoice.items.map(i => ({ descricao: i.descricao, quantidade: i.quantidade, precoUnitario: i.precoUnitario, desconto: 0, taxaIVA: invoice.taxaIVA })),
    totais: { subtotal, descontos: 0, iva, retencao, total, totalExtenso: valorPorExtenso(total) },
    banco: { nome: invoice.broker.bancoNome || "BFA", iban: invoice.broker.coordenadasBancarias }
  };
};

export const getMockInvoiceData = (): Invoice => {
    return {
        id: "mock-id",
        numero: "FT 2025/001",
        data: new Date().toISOString().split('T')[0],
        vencimento: "2025-01-30",
        broker: {
            id: "SAK-001",
            nome: "NOME DA EMPRESA EXEMPLO, LDA",
            nif: "5000000000",
            telefone: "+244 900 000 000",
            endereco: "Rua Direita de Luanda, Angola",
            email: "contacto@empresa.ao",
            coordenadasBancarias: "AO06 0000 0000 0000 0000 0000 0",
            logoUrl: "",
            regimeFiscal: 'GERAL',
            status: 'active'
        },
        client: { nome: "CLIENTE DE TESTE", nif: "5412345678", endereco: "Luanda, Angola", email: "cliente@teste.ao" },
        items: [{ id: "1", descricao: "Prestação de Serviços Gerais", quantidade: 1, precoUnitario: 100000 }],
        taxaIVA: 14,
        taxaRetencao: 6.5,
        notas: "Obrigado pela vossa confiança.",
        templateId: 'classic'
    };
};
