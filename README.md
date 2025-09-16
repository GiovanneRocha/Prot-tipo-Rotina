# Minha Rotina – Protótipo (HTML/CSS/JS)

Protótipo simples e funcional para organizar sua rotina diária com:

- ✅ Rotina com checklist (salva por dia via `localStorage`)
- 🔔 Lembretes antes de cada atividade (notificações do navegador + som)
- 📈 Relatório rápido dos últimos 7 dias
- ⏱️ Pomodoro de estudos (25/5/15)
- 💡 Sugestões de microtarefas com base no tempo livre até a próxima atividade
- 🌓 Tema claro/escuro

> **Observação:** Lembretes são disparados enquanto a aba estiver aberta. Para lembretes em segundo plano (mesmo com a aba fechada), é necessário implementar Service Worker e/ou um backend para push notifications – fora do escopo deste protótipo.

## Como usar

1. Baixe o `.zip` e extraia.
2. Abra o arquivo `index.html` no navegador (Chrome/Edge/Firefox).
3. Clique em **"🔔 Ativar lembretes"** para permitir notificações.
4. Ajuste a rotina em **Editar rotina** se quiser.
5. Use o Pomodoro e acompanhe suas métricas semanais.

## Personalização rápida

- **Minutos antes para lembrete:** campo no topo da seção "Rotina do dia".
- **Editar/Salvar rotina:** dentro de **✏️ Editar rotina**.
- **Restaurar padrão:** volta para a rotina fornecida no briefing.
- **Tema:** botão 🌓 no topo.

## Estrutura

```
./
├── index.html
├── styles.css
└── app.js
```

## Próximos passos (se quiser evoluir)

- PWA com Service Worker para lembretes mesmo com a aba fechada.
- Integração com Google Calendar (OAuth + sync).
- Exportar/Importar rotina em JSON.
- Modo foco (esconde distrações e foca na atividade atual).
- Estatísticas detalhadas (por atividade, horários, consistência mensal).

## Licença

Código livre para uso pessoal e educacional.
