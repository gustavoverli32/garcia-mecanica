'use client';

export function MigrationStatus() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '0 auto', padding: 32 }}>
      <p style={{ color: '#6b7280', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
        Garcia Auto Mecânica
      </p>
      <h1 style={{ fontSize: 32, margin: '12px 0' }}>Camada de modernização pronta</h1>
      <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
        Esta aplicação modular está em validação paralela. O sistema legado continua sendo a fonte de produção;
        nenhum dado do Supabase ou elemento visual foi substituído.
      </p>
      <ul style={{ color: '#374151', lineHeight: 1.8, paddingLeft: 20 }}>
        <li>Contratos de domínio tipados</li>
        <li>Adaptador Supabase somente leitura</li>
        <li>Fallback legado preservado</li>
      </ul>
    </main>
  );
}
