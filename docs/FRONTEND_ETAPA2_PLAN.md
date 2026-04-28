# Plano oficial — Etapa 2 do Frontend OdontoFlow

Status: **Etapa 1 (framework base) concluída**.  
Objetivo desta etapa: finalizar estética, consistência de componentes compartilhados e acabamento responsivo tela por tela.

## Ordem de execução (incremental)

1. **Shell/Navegação global (prioridade máxima)**
   - Consolidar navbar `icon-first` com contraste AA, tamanho de toque e estado ativo/inativo coloridos.
   - Revisar drawer/sidebar mobile com sobreposição estável e sem duplicidade visual.
   - Validar regra de 5 itens sem scroll (4 em telas estreitas) e scroll para volumes maiores.

2. **Início (Nível 0)**
   - Ajustar hierarquia do header (kicker/título/subtítulo) e respiro dos cards KPI.
   - Revisar grid de atalhos e feed para densidade adequada em mobile/tablet/desktop.
   - Garantir consistência com componentes oficiais `.of-*`.

3. **Agenda (Nível 1)**
   - Refinar tabela/lista móvel para leitura rápida e ações primárias.
   - Padronizar botões e filtros com spacing/tokens globais.
   - Revisar estados de status (`pill/chip`) para contraste e semântica visual.

4. **Pacientes (Nível 1)**
   - Ajustar legibilidade de cards/tabela mobile e largura útil dos blocos.
   - Revisar ordem informacional: identificação, contato, status e ação.
   - Garantir responsividade sem overflow horizontal.

5. **Clínicas (Nível 1)**
   - Refinar estrutura de tabela responsiva e formulário modal.
   - Padronizar destaques de status e seleção de clínica ativa.
   - Revisar consistência de ações de backend local.

6. **Equipe (Nível 1)**
   - Otimizar visual de vínculos multi-clínica e filtros.
   - Consolidar legibilidade de contrato/custo/repasse por breakpoint.
   - Reforçar estados de convite/ativo/inativo.

7. **Financeiro (Nível 1)**
   - Finalizar acabamento dos widgets estratégicos e operacionais.
   - Revisar microinterações (abas internas, foco, hover, loading) com tokens.
   - Fechar grid sem cortes, com ocupação máxima útil e sem overflow.

8. **Perfil (Nível 1)**
   - Refinar blocos de conta/preferências e feedback de formulário.
   - Padronizar tiles de resumo e CTA de atualização.
   - Validar comportamento mobile para menus e inputs.

## Checklist obrigatório por tela

- Sem overflow horizontal global.
- Navegação e rotas preservadas.
- Uso prioritário de componentes oficiais `.of-*`.
- Tokens `--of-*` aplicados (sem hardcode desnecessário).
- Contraste e foco visível em ações principais.
- Validação em mobile/tablet/desktop.

## Comandos de validação por entrega

- `bash ./scripts/check-framework.sh`
- `bash ./scripts/smoke-runtime.sh`
