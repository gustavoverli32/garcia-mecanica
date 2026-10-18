# Tokens visuais da Garcia

Os tokens abaixo registram a identidade já existente no shell modular. Eles são uma referência de implementação, não uma alteração de visual.

```ts
export const garciaTokens = {
  colors: {
    background: '#f4f4f5',
    surface: '#ffffff',
    sidebar: '#171717',
    text: '#111827',
    muted: '#9ca3af',
    accent: '#ffc107',
    success: '#10b981',
    info: '#818cf8',
    danger: '#ef4444',
  },
  layout: { sidebar: '230px', sidebarCompact: '76px', radius: '12px' },
} as const;
```

Não aplicar novos valores diretamente nas telas sem uma revisão visual comparativa.
