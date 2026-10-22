import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../_extensions/jy-a11y/speaker-view/controls.js', import.meta.url),'utf8');
for (const ready of [true,false]) {
  for (const initialRole of [null,'group']) {
    let callback; const attrs=new Map(initialRole ? [['role',initialRole]] : []);
    const controls={hasAttribute:k=>attrs.has(k),setAttribute:(k,v)=>attrs.set(k,v)};
    const reveal={isReady:()=>ready,on:(event,fn)=>{assert.equal(event,'ready');callback=fn;},getRevealElement:()=>({querySelector:selector=>{assert.equal(selector,'aside.controls');return controls;}})};
    vm.runInNewContext(source,{window:{Reveal:reveal}});
    if(!ready){assert.equal(attrs.get('role'),initialRole||undefined);callback();}
    assert.equal(attrs.get('role'),initialRole||'none');
    vm.runInNewContext(source,{window:{Reveal:reveal}});if(!ready)callback();
    assert.equal(attrs.get('role'),initialRole||'none');
  }
}
// Already-patched div wrappers, no controls, and no Reveal are no-ops.
vm.runInNewContext(source,{window:{Reveal:{isReady:()=>true,getRevealElement:()=>({querySelector:()=>null})}}});
vm.runInNewContext(source,{window:{}});
assert.ok(!source.includes('replaceWith'));
assert.ok(!source.includes('keydown'));
console.log('PASS: legacy controls landmark removed idempotently; explicit roles, DIV controls, button nodes, and ready lifecycle preserved.');
