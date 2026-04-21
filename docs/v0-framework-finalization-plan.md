# Plano de ação — Fechamento da versão 0 (Framework)

## Diagnóstico objetivo

O framework já possui base funcional de shell, breakpoints, níveis e primitivas estruturais.  
Porém, **a versão 0 ainda não está 100% finalizada** para corte de `v1.0.0` por dois motivos de consolidação:

1. Divergência de runtime entre entrada standalone e árvore modular `apps/web/src`.
2. Ausência de pipeline oficial de build/test para validar a árvore modular completa sem regressões.

## Estado já consolidado

- Shell e navegação estrutural definidos (header/body/footer, tabbar, sidebar).
- Breakpoints e comportamento compact/wide definidos.
- Níveis 0/1/2/3 documentados.
- Primitivas oficiais disponíveis (detail pane, drawer, sheet, overlay).
- Contratos documentais (`framework-layout`, `framework-checkup`).

## Escopo restante para fechar a versão 0

### Eixo A — Runtime único oficial
- Definir e manter **uma única entrada oficial** (preferencialmente modular).
- Eliminar drift entre standalone e `apps/web/src`.
- Garantir que todo JSX importado seja transpilado no fluxo escolhido.

### Eixo B — Pipeline de build/test
- Adicionar fluxo reprodutível de build do app.
- Adicionar smoke test de inicialização (sem tela branca).
- Adicionar check mínimo de contratos estruturais (shell/breakpoints/níveis).

### Eixo C — Governança de versão
- Sincronizar versão exibida no app com versão do changelog.
- Criar regra de release: `v0.x` (consolidação), `v1.0.0` (framework fechado).

## Critérios para declarar “Framework v0 concluído”

1. Runtime único oficial definido e estável.
2. Build executável sem workaround manual.
3. Smoke test de boot passando.
4. Contratos de shell/breakpoints/níveis preservados no app em execução.
5. Changelog consolidado de encerramento da versão 0.

## Marco de transição para versão 1

Quando os critérios acima forem cumpridos:

- criar release de consolidação `v0.x-final` (encerramento da etapa framework),
- publicar entrada de início de ciclo `v1.0.0` focada em aplicação dos módulos/telas sobre a base consolidada (sem reinvenção estrutural).
