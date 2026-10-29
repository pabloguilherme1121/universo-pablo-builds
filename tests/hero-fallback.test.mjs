import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function mount({ complete = false, naturalWidth = 10 } = {}) {
  const visual = { hidden: false };
  const image = {
    hidden: false,
    complete,
    naturalWidth,
    events: {},
    addEventListener(type, callback) { this.events[type] = callback; },
  };
  const document = {
    querySelector(selector) {
      if (selector === '.hero-visual img') return image;
      if (selector === '.hero-visual') return visual;
      if (selector === '#filter-status') return { textContent: '' };
      throw new Error('Seletor inesperado: ' + selector);
    },
    querySelectorAll(selector) {
      if (selector === '[data-filter]' || selector === '[data-categories]') return [];
      throw new Error('Seletor inesperado: ' + selector);
    },
  };
  runInNewContext(source, { document });
  return { visual, image };
}

test('falha de imagem não deixa área decorativa vazia', () => {
  const { visual, image } = mount();
  image.events.error();
  assert.equal(image.hidden, true);
  assert.equal(visual.hidden, true);
});

test('imagem quebrada antes da inicialização também oculta a área', () => {
  const { visual, image } = mount({ complete: true, naturalWidth: 0 });
  assert.equal(image.hidden, true);
  assert.equal(visual.hidden, true);
});

test('imagem carregada mantém a área visual', () => {
  const { visual, image } = mount({ complete: true, naturalWidth: 300 });
  assert.equal(image.hidden, false);
  assert.equal(visual.hidden, false);
});
