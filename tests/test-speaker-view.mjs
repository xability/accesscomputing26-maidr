import assert from 'node:assert/strict';
import {mkdtemp,cp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import http from 'node:http';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=await mkdtemp(path.join(tmpdir(),'jy-speaker-test-'));
const results=[];
let browser,server;
function check(condition,label){assert.ok(condition,label);results.push(label);}
try{
  await cp(path.join(root,'_extensions'),path.join(temp,'_extensions'),{recursive:true});
  const fixture='---\nformat:\n  revealjs:\n    controls: true\nfilters: [jy-a11y]\nrevealjs-plugins: [jy-a11y]\n---\n\n## First\n\nFirst slide.\n\n::: {.notes}\nFirst speaker note.\n:::\n\n## Second\n\nSecond slide.\n\n::: {.notes}\nSecond speaker note.\n:::\n\n## Third\n\nThird slide.\n';
  await writeFile(path.join(temp,'fixture.qmd'),fixture);
  // Render embedded first: Quarto removes shared fixture_files after embedding.
  for(const embedded of [true,false]){
    const args=['render','fixture.qmd','--quiet','--output',embedded?'embedded.html':'fixture.html'];
    if(embedded)args.push('--embed-resources');
    const r=spawnSync('quarto',args,{cwd:temp,encoding:'utf8',windowsHide:true});
    assert.equal(r.status,0,r.stdout+'\n'+r.stderr);
  }
  server=http.createServer(async(req,res)=>{try{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(temp,'.'+relative);if(!file.startsWith(temp+path.sep)){res.writeHead(403).end();return;}const bytes=await readFile(file);const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type});res.end(bytes);}catch{res.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
  for(const name of ['fixture.html','embedded.html'])for(const protocol of ['http','file']){
    const label=protocol+'/'+name;
    const context=await browser.newContext();
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const url=protocol==='http'?'http://127.0.0.1:'+server.address().port+'/'+name:pathToFileURL(path.join(temp,name)).href;
    await page.goto(url);await page.waitForFunction(()=>window.Reveal?.isReady());
    check(await page.evaluate(()=>Reveal.getConfig().overview===false),label+': Overview remains disabled');
    check(await page.evaluate(()=>Reveal.getConfig().keyboard[72]===null),label+': H disabled');
    check(await page.evaluate(()=>Object.keys(JSON.parse(document.body.getAttribute('data-at-shortcutkeys'))).sort().join(',')==='f,j,k,n,p,s'),label+': JAWS BODY declaration retained');
    check(await page.locator('.reveal > aside.controls').getAttribute('role')==='none',label+': legacy wrapper has no landmark');
    check(await page.getByRole('complementary').count()===0,label+': no complementary landmark');
    for(const [key,expected] of [['h',0],['j',1],['k',0],['n',1],['p',0]]){
      await page.keyboard.press(key);await page.waitForFunction(i=>Reveal.getIndices().h===i,expected);
      check(await page.evaluate(()=>Reveal.getIndices().h)===expected,label+': '+key+' behavior retained');
    }
    const popupPromise=page.waitForEvent('popup');await page.keyboard.press('s');const speaker=await popupPromise;
    speaker.on('pageerror',e=>errors.push(e.message));
    await speaker.getByRole('combobox',{name:'Layout',exact:true}).waitFor();
    await speaker.locator('#current-slide iframe').waitFor();
    await speaker.locator('.speaker-controls-notes:not(.hidden)').waitFor();
    const combo=speaker.getByRole('combobox',{name:'Layout',exact:true});
    for(const region of ['Current slide','Upcoming slide','Time','Speaker notes'])check(await speaker.getByRole('region',{name:region,exact:true}).count()===1,label+': '+region+' region');
    check(await speaker.locator('#current-slide iframe').getAttribute('title')==='Current slide preview',label+': current iframe title');
    check(await speaker.locator('#upcoming-slide iframe').getAttribute('title')==='Upcoming slide preview',label+': upcoming iframe title');
    await combo.focus();check(await speaker.locator('#speaker-layout').evaluate(el=>getComputedStyle(el).outlineStyle)!=='none',label+': visible Layout focus');
    await combo.press('ArrowDown');await combo.press('Enter');
    check(await page.evaluate(()=>Reveal.getIndices().h)===0,label+': native Layout keys do not advance deck');
    for(const option of await combo.locator('option').evaluateAll(items=>items.map(el=>el.value))){await combo.selectOption(option);check(await speaker.getByRole('combobox',{name:'Layout',exact:true}).count()===1,label+': stable Layout name in '+option);}
    await combo.selectOption('default');
    const frame=speaker.frameLocator('#current-slide iframe');
    await frame.locator('.reveal > aside.controls[role="none"]').waitFor();
    check(await frame.getByRole('complementary').count()===0,label+': preview controls are not landmarks');
    const next=frame.getByRole('button',{name:'next slide',exact:true});await next.focus();await next.press('Enter');
    await page.waitForFunction(()=>Reveal.getIndices().h===1);check(true,label+': preview next button Enter synchronizes deck');
    const previous=frame.getByRole('button',{name:'previous slide',exact:true});await previous.click();await page.waitForFunction(()=>Reveal.getIndices().h===0);check(true,label+': preview previous button click synchronizes deck');
    check(errors.length===0,label+': no browser errors '+errors.join('; '));
    await context.close();console.log('PASS '+label);
  }
  console.log('PASS '+results.length+' browser assertions across HTTP/file and normal/self-contained output.');
  if(process.env.JY_TEST_REPORT)await writeFile(process.env.JY_TEST_REPORT,JSON.stringify({passed:results.length,assertions:results},null,2));
}finally{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));await rm(temp,{recursive:true,force:true});}
