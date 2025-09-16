# Minha Rotina – Protótipo v2 (HTML/CSS/JS)

Agora com **Metas diárias** e **Notas do dia**! 🎯📝

## Novidades
- **Metas do dia**
  - Adicione metas rápidas (Enter ou botão ➕)
  - Marque como concluída ✅, edite ✏️ ou exclua 🗑️
  - Barra de **progresso** e contador (concluídas/total)
  - **Limpar concluídas** e **Levar pendentes para amanhã** (copia as metas não concluídas para a data de amanhã)
- **Notas do dia**
  - Campo de texto com **autosave** (salva 500ms após parar de digitar)
  - Indicador "Salvo às HH:MM" e botão **Limpar notas**

> Tudo é salvo **por dia** usando `localStorage` e funciona **offline** no navegador.

## Como usar
1. Abra `index.html` no navegador.
2. Clique em **"🔔 Ativar lembretes"** para permitir notificações (opcional).
3. Cadastre suas **metas** do dia (seção "Metas do dia").
4. Anote o que for importante em **Notas do dia**.
5. Use o **Pomodoro** e acompanhe o **Relatório (7 dias)** como antes.

## Observações
- O botão **Levar pendentes para amanhã** apenas **copia** as metas não concluídas para o próximo dia; não altera as metas do dia atual.
- Lembretes só disparam com a **aba aberta** (para funcionar em segundo plano é preciso evoluir para PWA com Service Worker).

## Estrutura
```
./
├── index.html
├── styles.css
└── app.js
```

## Próximos passos (opcionais)
- PWA + Service Worker para lembretes com a aba fechada
- Exportar/Importar dados (metas, notas, rotina) em JSON
- Tags e prioridade nas metas (ex.: Estudo, Saúde, Trabalho)
- Linkar metas com horários da rotina (ex.: sugerir meta dentro de janelas livres)
- Sincronização em nuvem (Google Drive/Calendar)
