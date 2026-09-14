from pathlib import Path

# Guided: creation-only caps constrain only creation/base dots, not later XP.
p = Path('app.js')
text = p.read_text(encoding='utf-8')
old = '''      let cap = null;
      if (caps.has(key)) cap = caps.get(key);
      if (forbidden.has(key)) cap = Math.min(cap ?? Infinity, 0);
      if (creationCaps.has(key)) cap = Math.min(cap ?? Infinity, creationCaps.get(key));
      if (group === "disciplines" && disciplineCap != null) cap = Math.min(cap ?? Infinity, disciplineCap);
      const memoryKey = `rating::${key}`;
      if (cap != null && Number.isFinite(cap)) {
        const total = Number(row.base || 0) + Number(row.xp || 0);
        if (total > cap && !state.effectMemory[memoryKey]) state.effectMemory[memoryKey] = clone(row);
        if (total > cap) {
          row.base = Math.min(Number(row.base || 0), cap);
          row.xp = Math.max(0, Math.min(Number(row.xp || 0), cap - Number(row.base || 0)));
        }
      } else if (state.effectMemory[memoryKey]) {
        state.ratings[group][trait] = clone(state.effectMemory[memoryKey]);
        delete state.effectMemory[memoryKey];
      }
'''
new = '''      let permanentCap = null;
      if (caps.has(key)) permanentCap = caps.get(key);
      if (forbidden.has(key)) permanentCap = Math.min(permanentCap ?? Infinity, 0);
      if (group === "disciplines" && disciplineCap != null) permanentCap = Math.min(permanentCap ?? Infinity, disciplineCap);
      const creationCap = creationCaps.has(key) ? creationCaps.get(key) : null;
      const memoryKey = `rating::${key}`;
      const total = Number(row.base || 0) + Number(row.xp || 0);
      const permanentExceeded = permanentCap != null && Number.isFinite(permanentCap) && total > permanentCap;
      const creationExceeded = creationCap != null && Number(row.base || 0) > creationCap;
      if ((permanentExceeded || creationExceeded) && !state.effectMemory[memoryKey]) state.effectMemory[memoryKey] = clone(row);
      if (permanentExceeded) {
        row.base = Math.min(Number(row.base || 0), permanentCap);
        row.xp = Math.max(0, Math.min(Number(row.xp || 0), permanentCap - Number(row.base || 0)));
      }
      if (creationExceeded) row.base = Math.min(Number(row.base || 0), creationCap);
      if (!permanentExceeded && !creationExceeded && permanentCap == null && creationCap == null && state.effectMemory[memoryKey]) {
        state.ratings[group][trait] = clone(state.effectMemory[memoryKey]);
        delete state.effectMemory[memoryKey];
      }
'''
if new not in text:
    if old not in text: raise SystemExit('guided cap block missing')
    text = text.replace(old, new, 1)
p.write_text(text, encoding='utf-8')

# Advanced: re-run effects whenever affected ratings change, and treat creation-only caps
# as caps on the creation rating (current value minus XP-purchased dots).
p = Path('legacy.html')
text = p.read_text(encoding='utf-8')
old_dep = '},[e.merits,e.flaws]);let k=e.creationMode===`freeform`'
new_dep = '},[e.merits,e.flaws,e.attributes,e.disciplines,e.backgrounds,e.willpower,e.xpPurchases]);let k=e.creationMode===`freeform`'
if new_dep not in text:
    if old_dep not in text: raise SystemExit('advanced effect dependency block missing')
    text = text.replace(old_dep, new_dep, 1)

old_effect = '''effects.forEach(e=>{(e.type===`traitCap`||e.type===`creationTraitCap`)&&tighten(caps,`${e.group}::${e.trait}`,e.cap),e.type===`disciplineCap`&&(dcap=dcap==null?Number(e.cap):Math.min(dcap,Number(e.cap))),e.type===`forbidTraits`&&(e.traits||[]).forEach(t=>tighten(forbid,`${e.group}::${t}`,0)),e.type===`specialCap`&&e.special===`willpower`&&(wpcap=wpcap==null?Number(e.cap):Math.min(wpcap,Number(e.cap)))});let apply=(bucket,obj,key,cap)=>{let mk=`${bucket}:${key}`;if(cap!=null){if(Number(obj[key]||0)>cap&&!(mk in mem))mem[mk]=Number(obj[key]||0);if(Number(obj[key]||0)>cap)obj[key]=cap,changed=!0}else if(mk in mem)obj[key]=Number(mem[mk]),delete mem[mk],changed=!0};[`Strength`,`Dexterity`,`Stamina`,`Charisma`,`Manipulation`,`Appearance`].forEach(k=>{let group=[`Strength`,`Dexterity`,`Stamina`].includes(k)?`attribute:Physical`:`attribute:Social`,cap=caps.get(`${group}::${k}`);apply(`attr`,attrs,k,cap)});Object.keys(discs).forEach(k=>{let cap=dcap;forbid.has(`disciplines::${k}`)&&(cap=Math.min(cap??Infinity,0));apply(`disc`,discs,k,cap!=null&&Number.isFinite(cap)?cap:null)});Object.keys(bgs).forEach(k=>{let cap=caps.get(`backgrounds::${k}`);apply(`bg`,bgs,k,cap)});'''
new_effect = '''let creationCaps=new Map;effects.forEach(e=>{e.type===`traitCap`&&tighten(caps,`${e.group}::${e.trait}`,e.cap),e.type===`creationTraitCap`&&tighten(creationCaps,`${e.group}::${e.trait}`,e.cap),e.type===`disciplineCap`&&(dcap=dcap==null?Number(e.cap):Math.min(dcap,Number(e.cap))),e.type===`forbidTraits`&&(e.traits||[]).forEach(t=>tighten(forbid,`${e.group}::${t}`,0)),e.type===`specialCap`&&e.special===`willpower`&&(wpcap=wpcap==null?Number(e.cap):Math.min(wpcap,Number(e.cap)))});let bought=(category,key)=>s.xpPurchases.filter(x=>x.category===category&&x.key===key).reduce((n,x)=>n+Math.max(0,Number(x.to)-Number(x.from)),0),apply=(bucket,obj,key,cap,creationCap=null,xpDots=0)=>{let mk=`${bucket}:${key}`,value=Number(obj[key]||0),base=Math.max(0,value-xpDots),exceeded=cap!=null&&value>cap,creationExceeded=creationCap!=null&&base>creationCap;if((exceeded||creationExceeded)&&!(mk in mem))mem[mk]=value;if(exceeded)value=cap,changed=!0;if(creationExceeded)value=Math.min(value,creationCap+xpDots),changed=!0;obj[key]=value;if(cap==null&&creationCap==null&&mk in mem)obj[key]=Number(mem[mk]),delete mem[mk],changed=!0};[`Strength`,`Dexterity`,`Stamina`,`Charisma`,`Manipulation`,`Appearance`].forEach(k=>{let group=[`Strength`,`Dexterity`,`Stamina`].includes(k)?`attribute:Physical`:`attribute:Social`,cap=caps.get(`${group}::${k}`),cc=creationCaps.get(`${group}::${k}`);apply(`attr`,attrs,k,cap,cc,bought(`attribute`,k))});Object.keys(discs).forEach(k=>{let cap=dcap;forbid.has(`disciplines::${k}`)&&(cap=Math.min(cap??Infinity,0));apply(`disc`,discs,k,cap!=null&&Number.isFinite(cap)?cap:null,null,bought(`discipline`,k))});Object.keys(bgs).forEach(k=>{let cap=caps.get(`backgrounds::${k}`),cc=creationCaps.get(`backgrounds::${k}`);apply(`bg`,bgs,k,cap,cc,bought(`background`,k))});'''
if new_effect not in text:
    if old_effect not in text: raise SystemExit('advanced cap effect block missing')
    text = text.replace(old_effect, new_effect, 1)
p.write_text(text, encoding='utf-8')
