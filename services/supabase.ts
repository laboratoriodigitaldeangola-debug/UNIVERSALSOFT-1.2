
import { createClient } from '@supabase/supabase-js';
import { Invoice, AuditLog, ManagedClient, ManagedProduct, Broker, AccessProfile } from '../types';

const SUPABASE_URL = 'https://kajrkwkotwsabkpvehdc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bmou0X20BMs5ZMVDCGEHCA_Rl7PvMyM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const saveAuditLog = async (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
  const fullLog = {
    ...log,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };
  
  const logs = JSON.parse(localStorage.getItem('system_audit_logs') || '[]');
  logs.unshift(fullLog);
  localStorage.setItem('system_audit_logs', JSON.stringify(logs.slice(0, 500)));

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('audit_logs').insert([{ ...fullLog, user_id: session.user.id }]);
    }
  } catch (e) {
    console.warn("Audit log sync failed, kept locally.");
  }

  return fullLog;
};

// --- EMPRESAS (BROKERS) ---

export const getCompanies = async (): Promise<Broker[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  const local = JSON.parse(localStorage.getItem('registered_companies') || '[]');
  
  if (!session) return local;

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('nome', { ascending: true });

  if (error || !data) return local;
  
  localStorage.setItem('registered_companies', JSON.stringify(data));
  return data as Broker[];
};

export const saveCompany = async (company: Broker) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Guardar localmente primeiro
  const companies = JSON.parse(localStorage.getItem('registered_companies') || '[]');
  const index = companies.findIndex((c: Broker) => c.id === company.id);
  if (index >= 0) companies[index] = company;
  else companies.push(company);
  localStorage.setItem('registered_companies', JSON.stringify(companies));

  if (session) {
    const { error } = await supabase
      .from('companies')
      .upsert({ ...company, user_id: session.user.id }, { onConflict: 'id' });
    if (error) throw error;
  }
  return company;
};

// --- PERFIS DE ACESSO ---

export const getProfiles = async (): Promise<AccessProfile[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  const local = JSON.parse(localStorage.getItem('access_profiles') || '[]');
  
  if (!session) return local;

  const { data, error } = await supabase
    .from('access_profiles')
    .select('*');

  if (error || !data || data.length === 0) return local;
  
  localStorage.setItem('access_profiles', JSON.stringify(data));
  return data as AccessProfile[];
};

export const saveProfile = async (profile: AccessProfile) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const profiles = JSON.parse(localStorage.getItem('access_profiles') || '[]');
  const index = profiles.findIndex((p: AccessProfile) => p.id === profile.id);
  if (index >= 0) profiles[index] = profile;
  else profiles.push(profile);
  localStorage.setItem('access_profiles', JSON.stringify(profiles));

  if (session) {
    const { error } = await supabase
      .from('access_profiles')
      .upsert({ ...profile, user_id: session.user.id }, { onConflict: 'id' });
    if (error) throw error;
  }
  return profile;
};

// --- CLIENTES ---

export const getClients = async (): Promise<ManagedClient[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  const local = JSON.parse(localStorage.getItem('managed_clients') || '[]');
  
  if (!session) return local;

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('nome', { ascending: true });

  if (error) return local;
  
  localStorage.setItem('managed_clients', JSON.stringify(data));
  return data as ManagedClient[];
};

export const saveClient = async (client: ManagedClient) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const clients = JSON.parse(localStorage.getItem('managed_clients') || '[]');
  const index = clients.findIndex((c: ManagedClient) => c.id === client.id);
  if (index >= 0) clients[index] = client;
  else clients.push(client);
  localStorage.setItem('managed_clients', JSON.stringify(clients));

  if (session) {
    const { error } = await supabase
      .from('clients')
      .upsert({ ...client, user_id: session.user.id }, { onConflict: 'id' });
    if (error) throw error;
  }
  return client;
};

export const deleteClient = async (id: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const clients = JSON.parse(localStorage.getItem('managed_clients') || '[]');
  localStorage.setItem('managed_clients', JSON.stringify(clients.filter((c: ManagedClient) => c.id !== id)));

  if (session) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  }
};

// --- PRODUTOS / SERVIÇOS ---

export const getProducts = async (): Promise<ManagedProduct[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  const local = JSON.parse(localStorage.getItem('managed_products') || '[]');
  
  if (!session) return local;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('descricao', { ascending: true });

  if (error) return local;
  
  localStorage.setItem('managed_products', JSON.stringify(data));
  return data as ManagedProduct[];
};

export const saveProduct = async (product: ManagedProduct) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const products = JSON.parse(localStorage.getItem('managed_products') || '[]');
  const index = products.findIndex((p: ManagedProduct) => p.id === product.id);
  if (index >= 0) products[index] = product;
  else products.push(product);
  localStorage.setItem('managed_products', JSON.stringify(products));

  if (session) {
    const { error } = await supabase
      .from('products')
      .upsert({ ...product, user_id: session.user.id }, { onConflict: 'id' });
    if (error) throw error;
  }
  return product;
};

export const deleteProduct = async (id: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const products = JSON.parse(localStorage.getItem('managed_products') || '[]');
  localStorage.setItem('managed_products', JSON.stringify(products.filter((p: ManagedProduct) => p.id !== id)));

  if (session) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }
};

export const saveInvoiceToCloud = async (invoice: Invoice) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return invoice;

  const { data, error } = await supabase
    .from('invoices')
    .upsert({
      id: invoice.id,
      numero: invoice.numero,
      client_name: invoice.client.nome,
      data_json: invoice,
      user_id: session.user.id
    }, { onConflict: 'id' });

  if (error) throw error;
  return data;
};

export const signUpUser = async (email: string, password: string, fullName: string, role: 'admin' | 'user' = 'user') => {
  const isEmailAdmin = email.toLowerCase().startsWith('admin@');
  const status = isEmailAdmin ? 'active' : 'pending';
  const finalRole = isEmailAdmin ? 'admin' : role;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: fullName,
        role: finalRole,
        status: status,
        created_at: new Date().toISOString()
      },
      emailRedirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
};

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
