# Rotina de limpeza segura do repositório

## Objetivo
Remover artefatos desatualizados sem comprometer o runtime oficial (shell HTML + páginas HTML/CSS/JS modulares).

## Metodologia oficial (4 fases)

1. **Mapear entrypoints ativos**
   - `index.html` (deploy principal)
   - `apps/web/app-shell/shell.js` (navegação e carregamento de módulos)
   - `apps/web/src/**/<tela>.html` (páginas carregadas via iframe)

2. **Construir grafo de uso estático**
   - Buscar referências de caminho/nome de arquivo com `rg`.
   - Classificar arquivo como:
     - `ativo`: referenciado por entrypoint/fluxo oficial.
     - `legado`: não referenciado no runtime oficial, mas com histórico/documentação.
     - `candidato à remoção`: sem referência de runtime e sem papel contratual.

3. **Aplicar remoção por camadas**
   - Camada 1 (segura): remover apenas candidatos sem referência cruzada.
   - Camada 2 (controlada): remover legados com fallback substituído.
   - Camada 3 (manual): itens de risco (auth, integrações externas, migração de dados) só com validação funcional.

4. **Validar contrato antes de merge**
   - `bash ./scripts/check-framework.sh`
   - `bash ./scripts/smoke-runtime.sh`

## Critério de bloqueio de remoção
Não remover se o item:
- for carregado direta/indiretamente por `index.html`, `shell.js` ou telas em `apps/web/src/**`;
- for necessário para preservar módulo Financeiro e dados simulados;
- tiver integração externa ainda não migrada.

## Ferramenta de apoio
Use `bash ./scripts/cleanup-audit.sh` para listar candidatos estáticos à limpeza.

> Observação: a auditoria é heurística (estática). Antes de remover itens de risco, validar manualmente navegação e fluxos críticos.
