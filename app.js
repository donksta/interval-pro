const $=id=>document.getElementById(id);
const defaults={prep:10,work:20,rest:10,rounds:8,sets:1,setRest:60};
let cfg={...defaults}, phase='work', remaining=20, running=false, tickId=null, phaseStartedAt=0, runStartedAt=0, elapsedBase=0, phaseDuration=20, round=1, set=1, voice=true,sounds=true;
let history=JSON.parse(localStorage.getItem('ip_history')||'[]'), saved=JSON.parse(localStorage.getItem('ip_saved')||'[]');
const circumference=2*Math.PI*132;
const fmt=s=>{s=Math.max(0,Math.ceil(s));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
const totalSecs=()=>cfg.sets*(cfg.rounds*(cfg.work+cfg.rest)-cfg.rest)+Math.max(0,cfg.sets-1)*cfg.setRest;
function updateStats(){ $('totalRounds').textContent=cfg.rounds*cfg.sets; $('totalDuration').textContent=fmt(totalSecs()+cfg.prep); $('elapsed').textContent=fmt(elapsedBase+(running?(Date.now()-runStartedAt)/1000:0));}
function updateUI(){
 $('timeDisplay').textContent=fmt(remaining); $('roundLabel').textContent=`ROUND ${round} / ${cfg.rounds} · SET ${set}/${cfg.sets}`;
 $('phaseLabel').textContent=phase==='done'?'WORKOUT COMPLETE':phase==='prep'?'GET READY':phase==='work'?'WORK INTERVAL':'RECOVERY';
 $('phasePill').textContent=phase==='prep'?'PREP':phase==='done'?'DONE':phase.toUpperCase();
 $('nextLabel').textContent=phase==='work'?`REST · ${fmt(cfg.rest)}`:phase==='rest'?'WORK · '+fmt(cfg.work):phase==='prep'?'WORK · '+fmt(cfg.work):'—';
 document.querySelector('.timer-wrap').classList.toggle('phase-rest',phase==='rest');
 document.querySelector('.timer-wrap').classList.toggle('phase-prep',phase==='prep');
 document.querySelector('.timer-wrap').classList.toggle('phase-done',phase==='done');
 $('progressRing').style.strokeDasharray=circumference;
 $('progressRing').style.strokeDashoffset=circumference*(1-(phaseDuration?remaining/phaseDuration:0));
 $('startText').textContent=running?'PAUSE':phase==='done'?'AGAIN':elapsedBase?'RESUME':'START';
 $('startIcon').textContent=running?'Ⅱ':'▶'; updateStats();
}
function speak(text){if(!voice||!('speechSynthesis'in window))return; speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text);u.rate=1.05;u.pitch=1; speechSynthesis.speak(u);}
function beep(freq=880,dur=.12){if(!sounds)return;try{let c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.08,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur);o.start();o.stop(c.currentTime+dur);o.onended=()=>c.close()}catch(e){}}
function cue(label){beep(label==='REST'?520:900,.18);if(voice)speak(label);}
function setPhase(p,d){phase=p;remaining=d;phaseDuration=d;if(running)phaseStartedAt=Date.now();updateUI();}
function start(){
 if(running){pause();return}
 if(phase==='done')reset();
 if(elapsedBase===0 && phase==='work' && remaining===cfg.work && cfg.prep>0)setPhase('prep',cfg.prep);
 running=true;
 const now=Date.now();
 phaseStartedAt=now-(phaseDuration-remaining)*1000;
 runStartedAt=now;
 $('startText').textContent='PAUSE';$('startIcon').textContent='Ⅱ';
 tickId=setInterval(tick,100);updateUI();
}
function pause(){
 if(!running)return;
 const now=Date.now();
 elapsedBase+=(now-runStartedAt)/1000;
 running=false;clearInterval(tickId);tickId=null;updateUI();
}
function tick(){
 const now=Date.now();
 const phaseSpent=(now-phaseStartedAt)/1000;
 remaining=Math.max(0,phaseDuration-phaseSpent);
 $('timeDisplay').textContent=fmt(remaining);
 $('elapsed').textContent=fmt(elapsedBase+(now-runStartedAt)/1000);
 $('progressRing').style.strokeDashoffset=circumference*(1-(phaseDuration?remaining/phaseDuration:0));
 if(remaining<=0)advance();
}
function advance(){
 if(phase==='prep'){setPhase('work',cfg.work);cue('WORK');return}
 if(phase==='work'){if(cfg.rest>0){setPhase('rest',cfg.rest);cue('REST');return}else phase='rest'}
 if(phase==='rest'){
   if(round<cfg.rounds){round++;setPhase('work',cfg.work);cue('WORK');return}
   if(set<cfg.sets){set++;round=1;if(cfg.setRest>0){setPhase('setrest',cfg.setRest);$('phaseLabel').textContent='REST BETWEEN SETS';$('phasePill').textContent='SET REST';$('nextLabel').textContent='NEXT · WORK';cue('REST');return}}
   finish();return;
 }
 if(phase==='setrest'){round=1;setPhase('work',cfg.work);cue('WORK');}
}
function finish(){pause();phase='done';remaining=0;phaseDuration=1;updateUI();beep(1100,.35);speak('Workout complete. Great work.');let duration=Math.round((elapsedBase)/60);history.unshift({date:new Date().toISOString(),rounds:cfg.rounds*cfg.sets,minutes:duration,seconds:Math.round(elapsedBase),work:cfg.work,rest:cfg.rest});history=history.slice(0,100);localStorage.setItem('ip_history',JSON.stringify(history));renderHistory();toast('Workout saved to history');}
function reset(){pause();phase='work';remaining=cfg.work;phaseDuration=cfg.work;round=1;set=1;elapsedBase=0;phaseStartedAt=0;runStartedAt=0;updateUI();}
function skip(){if(!running)return;advance();}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1800)}
function readCfg(){for(let k of Object.keys(cfg))cfg[k]=Number($(k).value);reset();updateOutputs();}
function updateOutputs(){for(let k of Object.keys(cfg)){$(k+'Out').textContent=k==='rounds'||k==='sets'?cfg[k]:cfg[k]+' sec';}updateStats();}
function fillInputs(){for(let k of Object.keys(cfg))$(k).value=cfg[k];updateOutputs();}
function renderSaved(){let box=$('savedList');box.innerHTML='';if(!saved.length){box.innerHTML='<p class="muted">Your saved workouts will appear here.</p>';return}saved.forEach((s,i)=>{let el=document.createElement('div');el.className='saved-item';el.innerHTML=`<div><strong>${escapeHtml(s.name)}</strong><small>${s.work}s work · ${s.rest}s rest · ${s.rounds} rounds · ${s.sets} sets</small></div><button data-i="${i}">LOAD</button>`;el.querySelector('button').onclick=()=>{cfg={...s.cfg};fillInputs();document.querySelectorAll('.preset').forEach(x=>x.classList.remove('selected'));toast('Workout loaded')};box.append(el)})}
function renderHistory(){let box=$('historyList');box.innerHTML='';$('sessionCount').textContent=history.length;$('totalMinutes').textContent=Math.round(history.reduce((a,h)=>a+(h.seconds||h.minutes*60),0)/60);if(!history.length){box.innerHTML='<p class="muted">Complete a workout and it will show up here.</p>';return}history.forEach(h=>{let el=document.createElement('div');el.className='history-item';let d=new Date(h.date);el.innerHTML=`<div><strong>${h.rounds} rounds · ${h.work}/${h.rest}</strong><small>${d.toLocaleDateString()} · ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div><b>${h.seconds!==undefined?fmt(h.seconds):h.minutes+' MIN'}</b>`;box.append(el)})}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('startBtn').onclick=start;$('resetBtn').onclick=reset;$('skipBtn').onclick=skip;
document.querySelectorAll('[data-screen]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(b.dataset.screen).classList.add('active')});
document.querySelectorAll('.preset').forEach(b=>b.onclick=()=>{document.querySelectorAll('.preset').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');if(b.dataset.preset==='tabata')cfg={prep:10,work:20,rest:10,rounds:8,sets:1,setRest:60};if(b.dataset.preset==='hiit')cfg={prep:10,work:30,rest:30,rounds:10,sets:1,setRest:60};fillInputs()});
Object.keys(cfg).forEach(k=>$(k).oninput=readCfg);
$('applyBtn').onclick=()=>{reset();document.querySelector('[data-screen="timerScreen"]').click();toast('Workout settings applied')};
$('savePresetBtn').onclick=()=>{let name=prompt('Name this workout:','My workout');if(!name)return;saved.push({name,cfg:{...cfg},...cfg});localStorage.setItem('ip_saved',JSON.stringify(saved));renderSaved();toast('Workout saved')};
$('settingsBtn').onclick=()=>$('settingsModal').classList.remove('hidden');$('closeSettings').onclick=()=>$('settingsModal').classList.add('hidden');
$('voiceToggle').onchange=e=>voice=e.target.checked;$('soundToggle').onchange=e=>sounds=e.target.checked;
$('clearHistory').onclick=()=>{if(confirm('Clear all workout history?')){history=[];localStorage.setItem('ip_history','[]');renderHistory()}};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){/* iOS may throttle web timers in background; elapsed time is based on wall clock */}});
fillInputs();remaining=cfg.work;phaseDuration=cfg.work;updateUI();renderSaved();renderHistory();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
