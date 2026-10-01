// Requer Node.js, Playwright e Chrome. Sirva o projeto e execute: node tests/spa-validation.cjs
// SPA_BASE_URL e SPA_BROWSER_EXECUTABLE permitem usar outro servidor ou navegador Chromium.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const base = process.env.SPA_BASE_URL || 'http://127.0.0.1:4173/';
const report = [];
const cases = [];
const test = (name, run, options = {}) => cases.push({ name, run, options });
const selector = (route) => `#menu-principal > li > a[href="#${route}"]`;
const volunteer = { id: 42, name: 'Pessoa Teste', city: 'Londrina', state: 'PR' };

async function open(page, route = '/') {
  await page.goto(base + '#' + route);
  const name = route === '/' ? 'home' : route === '/inexistente' ? 'nao-encontrado' : route.split('/')[1];
  await page.waitForFunction((template) => document.querySelector('#app')?.dataset.page === template, name);
}

async function fill(page) {
  const values = { name: 'Pessoa Teste', birthdate: '2000-01-01', CPF: '52998224725', CEP: '86000000', street: 'Rua Exemplo, 123', city: 'Londrina', email: 'teste@example.test', phone: '43999999999' };
  for (const [id, value] of Object.entries(values)) await page.locator('#' + id).fill(value);
  await page.locator('#gender').selectOption('other');
  await page.locator('#state').selectOption('PR');
  await page.locator('#availability').selectOption('monday');
}

async function recordBrowser(context, page) {
  const log = { errors: [], console: [], requests: [], failures: [], debugger: [] };
  page.on('pageerror', (error) => log.errors.push({ message: error.message, stack: error.stack }));
  page.on('console', (message) => {
    if (['warning', 'error'].includes(message.type())) log.console.push({ type: message.type(), text: message.text() });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) log.failures.push({ url: response.url(), status: response.status() });
  });
  page.on('requestfailed', (request) => log.failures.push({ url: request.url(), error: request.failure()?.errorText }));
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Debugger.enable');
  await session.send('Debugger.setPauseOnExceptions', { state: 'all' });
  session.on('Network.requestWillBeSent', (event) => log.requests.push({ url: event.request.url, type: event.type }));
  session.on('Debugger.paused', async (event) => {
    const frame = event.callFrames[0];
    log.debugger.push({ reason: event.reason, exception: event.data?.description, function: frame?.functionName, line: (frame?.location.lineNumber ?? -1) + 1 });
    await session.send('Debugger.resume').catch(() => {});
  });
  return log;
}

for (const value of ['{JSON quebrado', '"texto"', '{}', 'null', '[null, {}, 3]']) {
  test(`Armazenamento malformado: ${value}`, async ({ page }) => {
    await open(page, '/cadastro');
    await page.getByText('Nenhum voluntário cadastrado ainda.').waitFor();
    await fill(page);
    await page.locator('button[type="submit"]').click();
    await page.locator('#confirmar-envio').click();
    assert.equal(await page.locator('.volunteer-item').count(), 1);
    assert.equal(await page.locator('#name').inputValue(), '');
  }, { storage: { 'ongad:voluntarios': value } });
}

test('Lista mista preserva registros válidos', async ({ page }) => {
  await open(page, '/cadastro');
  await page.locator('.volunteer-item').waitFor();
  assert.equal(await page.locator('.volunteer-item').count(), 1);
  assert.ok((await page.locator('.volunteer-item').textContent()).includes(volunteer.name));
}, { storage: { 'ongad:voluntarios': JSON.stringify([null, volunteer, {}]) } });

test('Gravação bloqueada preserva os campos e não anuncia sucesso', async ({ page, log }) => {
  await open(page, '/cadastro');
  await fill(page);
  await page.locator('button[type="submit"]').click();
  await page.locator('#confirmar-envio').click();
  await page.getByText('Cadastro não salvo', { exact: true }).waitFor();
  assert.equal(await page.getByText('Cadastro enviado!', { exact: true }).count(), 0);
  assert.equal(await page.locator('#name').inputValue(), 'Pessoa Teste');
  assert.equal(await page.locator('button[type="submit"]').isEnabled(), true);
  assert.equal(await page.evaluate(() => localStorage.getItem('ongad:voluntarios')), null);
  assert.ok(log.debugger.some((entry) => entry.exception?.includes('QuotaExceededError')));
}, { failWrites: true });

test('Remoção bloqueada preserva o cadastro', async ({ page }) => {
  await open(page, '/cadastro');
  await page.locator('[data-remove]').click();
  await page.getByText('Não foi possível remover', { exact: true }).waitFor();
  assert.equal(await page.locator('.volunteer-item').count(), 1);
  assert.equal(await page.getByText('Removido', { exact: true }).count(), 0);
}, { failWrites: true, storage: { 'ongad:voluntarios': JSON.stringify([volunteer]) } });

test('Falha na lista preserva rascunho ao navegar e voltar', async ({ page }) => {
  await open(page, '/cadastro');
  await page.locator('#form-voluntario').waitFor();
  await page.clock.install();
  await fill(page);
  await page.locator('button[type="submit"]').click();
  await page.locator('#confirmar-envio').click();
  await page.getByText('Cadastro não salvo', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('ongad:rascunho')).name), 'Pessoa Teste');
  await page.locator(selector('/')).click();
  await page.waitForFunction(() => document.querySelector('#app').dataset.page === 'home');
  await page.locator(selector('/cadastro')).click();
  await page.locator('#form-voluntario').waitFor();
  assert.equal(await page.locator('#name').inputValue(), 'Pessoa Teste');
}, { failListWrites: true });

test('Rascunho é salvo na saída e não deixa temporizador antigo', async ({ page }) => {
  await open(page, '/cadastro');
  await page.locator('#name').waitFor();
  await page.clock.install();
  await page.locator('#name').fill('Pessoa Rascunho');
  await page.locator(selector('/')).click();
  await page.waitForFunction(() => document.querySelector('#app').dataset.page === 'home');
  const first = await page.evaluate(() => localStorage.getItem('ongad:rascunho'));
  assert.equal(JSON.parse(first).name, 'Pessoa Rascunho');
  await page.clock.runFor(500);
  assert.equal(await page.evaluate(() => localStorage.getItem('ongad:rascunho')), first);
  await page.locator(selector('/cadastro')).click();
  await page.locator('#name').waitFor();
  assert.equal(await page.locator('#name').inputValue(), 'Pessoa Rascunho');
  await page.locator('#name').fill('Outra Pessoa');
  await page.clock.runFor(350);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('ongad:rascunho')).name), 'Outra Pessoa');
});

test('Datas, aniversário e ano bissexto usam calendário local', async ({ page }) => {
  await open(page, '/cadastro');
  await page.clock.install({ time: new Date('2026-09-29T12:00:00-03:00') });
  const results = await page.evaluate(async () => {
    const { rules } = await import('./js/core/validators.js');
    return Object.fromEntries(['2000-02-31', '2001-02-29', '2000-02-29', '2008-09-30', '2008-09-29', '2026-12-01'].map((value) => [value, rules.birthdate(value)]));
  });
  assert.equal(results['2000-02-31'], 'Data inválida.');
  assert.equal(results['2001-02-29'], 'Data inválida.');
  assert.equal(results['2000-02-29'], '');
  assert.equal(results['2008-09-30'], 'É necessário ter 18 anos ou mais.');
  assert.equal(results['2008-09-29'], '');
  assert.equal(results['2026-12-01'], 'Data inválida.');
});

test('Campos inválidos bloqueiam envio e mostram mensagens acessíveis', async ({ page }) => {
  await open(page, '/cadastro');
  for (const [id, value] of [['name', 'Pessoa'], ['CPF', '11111111111'], ['CEP', '123'], ['email', 'endereco@'], ['phone', '123']]) {
    await page.locator('#' + id).fill(value);
    await page.locator('#' + id).blur();
    assert.equal(await page.locator('#' + id).getAttribute('aria-invalid'), 'true');
    assert.ok((await page.locator('#' + id + '-msg').textContent()).length > 0);
  }
  assert.equal(await page.locator('button[type="submit"]').isEnabled(), false);
  await page.locator('#form-voluntario').evaluate((form) => form.requestSubmit());
  assert.equal(await page.locator('#modal-confirmacao').evaluate((dialog) => dialog.open), false);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'name');
});

test('Máscaras, telefone fixo e celular correspondem à validação', async ({ page }) => {
  await open(page, '/cadastro');
  await fill(page);
  assert.equal(await page.locator('#CPF').inputValue(), '529.982.247-25');
  assert.equal(await page.locator('#CEP').inputValue(), '86000-000');
  for (const [value, formatted] of [['4333333333', '(43) 3333-3333'], ['43999999999', '(43) 99999-9999']]) {
    await page.locator('#phone').fill(value);
    assert.equal(await page.locator('#phone').inputValue(), formatted);
    assert.equal(await page.locator('#phone').evaluate((field) => field.validity.patternMismatch), false);
    assert.equal(await page.locator('button[type="submit"]').isEnabled(), true);
  }
});

test('Cadastro completo, progresso, remoção e reentrada sem eventos duplicados', async ({ page }) => {
  await open(page, '/cadastro');
  await page.locator('.registration-progress progress').waitFor();
  await fill(page);
  await page.waitForFunction(() => document.querySelector('.registration-progress progress').value === 11);
  await page.locator('button[type="submit"]').click();
  await page.locator('#confirmar-envio').click();
  await page.waitForFunction(() => document.querySelector('.registration-progress progress').value === 0);
  assert.equal(await page.locator('.volunteer-item').count(), 1);
  for (let i = 0; i < 3; i++) {
    await page.locator(selector('/')).click();
    await page.locator('.participacao__filtros').waitFor();
    await page.locator(selector('/cadastro')).click();
    await page.locator('.registration-progress progress').waitFor();
  }
  await page.locator('[data-remove]').click();
  assert.equal(await page.locator('.volunteer-item').count(), 0);
  assert.equal(await page.getByText('Removido', { exact: true }).count(), 1);
});

test('Toast permanece com foco mesmo após retirar o mouse', async ({ page }) => {
  await open(page, '/componentes');
  await page.locator('[data-toast="info"]').waitFor();
  await page.clock.install();
  await page.evaluate(async () => {
    const { toast } = await import('./js/ui/feedback.js');
    const el = toast({ message: 'Teste de foco', duration: 1000 });
    el.id = 'toast-under-test';
    el.querySelector('button').focus();
  });
  await page.locator('#toast-under-test').hover();
  await page.mouse.move(0, 0);
  await page.clock.runFor(1500);
  assert.equal(await page.locator('#toast-under-test').count(), 1);
  await page.locator(selector('/')).focus();
  await page.clock.runFor(1500);
  assert.equal(await page.locator('#toast-under-test').count(), 0);
});

test('Toast permanece sob o mouse após perder foco', async ({ page }) => {
  await open(page, '/componentes');
  await page.locator('[data-toast="info"]').waitFor();
  await page.clock.install();
  await page.evaluate(async () => {
    const { toast } = await import('./js/ui/feedback.js');
    const el = toast({ message: 'Teste de mouse', duration: 1000 });
    el.id = 'toast-under-test';
    el.querySelector('button').focus();
  });
  await page.locator('#toast-under-test').hover();
  await page.locator(selector('/')).focus();
  await page.clock.runFor(1500);
  assert.equal(await page.locator('#toast-under-test').count(), 1);
  await page.mouse.move(0, 0);
  await page.clock.runFor(1500);
  assert.equal(await page.locator('#toast-under-test').count(), 0);
});

for (const mode of ['offline', '500']) {
  test(`Falha de rede ${mode} e recuperação sem sair da rota`, async ({ page, context, log }) => {
    const blocked = (route) => mode === 'offline' ? route.abort('internetdisconnected') : route.fulfill({ status: 500, body: 'Erro simulado' });
    await context.route('**/html/contato.html', blocked);
    await open(page, '/contato');
    await page.getByRole('button', { name: 'Tentar novamente' }).waitFor();
    assert.equal(await page.locator('#route-announcer').textContent(), 'Não foi possível carregar Contato');
    assert.ok(log.failures.some((entry) => entry.url.endsWith('/html/contato.html')));
    await context.unroute('**/html/contato.html', blocked);
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await page.getByRole('heading', { name: 'Informações de Contato' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Tentar novamente' }).count(), 0);
  }, { allowNetworkFailures: true });
}

test('Menu também permite tentar novamente na rota com erro', async ({ page, context }) => {
  const blocked = (route) => route.abort('internetdisconnected');
  await context.route('**/html/contato.html', blocked);
  await open(page, '/contato');
  await page.getByRole('button', { name: 'Tentar novamente' }).waitFor();
  await context.unroute('**/html/contato.html', blocked);
  await page.locator(selector('/contato')).click();
  await page.getByRole('heading', { name: 'Informações de Contato' }).waitFor();
}, { allowNetworkFailures: true });

test('Falha no módulo do cadastro permite nova importação ao recarregar', async ({ page, context }) => {
  const blocked = (route) => route.abort('internetdisconnected');
  await context.route('**/js/pages/cadastro.js', blocked);
  await open(page, '/cadastro');
  await page.getByRole('button', { name: 'Tentar novamente' }).waitFor();
  await context.unroute('**/js/pages/cadastro.js', blocked);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await page.locator('#form-voluntario').waitFor();
}, { allowNetworkFailures: true });

test('Falha tardia do módulo após erro do HTML é recuperada na primeira tentativa', async ({ page, context }) => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const blockHTML = (route) => route.abort('internetdisconnected');
  const blockModule = async (route) => { await gate; await route.abort('internetdisconnected'); };
  await context.route('**/html/cadastro.html', blockHTML);
  await context.route('**/js/pages/cadastro.js', blockModule);
  await open(page, '/cadastro');
  await page.getByRole('button', { name: 'Tentar novamente' }).waitFor();
  const failed = page.waitForEvent('requestfailed', { predicate: (request) => request.url().endsWith('/js/pages/cadastro.js') });
  release();
  await failed;
  await page.waitForLoadState('networkidle');
  await context.unroute('**/html/cadastro.html', blockHTML);
  await context.unroute('**/js/pages/cadastro.js', blockModule);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await page.locator('#form-voluntario').waitFor();
}, { allowNetworkFailures: true });

test('CDN bloqueada mantém cartões, perguntas nativas e formulário', async ({ page, context }) => {
  await context.route('https://esm.sh/**', (route) => route.abort('internetdisconnected'));
  await open(page);
  assert.equal(await page.locator('.participacao__cartao').count(), 3);
  await page.locator(selector('/projeto')).click();
  await page.locator('#projeto-perguntas details').first().waitFor();
  await page.locator('#projeto-perguntas summary').first().click();
  assert.equal(await page.locator('#projeto-perguntas details').first().getAttribute('open'), '');
  await page.locator(selector('/cadastro')).click();
  await page.locator('#form-voluntario').waitFor();
  await fill(page);
  assert.equal(await page.locator('button[type="submit"]').isEnabled(), true);
}, { allowNetworkFailures: true });

test('Resposta lenta não substitui a última página escolhida', async ({ page, context }) => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await context.route('**/html/projeto.html', async (route) => { await gate; await route.continue(); });
  await open(page);
  await page.locator(selector('/projeto')).click();
  await page.locator(selector('/contato')).click();
  await page.getByRole('heading', { name: 'Informações de Contato' }).waitFor();
  release();
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('#app').getAttribute('data-page'), 'contato');
  assert.equal(await page.locator('#page-title').textContent(), 'Contate-nos');
});

test('Voltar, avançar, âncoras e caminho inexistente', async ({ page }) => {
  await open(page);
  await page.locator(selector('/projeto')).click();
  await page.locator('#objetivos').waitFor();
  await page.locator(selector('/contato')).click();
  await page.getByRole('heading', { name: 'Informações de Contato' }).waitFor();
  await page.goBack();
  await page.locator('#objetivos').waitFor();
  await page.goForward();
  await page.getByRole('heading', { name: 'Informações de Contato' }).waitFor();
  await page.evaluate(() => { location.hash = '#/projeto/objetivos'; });
  await page.locator('#objetivos').waitFor();
  await page.evaluate(() => { location.hash = '#/inexistente'; });
  await page.waitForFunction(() => document.querySelector('#app').dataset.page === 'nao-encontrado');
});

test('Modais, Escape, alertas e menu no celular', async ({ page }) => {
  await open(page, '/componentes');
  await page.locator('[data-modal-open="modal-info"]').click();
  assert.equal(await page.locator('#modal-info').evaluate((dialog) => dialog.open), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#modal-info').evaluate((dialog) => dialog.open), false);
  await page.locator('[data-alert-close]').click();
  assert.equal(await page.locator('#app .alert--error').count(), 0);
  await page.setViewportSize({ width: 375, height: 812 });
  const menuBounds = await page.locator('.menu-toggle').boundingBox();
  assert.ok(menuBounds.x + menuBounds.width / 2 > 375 * 0.75, 'O menu mobile deve ficar à direita');
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
  await page.locator('.menu-toggle').click();
  await page.locator(selector('/cadastro')).click();
  await page.locator('#form-voluntario').waitFor();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
});

test('Texto semelhante a HTML permanece texto na lista', async ({ page }) => {
  await open(page, '/cadastro');
  await page.locator('.volunteer-item').waitFor();
  assert.equal(await page.locator('.volunteer-item img').count(), 0);
  assert.ok((await page.locator('.volunteer-item').textContent()).includes('<img'));
  assert.equal(await page.evaluate(() => window.validationInjection), undefined);
}, { storage: { 'ongad:voluntarios': JSON.stringify([{...volunteer, name:'<img src=x onerror="window.validationInjection=1"> Pessoa'}]) } });

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.SPA_BROWSER_EXECUTABLE ? { executablePath: process.env.SPA_BROWSER_EXECUTABLE } : { channel: 'chrome' }) });
  try {
    for (const item of cases) {
      const context = await browser.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 1440, height: 1000 } });
      let result = { name: item.name, passed: false };
      try {
        await context.addInitScript(({ storage = {}, failWrites, failListWrites }) => {
          for (const [key, value] of Object.entries(storage)) localStorage.setItem(key, value);
          if (failWrites || failListWrites) {
            const original = Storage.prototype.setItem;
            Storage.prototype.setItem = function(key, value) {
              if (failWrites || key === 'ongad:voluntarios') throw new DOMException('Falha de armazenamento simulada', 'QuotaExceededError');
              return original.call(this, key, value);
            };
          }
        }, item.options);
        const page = await context.newPage();
        const log = await recordBrowser(context, page);
        result.log = log;
        await item.run({ page, context, log });
        assert.deepEqual(log.errors, []);
        if (!item.options.allowNetworkFailures) {
          assert.equal(log.failures.filter((entry) => !entry.url.endsWith('/favicon.ico')).length, 0);
        }
        result.passed = true;
        console.log('PASS: ' + item.name);
      } catch (error) {
        result.error = error.stack;
        console.error('FAIL: ' + item.name + '\n' + error.stack);
      } finally {
        report.push(result);
        await context.close();
      }
    }
  } finally {
    await browser.close();
    const destination = process.env.SPA_REPORT_PATH || path.join(os.tmpdir(), 'inclusao-spa-validation.json');
    fs.writeFileSync(destination, JSON.stringify(report, null, 2));
    console.log(`${report.filter((item) => item.passed).length}/${report.length} cenários passaram. Relatório: ${destination}`);
    if (report.some((item) => !item.passed)) process.exitCode = 1;
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
