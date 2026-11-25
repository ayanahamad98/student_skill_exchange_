const defaultProfile = {
  name: "Aarav Sharma",
  course: "B.Tech · Computer Science",
  college: "Your University",
  year: "2nd Year",
  about: "Curious learner who enjoys building things, sharing knowledge and collaborating with other students.",
  teach: ["Python", "HTML & CSS", "Data Analysis"],
  learn: ["Graphic Design", "UI/UX Design"]
};

const students = [
  {id:1,name:"Meera Kapoor",initials:"MK",course:"B.Des · Communication Design",college:"School of Design",teach:["Graphic Design","UI/UX Design","Illustration"],learn:["Python","Data Analysis"],color:"pink"},
  {id:2,name:"Rohan Verma",initials:"RV",course:"B.Tech · Information Technology",college:"Engineering Faculty",teach:["Python","Java","Data Analysis"],learn:["Graphic Design","Video Editing"],color:"blue"},
  {id:3,name:"Sana Khan",initials:"SK",course:"B.A. · Media Studies",college:"Arts & Media",teach:["Video Editing","Photography","Storytelling"],learn:["Python","HTML & CSS"],color:"peach"},
  {id:4,name:"Kabir Malhotra",initials:"KM",course:"B.Tech · Computer Science",college:"Engineering Faculty",teach:["Java","Web Development","SQL"],learn:["UI/UX Design","Public Speaking"],color:"mint"},
  {id:5,name:"Ishita Rao",initials:"IR",course:"BBA · Business Analytics",college:"School of Business",teach:["Excel","Data Analysis","Public Speaking"],learn:["Python","Graphic Design"],color:"lavender"},
  {id:6,name:"Dev Patel",initials:"DP",course:"B.Sc. · Computer Science",college:"Science Faculty",teach:["Python","Machine Learning","SQL"],learn:["Photography","UI/UX Design"],color:"blue"},
  {id:7,name:"Ananya Bose",initials:"AB",course:"B.F.A. · Applied Arts",college:"School of Fine Arts",teach:["Graphic Design","Illustration","Photography"],learn:["Java","Data Analysis"],color:"pink"},
  {id:8,name:"Arjun Nair",initials:"AN",course:"B.Tech · Electronics",college:"Engineering Faculty",teach:["Public Speaking","Java","Presentation Skills"],learn:["Python","Video Editing"],color:"mint"}
];

let profile = loadProfile();
let connections = JSON.parse(localStorage.getItem("skillswap_connections") || "[]");

function loadProfile(){try{return {...defaultProfile,...JSON.parse(localStorage.getItem("skillswap_profile")||"{}")}}catch{return {...defaultProfile}}}
function saveLocal(){localStorage.setItem("skillswap_profile",JSON.stringify(profile));localStorage.setItem("skillswap_connections",JSON.stringify(connections))}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function initials(name){return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()||"ST"}
function matchScore(student){
  const teaches=student.teach.filter(s=>profile.learn.some(x=>x.toLowerCase()===s.toLowerCase())).length;
  const learns=student.learn.filter(s=>profile.teach.some(x=>x.toLowerCase()===s.toLowerCase())).length;
  const total=teaches+learns;
  return total===0?0:Math.min(99,Math.round((total/(Math.max(1,profile.learn.length+profile.teach.length)))*100)+48);
}
function matchReason(student){
  const a=student.teach.filter(s=>profile.learn.some(x=>x.toLowerCase()===s.toLowerCase()));
  const b=student.learn.filter(s=>profile.teach.some(x=>x.toLowerCase()===s.toLowerCase()));
  return {theyTeach:a,theyLearn:b};
}
function avatarHTML(person,extra=""){return `<div class="avatar avatar-${person.color||"purple"} ${extra}">${escapeHTML(person.initials||initials(person.name))}</div>`}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2400)}
function go(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
  document.getElementById(page+"Page").classList.add("active-page");
  document.querySelectorAll(".nav-link").forEach(n=>n.classList.toggle("active",n.dataset.page===page));
  document.getElementById("crumb").textContent=({overview:"Overview",discover:"Discover students",connections:"My connections",profile:"My profile"})[page];
  document.getElementById("sidebar").classList.remove("open");
  if(page==="discover")renderDiscover();if(page==="connections")renderConnections();if(page==="profile")fillProfileForm();
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
document.getElementById("mobileMenu").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));

function renderStats(){
  document.getElementById("sideName").textContent=profile.name;
  document.getElementById("welcomeName").textContent=profile.name.split(" ")[0];
  document.getElementById("statConnections").textContent=connections.length;
  document.getElementById("statTeaching").textContent=profile.teach.length;
  document.getElementById("statLearning").textContent=profile.learn.length;
  document.getElementById("statMatches").textContent=students.filter(s=>matchScore(s)>0).length;
  document.getElementById("connectionCount").textContent=connections.length;
  document.getElementById("discoverCount").textContent=students.length;
  const pct=Math.min(100,35+(profile.teach.length?20:0)+(profile.learn.length?20:0)+(profile.about?15:0)+(profile.college?10:0));
  document.getElementById("profilePercent").textContent=pct+"%";
  document.getElementById("progressBar").style.width=pct+"%";
}
function personRow(s){
  const score=matchScore(s), reason=matchReason(s);
  const detail=reason.theyTeach.length||reason.theyLearn.length?`${reason.theyTeach.length+reason.theyLearn.length} skill exchange overlap${reason.theyTeach.length+reason.theyLearn.length>1?"s":""}`:"Suggested student";
  return `<div class="person-row">${avatarHTML(s)}<div class="person-info"><b>${escapeHTML(s.name)}</b><small>${escapeHTML(s.course)}</small></div><span class="person-match">${score?score+"% match":"Explore"}</span><button class="tiny-connect" data-connect="${s.id}">${connections.includes(s.id)?"Connected":"Connect"}</button></div>`;
}
function renderRecommended(){
  const list=[...students].sort((a,b)=>matchScore(b)-matchScore(a)).slice(0,3);
  document.getElementById("recommendedList").innerHTML=list.map(personRow).join("");
  bindConnectButtons();
}
function studentCard(s){
  const score=matchScore(s), reason=matchReason(s), connected=connections.includes(s.id);
  const theyTeach=reason.theyTeach.length?reason.theyTeach.join(", "):s.teach.slice(0,2).join(", ");
  const theyLearn=reason.theyLearn.length?reason.theyLearn.join(", "):s.learn.slice(0,2).join(", ");
  return `<article class="student-card"><div class="student-card-top">${avatarHTML(s)}<div class="person-info"><h3>${escapeHTML(s.name)}</h3><div class="course">${escapeHTML(s.course)}</div></div><span class="match-label">${score?score+"% match":"New"}</span></div><div class="exchange-box"><div class="exchange-line"><span>CAN TEACH YOU</span><b>${escapeHTML(theyTeach)}</b></div><div class="exchange-arrow">↕</div><div class="exchange-line"><span>WANTS TO LEARN</span><b>${escapeHTML(theyLearn)}</b></div></div><div class="card-footer"><span class="mutual-text">${escapeHTML(s.college)}</span><button class="connect-button ${connected?"connected":""}" data-connect="${s.id}">${connected?"✓ Connected":"＋ Connect"}</button></div></article>`;
}
function renderDiscover(){
  const q=document.getElementById("searchInput").value.toLowerCase().trim(), skill=document.getElementById("skillFilter").value.toLowerCase(), sort=document.getElementById("sortFilter").value;
  let filtered=students.filter(s=>(!q||[s.name,s.course,...s.teach,...s.learn].join(" ").toLowerCase().includes(q))&&(!skill||[...s.teach,...s.learn].some(x=>x.toLowerCase()===skill)));
  filtered.sort(sort==="name"?(a,b)=>a.name.localeCompare(b.name):(a,b)=>matchScore(b)-matchScore(a));
  document.getElementById("resultCount").textContent=`${filtered.length} student${filtered.length===1?"":"s"}`;
  document.getElementById("discoverGrid").innerHTML=filtered.length?filtered.map(studentCard).join(""):`<div class="empty-state"><div style="font-size:28px">⌕</div><strong>No students found</strong>Try another name or skill filter.</div>`;
  bindConnectButtons();
}
function bindConnectButtons(){
  document.querySelectorAll("[data-connect]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=Number(btn.dataset.connect);
    if(connections.includes(id)){toast("You're already connected with this student.");return}
    connections.push(id);saveLocal();renderStats();renderRecommended();renderDiscover();renderConnections();toast("Connection added! Start planning your skill exchange.");
  }));
}
function renderConnections(){
  const connected=students.filter(s=>connections.includes(s.id));
  document.getElementById("connectionsList").innerHTML=connected.length?connected.map(s=>`<div class="connection-row">${avatarHTML(s)}<div class="person-info"><b>${escapeHTML(s.name)}</b><div class="exchange-note">${escapeHTML(s.course)} · ${escapeHTML(s.teach.slice(0,2).join(", "))}</div></div><span class="person-match">Connected</span><button class="message-button" data-message="${s.id}">Plan exchange</button></div>`).join(""):`<div class="empty-state"><div style="font-size:30px">♧</div><strong>Your learning circle starts here</strong>You haven't connected with anyone yet. Discover students and find a skill exchange partner.<br><br><button class="primary-button" data-go="discover">Discover students →</button></div>`;
  document.querySelectorAll("[data-message]").forEach(b=>b.addEventListener("click",()=>{const s=students.find(x=>x.id===Number(b.dataset.message));toast(`Plan a ${profile.teach[0]||"skill"} ↔ ${s.teach[0]||"skill"} exchange with ${s.name}!`)}));
  document.querySelectorAll("#connectionsList [data-go]").forEach(b=>b.addEventListener("click",()=>go("discover")));
}
function tagsHTML(arr,editable=false,type=""){
  return arr.map((x,i)=>`<span class="skill-tag">${escapeHTML(x)}${editable?`<button type="button" data-remove="${type}:${i}" aria-label="Remove ${escapeHTML(x)}">×</button>`:""}</span>`).join("");
}
function fillProfileForm(){
  document.getElementById("nameInput").value=profile.name;document.getElementById("courseInput").value=profile.course;document.getElementById("collegeInput").value=profile.college;document.getElementById("yearInput").value=profile.year;document.getElementById("aboutInput").value=profile.about;
  renderProfileTags();updatePreview();
}
function renderProfileTags(){
  document.getElementById("teachTags").innerHTML=tagsHTML(profile.teach,true,"teach");
  document.getElementById("learnTags").innerHTML=tagsHTML(profile.learn,true,"learn");
  document.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{const [type,index]=b.dataset.remove.split(":");profile[type].splice(Number(index),1);renderProfileTags();updatePreview()}));
}
function updatePreview(){
  const name=document.getElementById("nameInput").value||"Student Name",course=document.getElementById("courseInput").value||"Course / Department";
  document.getElementById("previewName").textContent=name;document.getElementById("previewCourse").textContent=course;document.getElementById("previewInitials").textContent=initials(name);document.getElementById("previewAbout").textContent=document.getElementById("aboutInput").value||"Add a short introduction to help others get to know you.";
  document.getElementById("previewTeach").innerHTML=tagsHTML(profile.teach);document.getElementById("previewLearn").innerHTML=tagsHTML(profile.learn);
}
function addSkill(type){
  const input=document.getElementById(type+"Input"),value=input.value.trim();
  if(!value){toast("Enter a skill name first.");return}
  if(profile[type].some(x=>x.toLowerCase()===value.toLowerCase())){toast("That skill is already on your list.");return}
  profile[type].push(value);input.value="";renderProfileTags();updatePreview();
}
document.getElementById("addTeach").addEventListener("click",()=>addSkill("teach"));
document.getElementById("addLearn").addEventListener("click",()=>addSkill("learn"));
["teachInput","learnInput"].forEach(id=>document.getElementById(id).addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addSkill(id==="teachInput"?"teach":"learn")}}));
["nameInput","courseInput","aboutInput"].forEach(id=>document.getElementById(id).addEventListener("input",updatePreview));
document.getElementById("saveProfile").addEventListener("click",()=>{
  profile.name=document.getElementById("nameInput").value.trim()||"Student";
  profile.course=document.getElementById("courseInput").value.trim();
  profile.college=document.getElementById("collegeInput").value.trim();
  profile.year=document.getElementById("yearInput").value;
  profile.about=document.getElementById("aboutInput").value.trim();
  saveLocal();renderStats();updatePreview();document.getElementById("saveMessage").textContent="Saved successfully in this browser.";toast("Your student profile has been saved!");
});
["searchInput","skillFilter","sortFilter"].forEach(id=>document.getElementById(id).addEventListener(id==="searchInput"?"input":"change",renderDiscover));

renderStats();renderRecommended();renderConnections();fillProfileForm();
