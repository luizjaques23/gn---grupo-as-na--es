# 📘 Antigrafty — Padrão Estético e Registro de Alterações

Este documento estabelece o guia oficial de estilo visual, boas práticas de experiência do usuário (UX/UI) e o histórico de padronização do projeto **Antigrafty** (Igreja às Nações — Supervisão Resgate / GNs).

---

## 🎨 1. Padrão Estético do Antigrafty

### Princípios Fundamentais de Design
- **Consistência Visual Inegociável**: Não alterar a paleta e a harmonia estética geral sem solicitação explícita.
- **Preservação de Elementos Existentes**: Modificar pontualmente o que for solicitado, mantendo tokens de espaçamento, glassmorphism e tipografia intactos.
- **Harmonia Visual**: Novos botões, alertas e cartões devem dialogar com o sistema de design (modo claro/escuro, bordas suaves, efeitos táteis de clique e hover).
- **Validação de UX**: Garantir que as alterações aumentem a clareza para o usuário na escolha de grupos ou navegação.

### Cores e Destaques
- **Atenção / Urgência ("Em breve")**: Vermelho (`#DC2626` / `#EF4444` / `#FF0000`), com fundo translúcido e bordas sutis.
- **Categorias Oficiais de GNs**:
  - **Meninas**: Rosa / Pink (`#EC4899`, foco em adolescentes meninas)
  - **Meninos**: Azul / Blue (`#3B82F6`, foco em adolescentes meninos)
  - **Misto**: Roxo / Purple (`#8B5CF6`, comunhão mista / geral)
  - **Kids**: Âmbar / Dourado (`#F59E0B`, crianças)
  - **Jovem (Em breve)**: Destaque em vermelho com efeito pulsante
- **Tema Claro/Escuro**: Suporte nativo completo com classes Tailwind `dark:`, variáveis CSS dinâmicas e transições suaves.

### Tipografia e Hierarquia
- **Fonte Principal**: `Inter`, com suporte do `sans-serif` nativo do sistema.
- **Nomes dos Criadores / Seção de Créditos**: Aumentados, com alto contraste, ícones de ação (`Mail`) e formato clicável (`mailto:`).
- **Rótulos e Badges**: Caixa alta (`uppercase`), tracking expandido (`tracking-wider` ou `tracking-widest`), fonte negrito/extranegrito em tamanho micro (`text-[9px]` a `text-xs`).

### Animações e Microinterações
- **Pisca Contínuo (`animate-blink`)**:
  - Efeito suave de pulso e opacidade (100% ↔ 25%), ideal para badges de atenção como "Em breve".
- **Feedback Tátil**:
  - `whileTap={{ scale: 0.95 }}` nos botões de seleção de categorias e países.
  - `active:scale-95` e `hover:scale-105` para links rápidos e criadores.
- **Performance**:
  - Uso estrito de propriedades aceleradas por GPU (`opacity`, `transform: translate3d / scale3d`).
  - Compatibilidade com preferência de redução de movimento (`prefers-reduced-motion`).

---

## 📋 2. Alterações Realizadas

### 1️⃣ Seção Jovens — "Em Breve"
- **Ação**: Atualizado o badge "Em breve" para vermelho com animação contínua piscante (`animate-blink`).
- **Ponto visual**: O indicador de estado agora pulsa em vermelho (`bg-red-500 animate-pulse`), chamando atenção imediata para o futuro lançamento da categoria.

### 2️⃣ Categoria de Grupos — "GN ILHAS CAYMAN"
- **Problema**: O grupo `GN Ilhas Cayman — KIDS MISTO` estava catalogado como `MISTO`.
- **Ajuste Realizado**: Movido formalmente para a categoria `KIDS` em `src/data/groups.ts`.
- **Tratamento de Interface**: O componente `GroupCard.tsx` foi atualizado para reconhecer a estrutura de público infantil/crianças com badge âmbar apropriado.

### 3️⃣ Limpeza de Textos
- **Ação**: Validação de conteúdo para assegurar que instruções internas e referências obsoletas (como anotações de folhas impressas) permaneçam removidas da interface pública, garantindo layout limpo e direto ao ponto.

### 4️⃣ Ampliação e Destaque da Seção "Feito por"
- **Ação**: Ampliação da tipografia e destaque dos nomes dos desenvolvedores no rodapé.
- **Links Diretos**:
  - **Miguel Casagrande**: [miguel.cg.contato@gmail.com](mailto:miguel.cg.contato@gmail.com)
  - **Luiz Henrique Jaques**: [Luizjaques23@gmail.com](mailto:Luizjaques23@gmail.com)
- **Estilo**: Badges interativos arredondados, com ícone de e-mail integrado e animações de micro-interação.

---

## ✅ 3. Checklist para Futuras Alterações

- [ ] Preservar a paleta e estética original do projeto sem descaracterização.
- [ ] Validar a integridade das 4 categorias canônicas: `MENINAS`, `MENINOS`, `MISTO` e `KIDS`.
- [ ] Manter o estilo vermelho piscante (`animate-blink`) para o estado "Em breve".
- [ ] Assegurar que os nomes e contatos dos criadores permaneçam em destaque no rodapé.
- [ ] Não reintroduzir textos de apoio administrativo redundantes.
- [ ] Validar compatibilidade no modo claro e escuro.
- [ ] Rodar `npm run build` para garantir ausência de quebras de compilação TypeScript.

---

## 🔗 4. Informações de Contato dos Criadores

- **Miguel Casagrande**: [miguel.cg.contato@gmail.com](mailto:miguel.cg.contato@gmail.com)
- **Luiz Henrique Jaques**: [Luizjaques23@gmail.com](mailto:Luizjaques23@gmail.com)
