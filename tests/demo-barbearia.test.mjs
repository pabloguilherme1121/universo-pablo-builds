import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { whatsappUrl, validBusinessPhone, services } from "../demo-barbearia/demo.js";
test("três serviços com IDs e preços válidos", () => {
  assert.equal(services.length,3);
  assert.equal(new Set(services.map(x=>x.id)).size,3);
  assert.ok(services.every(x=>x.price>0));
});
test("WhatsApp com mensagem para serviço escolhido", () => {
  const u = new URL(whatsappUrl("combo"));
  assert.equal(u.hostname,"wa.me");
  assert.equal(u.pathname,"/");
  assert.match(u.searchParams.get("text"),/corte \+ barba/);
});
test("número Brasil é opcional e validado", () => {
  assert.equal(validBusinessPhone("+55 (61) 99999-8888"),"5561999998888");
  assert.equal(validBusinessPhone("abc"),null);
  assert.equal(new URL(whatsappUrl("barba","5511998765432")).pathname,"/5511998765432");
  assert.equal(new URL(whatsappUrl("barba","bad")).pathname,"/");
});
test("serviço desconhecido é rejeitado", () => assert.throws(()=>whatsappUrl("x"),/Serviço inválido/));
test("página é claramente identificada como demo responsiva", async () => {
  const page = await readFile(new URL("../demo-barbearia/index.html",import.meta.url),"utf8");
  assert.match(page,/lang="pt-BR"/);
  assert.match(page,/preços e serviços fictícios/);
  assert.match(page,/width=device-width/);
  assert.equal((page.match(/name="servico"/g)||[]).length,3);
});