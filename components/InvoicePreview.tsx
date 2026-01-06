
import React from 'react';
import { Invoice } from '../types';
import { mapInvoiceToTemplateContract } from '../utils/templateAdapter';
import { TemplateClassic } from './templates/TemplateClassic';
import { TemplateSimplified } from './templates/TemplateSimplified';
import { TemplateCorporate } from './templates/TemplateCorporate';

interface Props {
  invoice: Invoice;
  emissor?: string;
}

export const InvoicePreview: React.FC<Props> = ({ invoice, emissor }) => {
  const templateContractData = mapInvoiceToTemplateContract(invoice);

  const renderTemplate = () => {
    switch (invoice.templateId) {
      case 'simplified':
        return <TemplateSimplified data={templateContractData} id={invoice.id} numero={invoice.numero} />;
      case 'corporate':
        return <TemplateCorporate data={templateContractData} id={invoice.id} numero={invoice.numero} />;
      case 'classic':
      default:
        return <TemplateClassic data={templateContractData} id={invoice.id} numero={invoice.numero} emissor={emissor} />;
    }
  };

  return (
    <div className="invoice-container shadow-2xl mx-auto flex flex-col font-sans text-slate-800">
      <div className="invoice-content">
        {renderTemplate()}
      </div>
    </div>
  );
};
