# Observatório de IA — OTIA EC

Site do **Observatório Turíbio de Inteligência Artificial, Equidade e Cidadania**.

## Estrutura

- `index.html` — página principal
- `style.css` — estilos (vidro, fundo animado, dock)
- `script.js` — luz do ponteiro, zoom do dock, chat e avisos

## Ver localmente

Abra `index.html` no navegador. As fontes do Google carregam se houver internet;
caso contrário, o site usa as fontes do sistema.

## Publicar no GitHub Pages

1. O repositório precisa ser **público** (no plano gratuito).
2. Os arquivos `index.html`, `style.css` e `script.js` devem estar na **raiz** do repositório.
3. No GitHub, vá em **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch **main** e a pasta **/ (root)**. Salve.
6. Aguarde alguns minutos. O endereço será:
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

> Importante: a página do repositório mostra o código-fonte. O site renderizado
> fica no endereço do GitHub Pages.

## Conteúdo

- Cartilha digital (link externo)
- Questionários para professores e estudantes
- IEIA, MCIA e Políticas públicas — botões preparados; troque `href="#"` pelos
  links definitivos e remova o atributo `data-soon` em `index.html`.
- Chat em modo de prévia local. A integração futura está em `answerQuestion()`
  no arquivo `script.js`.
