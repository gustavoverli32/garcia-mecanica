const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const forbidden = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY'];

for (const key of forbidden) {
  if (process.env[key]) throw new Error(`Segredo proibido exposto no ambiente público: ${key}`);
}

if (process.env.CI && required.some((key) => !process.env[key])) {
  throw new Error('As variáveis públicas do Supabase devem ser configuradas no CI/deploy.');
}

console.log('Configuração de ambiente segura: sem chaves secretas expostas.');
