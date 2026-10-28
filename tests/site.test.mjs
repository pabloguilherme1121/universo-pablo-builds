import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const root = new URL('../', import.meta.url);
const [html, styles, source] = await Promise.all([
  readFile(new URL('index.html', root), 'utf8'),
  readFile(new URL('styles.css', root), 'utf8'),
  readFile(new URL('app.js', root), 'utf8'),
]);

test('a página não executa JavaScript em atributos HTML inline', () => {
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
  assert.match(html, /<script\s+src="app\.js"\s+defer><\/script>/);
});

test('links externos abertos em nova aba protegem a janela de origem', () => {
  const externalLinks = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)];
  assert.ok(externalLinks.length >= 4);
  for (const [tag] of externalLinks) {
    assert.match(tag, /rel="[^"]*noopener[^"]*noreferrer[^"]*"/);
  }
});

test('o layout contém adaptação explícita para cabeçalho até 400px', () => {
  assert.match(styles, /@media\s*\(max-width:\s*400px\)[\s\S]*?\.header\s*\{\s*flex-direction:\s*column/);
});

function mount() {
  const status = { textContent: '' };
  const buttons = ['todos', 'tecnologia', 'jogos', 'dados', 'mobilidade'].map(filter => {
    const listeners = {};
    const attributes = {};
    const classes = new Set();
    return {
      dataset: { filter },
      listeners,
      attributes,
      classes,
      classList: { toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      }},
      setAttribute(name, value) { attributes[name] = value; },
      addEventListener(name, handler) { listeners[name] = handler; },
    };
  });
  const projects = ['tecnologia', 'tecnologia jogos', 'tecnologia dados', 'tecnologia mobilidade']
    .map(categories => ({ dataset: { categories }, hidden: false }));
  const image = { hidden: false, complete: false, naturalWidth: 10, events: {},
    addEventListener(name, handler) { this.events[name] = handler; } };
  const document = {
    querySelectorAll(selector) {
      if (selector === '[data-filter]') return buttons;
      if (selector === '[data-categories]') return projects;
      throw Error('Seletor não previsto: ' + selector);
    },
    querySelector(selector) {
      if (selector === '#filter-status') return status;
      if (selector === '.hero-visual img') return image;
      throw Error('Seletor não previsto: ' + selector);
    },
  };
  runInNewContext(source, { document });
  return { status, buttons, projects, image };
}

test('filtros mantêm estado acessível, contagem e seleção correta', () => {
  const { status, buttons, projects } = mount();
  buttons[2].listeners.click();
  assert.deepEqual(projects.map(p => p.hidden), [true, false, true, true]);
  assert.equal(status.textContent, '1 projeto encontrado.');
  assert.equal(buttons[2].attributes['aria-pressed'], 'true');
  assert.equal(buttons[2].classes.has('active'), true);
  assert.equal(buttons[0].attributes['aria-pressed'], 'false');
  buttons[0].listeners.click();
  assert.ok(projects.every(p => !p.hidden));
  assert.equal(status.textContent, '4 projetos encontrados.');
});

test('falha de imagem decorativa é tratada sem código inline', () => {
  const { image } = mount();
  assert.equal(typeof image.events.error, 'function');
  image.events.error();
  assert.equal(image.hidden, true);
});

test('imagem carregada não é ocultada indevidamente', () => {
  const { image } = mount();
  assert.equal(image.hidden, false);
});
