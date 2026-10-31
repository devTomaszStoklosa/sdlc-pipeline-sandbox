# sdlc-pipeline-sandbox

Repozytorium demo [wieloagentowego pipeline'u SDLC](https://github.com/devTomaszStoklosa/sdlc-multi-agent-pipeline). Na nim pipeline przejmuje oznaczone issue i oddaje człowiekowi PR po bramkach i review agenta. Zawartość i ustawienia opisuje przyrost P3 [planu MVP](https://github.com/devTomaszStoklosa/sdlc-multi-agent-pipeline/blob/main/plan.md#p3-repozytorium-demo-i-github-app).

## Aplikacja

Koszyk zakupowy w [src/cart.ts](src/cart.ts): dodawanie i usuwanie pozycji, suma, rabat procentowy i suma końcowa. Kwoty są liczbami całkowitymi w groszach.

## Rozwój

Wymagania:

- Node.js 22 (wersja w [.nvmrc](.nvmrc));
- git 2.31 lub nowszy (wymaga go lefthook);
- [gitleaks](https://github.com/gitleaks/gitleaks) 8.30.1 w `PATH`. Bez niego hook `pre-commit` odrzuca każdy commit.

`npm ci` instaluje zależności i hooki gita ([lefthook.yml](lefthook.yml)):

- `pre-commit`: Prettier, ESLint i gitleaks na plikach w stage'u;
- `commit-msg`: commitlint, czyli Conventional Commits z odwołaniem do issue, np. `feat: add a fixed-amount discount (#4)`.

Skrypty:

- `npm run typecheck`: TypeScript bez emisji plików;
- `npm run lint`: ESLint z progami złożoności i rozmiaru;
- `npm run format` i `npm run format:check`: Prettier (bez plików Markdown);
- `npm run duplication`: jscpd z progiem 3%;
- `npm test`: Vitest;
- `npm run coverage`: Vitest z pokryciem.

## Bramki

Workflow [gates.yml](.github/workflows/gates.yml) uruchamia każdą bramkę jako osobny job, a [codeql.yml](.github/workflows/codeql.yml) analizę CodeQL:

| Bramka | Job |
|---|---|
| Analiza statyczna i złożoność | `lint` |
| Formatowanie | `format` |
| Typy | `typecheck` |
| Testy | `test` |
| Pokrycie nie niższe niż w bazie PR | `coverage` |
| Duplikacja | `duplication` |
| Sekrety | `secrets` |
| Komunikaty commitów | `commitlint` |
| Podatności w zależnościach (od `high`) | `dependency-review` |
| SAST | CodeQL i reguła `code_scanning` rulesetu |

Żaden job nie ma uprawnień `checks: write` ani `statuses: write`.

## Ochrona `main`

Trzy rulesety z [.github/rulesets](.github/rulesets), wgrane przez API:

- **gates:** zmiany tylko przez PR, bez force-pushu i usunięcia brancha, wymagane bramki ze źródłem GitHub Actions i wyniki CodeQL. Bez obejść.
- **approval:** approval code ownera. Obejść go może tylko administrator przy merge PR.
- **agent-review:** check `agent-review` wystawiony przez GitHub App pipeline'u. Obejść go może tylko administrator przy merge PR.

## Próbna sesja agenta

Ręczny workflow [agent-trial.yml](.github/workflows/agent-trial.yml) uruchamia na `main` próbną sesję `claude -p` z hookami i sandboxem pipeline'u, przypiętą do commita pipeline'u (przyrost P2). Używa środowiska `agents` z tokenem Claude Code i zużywa limit planu Pro. W logu i podsumowaniu runu są tylko podsumowania sesji, bez transkryptu.

## Etykiety

`agent:ready`, `agent:stop`, `plan:approved` i `needs-human` (spec 10).

## Pipeline

Konfiguracja pipeline'u jest w [.sdlc-agents.yml](.sdlc-agents.yml). Cienkie workflow wywołują reusable workflows pipeline'u przypięte do commita (przyrost P4):

- [orchestrate.yml](.github/workflows/orchestrate.yml): przebieg issue sterowany etykietami, komentarzami i wynikami workflow `Gates`;
- [stop.yml](.github/workflows/stop.yml): zatrzymanie przebiegu etykietą `agent:stop` na issue albo na PR;
- [pr-closed.yml](.github/workflows/pr-closed.yml): zakończenie przebiegu po zamknięciu albo merge'u jego PR.

Przebieg startuje dodanie `agent:ready` do issue przez osobę z co najmniej uprawnieniem triage. Stan przebiegu pipeline zapisuje w ukrytym komentarzu w issue. Zmianę high-impact człowiek akceptuje etykietą `plan:approved` albo prosi o poprawki komentarzem. Zdjęcie `needs-human` wznawia przebieg, a `agent:stop` go zatrzymuje.

Ręczne uruchomienie workflow Orchestrate z numerem issue startuje przebieg czekający w kolejce, gdy żaden inny nie jest aktywny, albo odzyskuje zdarzenie, które nie dotarło.

W P4 role są zaślepkami bez modelu i bez tokenu Claude Code. Ich zachowanie ustala ukryty blok `<!-- sdlc-stub ... -->` w treści issue, opisany w README pipeline'u. Zaślepka Developera commituje plik w `stub-runs/` i otwiera draft PR.
