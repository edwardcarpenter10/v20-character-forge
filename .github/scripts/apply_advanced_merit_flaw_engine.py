from pathlib import Path

p = Path('legacy.html')
text = p.read_text(encoding='utf-8')

def replace_once(old, new, label):
    global text
    if new in text:
        print('already', label)
        return
    if old not in text:
        raise SystemExit(f'missing {label}: {old[:120]}')
    text = text.replace(old, new, 1)
    print('patched', label)

replace_once(
    'merits:[],flaws:[],notes:``,equipment:',
    'merits:[],flaws:[],effectMemory:{},notes:``,equipment:',
    'advanced effect memory default'
)

replace_once(
    'merits:Array.isArray(e.merits)?e.merits:[],flaws:Array.isArray(e.flaws)?e.flaws:[],xpPurchases:',
    'merits:Array.isArray(e.merits)?e.merits:[],flaws:Array.isArray(e.flaws)?e.flaws:[],effectMemory:{...t.effectMemory,...e.effectMemory??{}},xpPurchases:',
    'advanced effect memory normalize'
)

# Insert shared Merit/Flaw rule derivation after the existing virtue-derived effect.
needle = 'let k=e.creationMode===`freeform`,ye=ee[e.identity.clan],be='
insert = '''let mfr=[...e.merits.map(t=>({...t,kind:`merit`,rule:V20.resolveMeritFlawRule?.(t.name,`merit`)})),...e.flaws.map(t=>({...t,kind:`flaw`,rule:V20.resolveMeritFlawRule?.(t.name,`flaw`)}))],mfe=mfr.flatMap(t=>(t.rule?.effects||[]).map(e=>({...e,entry:t}))),forcedGeneration=mfe.find(t=>t.type===`identitySet`&&t.key===`generation`)?.value||null,additionalInClan=mfe.filter(t=>t.type===`additionalInClanDiscipline`).map(t=>V20.meritFlawDetail?.(t.entry.name)).filter(t=>V20.disciplines.includes(t));(0,f.useEffect)(()=>{t(s=>{let entries=[...s.merits.map(e=>({...e,kind:`merit`,rule:V20.resolveMeritFlawRule?.(e.name,`merit`)})),...s.flaws.map(e=>({...e,kind:`flaw`,rule:V20.resolveMeritFlawRule?.(e.name,`flaw`)}))],effects=entries.flatMap(e=>(e.rule?.effects||[]).map(t=>({...t,entry:e}))),mem={...(s.effectMemory||{})},attrs={...s.attributes},discs={...s.disciplines},bgs={...s.backgrounds},will=s.willpower,changed=!1,caps=new Map,dcap=null,forbid=new Map,wpcap=null;let tighten=(m,k,c)=>m.set(k,m.has(k)?Math.min(m.get(k),Number(c)):Number(c));effects.forEach(e=>{(e.type===`traitCap`||e.type===`creationTraitCap`)&&tighten(caps,`${e.group}::${e.trait}`,e.cap),e.type===`disciplineCap`&&(dcap=dcap==null?Number(e.cap):Math.min(dcap,Number(e.cap))),e.type===`forbidTraits`&&(e.traits||[]).forEach(t=>tighten(forbid,`${e.group}::${t}`,0)),e.type===`specialCap`&&e.special===`willpower`&&(wpcap=wpcap==null?Number(e.cap):Math.min(wpcap,Number(e.cap)))});let apply=(bucket,obj,key,cap)=>{let mk=`${bucket}:${key}`;if(cap!=null){if(Number(obj[key]||0)>cap&&!(mk in mem))mem[mk]=Number(obj[key]||0);if(Number(obj[key]||0)>cap)obj[key]=cap,changed=!0}else if(mk in mem)obj[key]=Number(mem[mk]),delete mem[mk],changed=!0};[`Strength`,`Dexterity`,`Stamina`,`Charisma`,`Manipulation`,`Appearance`].forEach(k=>{let group=[`Strength`,`Dexterity`,`Stamina`].includes(k)?`attribute:Physical`:`attribute:Social`,cap=caps.get(`${group}::${k}`);apply(`attr`,attrs,k,cap)});Object.keys(discs).forEach(k=>{let cap=dcap;forbid.has(`disciplines::${k}`)&&(cap=Math.min(cap??Infinity,0));apply(`disc`,discs,k,cap!=null&&Number.isFinite(cap)?cap:null)});Object.keys(bgs).forEach(k=>{let cap=caps.get(`backgrounds::${k}`);apply(`bg`,bgs,k,cap)});let wpk=`special:willpower`;if(wpcap!=null){if(Number(will||0)>wpcap&&!(wpk in mem))mem[wpk]=Number(will||0);if(Number(will||0)>wpcap)will=wpcap,changed=!0}else if(wpk in mem)will=Number(mem[wpk]),delete mem[wpk],changed=!0;let next={...s,attributes:attrs,disciplines:discs,backgrounds:bgs,willpower:will,effectMemory:mem};return changed||JSON.stringify(mem)!==JSON.stringify(s.effectMemory||{})?next:s})},[e.merits,e.flaws]);let k=e.creationMode===`freeform`,ye=ee[e.identity.clan],be='''
if insert not in text:
    if needle not in text:
        raise SystemExit('missing advanced derivation insertion point')
    text = text.replace(needle, insert, 1)
    print('patched advanced effect sync and derived rules')

replace_once(
    'Se=(0,f.useMemo)(()=>k?e.identity.customGeneration||`13th+`:[`13th+`,`12th`,`11th`,`10th`,`9th`,`8th`][T(e.backgrounds.Generation??0,0,5)],[e.backgrounds.Generation,e.identity.customGeneration,k]),',
    'Se=(0,f.useMemo)(()=>forcedGeneration||(k?e.identity.customGeneration||`13th+`:[`13th+`,`12th`,`11th`,`10th`,`9th`,`8th`][T(e.backgrounds.Generation??0,0,5)]),[e.backgrounds.Generation,e.identity.customGeneration,k,forcedGeneration]),',
    'advanced forced generation'
)

replace_once(
    'Te=(0,f.useMemo)(()=>new Set(ye?.disciplines??[]),[ye]),',
    'Te=(0,f.useMemo)(()=>new Set([...(ye?.disciplines??[]),...additionalInClan]),[ye,additionalInClan.join(`|`)]),',
    'advanced additional discipline in-clan set'
)

replace_once(
    'Ze=(e,n,r)=>t(t=>({...t,[e]:t[e].map(e=>e.id===n?{...e,...r}:e)})),',
    'Ze=(e,n,r)=>t(t=>{let k=e===`merits`?`merit`:`flaw`,rule=r.name!==void 0?V20.resolveMeritFlawRule?.(r.name,k):null,patch=rule?.cost!=null?{...r,points:Number(rule.cost)}:r;return{...t,[e]:t[e].map(e=>e.id===n?{...e,...patch}:e)}}),',
    'advanced canonical point costs'
)

# Add Merit/Flaw rule conflicts and prerequisites to creation review immediately before the existing out-of-clan check.
old = 'let r=g.filter(t=>e.disciplines[t]>0&&ye&&!Te.has(t));return r.length'
new = '''mfr.forEach(x=>{let q=x.rule;if(!q)return;(q.conflicts||[]).forEach(c=>{c.type===`clan`&&(c.values||[]).includes(e.identity.clan)&&t.push(c.message),c.type===`virtueEthics`&&e.ethicsVirtue===c.value&&t.push(c.message)}),(q.requirements||[]).forEach(req=>{if(req.type===`merit`&&!mfr.some(z=>z.kind===`merit`&&V20.normalizeMeritFlawName(z.rule?.name||z.name)===V20.normalizeMeritFlawName(req.name)))t.push(req.message);if(req.type===`humanityMin`&&(!String(e.moralityName||`Humanity`).toLowerCase().includes(`humanity`)||e.morality<Number(req.value)))t.push(req.message)}),(q.recommendations||[]).forEach(rec=>{mfr.some(z=>z.kind===rec.kind&&V20.normalizeMeritFlawName(z.rule?.name||z.name)===V20.normalizeMeritFlawName(rec.name))||n.push(rec.message)}),(q.effects||[]).some(z=>z.type===`additionalInClanDiscipline`)&&(!V20.meritFlawDetail(x.name)||!V20.disciplines.includes(V20.meritFlawDetail(x.name)))&&n.push(`Additional Discipline needs a Discipline name after a colon, for example “Additional Discipline: Protean”.`)});let r=g.filter(t=>e.disciplines[t]>0&&ye&&!Te.has(t));return r.length'''
replace_once(old, new, 'advanced merit flaw validation')

# Ensure memo dependencies include the rule-derived arrays to avoid stale validation.
replace_once(
    '[e,k,j,we,Be,Ne,Pe,Fe,Ie,Le,Re,ze,je,Me,ye,Te]),Ve=',
    '[e,k,j,we,Be,Ne,Pe,Fe,Ie,Le,Re,ze,je,Me,ye,Te,mfr]),Ve=',
    'advanced validation dependencies'
)

p.write_text(text, encoding='utf-8')
