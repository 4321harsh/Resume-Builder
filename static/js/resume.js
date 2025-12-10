// resume.js
// Handles dynamic add/remove rows, preview population, PDF generation & upload to server

// helper
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* Dynamic row handling */
function addRow(tableId, template=null){
  const tbody = document.querySelector(`#${tableId} tbody`);
  const row = document.createElement('tr');
  row.innerHTML = template || `
    <td><input class="tbl-in"></td>
    <td><input class="tbl-in"></td>
    <td><input class="tbl-in"></td>
    <td><input class="tbl-in"></td>
    <td><button class="btn tiny remove-row">-</button></td>
  `;
  tbody.appendChild(row);
}
document.getElementById('add-acad').onclick = ()=> addRow('acad-table');
document.getElementById('add-skill').onclick = ()=> {
  const tbody = document.querySelector('#skills-table tbody');
  const row = document.createElement('tr');
  row.innerHTML = `<td><input class="tbl-in"></td><td><input class="tbl-in"></td><td><input class="tbl-in"></td><td><button class="btn tiny remove-row">-</button></td>`;
  tbody.appendChild(row);
};

document.addEventListener('click', (e)=>{
  if(e.target.classList.contains('remove-row')){
    const tr = e.target.closest('tr'); if(tr) tr.remove();
  }
  if(e.target.classList.contains('remove-block')){
    const block = e.target.closest('.project-block') || e.target.closest('.train-block');
    if(block) block.remove();
  }
});

/* Projects/Training add */
document.getElementById('add-project').onclick = ()=>{
  const wrap = document.getElementById('projects-wrap');
  const div = document.createElement('div');
  div.className = 'project-block';
  div.innerHTML = `
    <input class="proj-title" placeholder="Title of Project" />
    <input class="proj-role" placeholder="Your role" />
    <input class="proj-team" placeholder="Team Size" />
    <textarea class="proj-desc" placeholder="Brief about project"></textarea>
    <button class="btn tiny remove-block">Remove</button>
  `;
  wrap.appendChild(div);
};
document.getElementById('add-train').onclick = ()=>{
  const wrap = document.getElementById('train-wrap');
  const div = document.createElement('div');
  div.className = 'train-block';
  div.innerHTML = `
    <input class="train-title" placeholder="Title of Training/Internship" />
    <input class="train-duration" placeholder="Duration" />
    <input class="train-org" placeholder="Organization" />
    <button class="btn tiny remove-block">Remove</button>
  `;
  wrap.appendChild(div);
};

/* Bullet lists (Enter to add) */
function setupInputToList(inputId, listId){
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && input.value.trim()){
      const li = document.createElement('li');
      li.textContent = input.value.trim();
      list.appendChild(li);
      input.value = '';
    }
  });
}
setupInputToList('ec-input','ec-list');
setupInputToList('sw-input','sw-list');
setupInputToList('hobby-input','hobby-list');
setupInputToList('strength-input','strength-list');

/* Image preview */
const profileImage = document.getElementById('profile-image');
const imagePreview = document.getElementById('image-preview');
let imageDataUrl = null;
profileImage.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    imageDataUrl = reader.result;
    imagePreview.innerHTML = `<img src="${imageDataUrl}" alt="profile" />`;
  };
  reader.readAsDataURL(f);
});

/* Populate preview layout */
function populatePreview(){
  document.getElementById('pv-name').textContent = document.getElementById('name').value || '';
  document.getElementById('pv-email').textContent = document.getElementById('email').value || '';
  document.getElementById('pv-contact').textContent = document.getElementById('contact').value || '';
  document.getElementById('pv-objective').textContent = document.getElementById('objective').value || '';

  // academic
  const acadT = document.getElementById('pv-acad');
  acadT.innerHTML = '';
  $$('#acad-table tbody tr').forEach(tr=>{
    const cells = Array.from(tr.querySelectorAll('input')).map(i=>i.value);
    if(cells.some(c=>c.trim())) {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${cells[0]||''}</td><td>${cells[1]||''}</td><td>${cells[2]||''}</td><td>${cells[3]||''}</td>`;
      acadT.appendChild(row);
    }
  });

  // skills
  const skillsT = document.getElementById('pv-skills');
  skillsT.innerHTML = '';
  $$('#skills-table tbody tr').forEach(tr=>{
    const cells = Array.from(tr.querySelectorAll('input')).map(i=>i.value);
    if(cells.some(c=>c.trim())){
      const row = document.createElement('tr');
      row.innerHTML = `<td>${cells[0]||''}</td><td>${cells[1]||''}</td><td>${cells[2]||''}</td>`;
      skillsT.appendChild(row);
    }
  });

  // projects
  const pvProjects = document.getElementById('pv-projects');
  pvProjects.innerHTML = '';
  $$('#projects-wrap .project-block').forEach(b=>{
    const t = b.querySelector('.proj-title').value;
    const r = b.querySelector('.proj-role').value;
    const s = b.querySelector('.proj-team').value;
    const d = b.querySelector('.proj-desc').value;
    if([t,r,s,d].some(Boolean)){
      const div = document.createElement('div');
      div.innerHTML = `<strong>${t}</strong> — ${r} (Team: ${s})<p>${d}</p>`;
      pvProjects.appendChild(div);
    }
  });

  // training
  const pvTrains = document.getElementById('pv-trains'); pvTrains.innerHTML='';
  $$('#train-wrap .train-block').forEach(b=>{
    const t=b.querySelector('.train-title').value;
    const du=b.querySelector('.train-duration').value;
    const org=b.querySelector('.train-org').value;
    if(t||du||org){
      const div=document.createElement('div');
      div.innerHTML = `<strong>${t}</strong> — ${du} <em>${org}</em>`;
      pvTrains.appendChild(div);
    }
  });

  // lists
  function copyList(srcId, destId){
    const dest = document.getElementById(destId); dest.innerHTML='';
    document.querySelectorAll(`#${srcId} li`).forEach(li=>{
      const item = document.createElement('li'); item.textContent = li.textContent; dest.appendChild(item);
    });
  }
  copyList('ec-list','pv-ec'); copyList('sw-list','pv-sw'); copyList('hobby-list','pv-hobbies'); copyList('strength-list','pv-strength');

  // personal details
  document.getElementById('pv-dob').textContent = document.getElementById('dob').value || '';
  document.getElementById('pv-gender').textContent = document.getElementById('gender').value || '';
  document.getElementById('pv-father').textContent = document.getElementById('father').value || '';
  document.getElementById('pv-mother').textContent = document.getElementById('mother').value || '';
  document.getElementById('pv-nation').textContent = document.getElementById('nationality').value || '';
  document.getElementById('pv-marital').textContent = document.getElementById('marital').value || '';
  document.getElementById('pv-address').textContent = document.getElementById('address').value || '';
  document.getElementById('pv-decl').textContent = document.getElementById('declaration').value || '';
  document.getElementById('pv-place').textContent = document.getElementById('place').value || '';
  document.getElementById('pv-date').textContent = document.getElementById('sig-date').value || '';

  // image
  const pvImage = document.getElementById('pv-image');
  pvImage.innerHTML = imageDataUrl ? `<img src="${imageDataUrl}" style="width:100%;height:100%;object-fit:cover"/>` : '';
}

/* Preview button shows the generated resume area */
document.getElementById('preview-btn').onclick = ()=>{
  populatePreview();
  const pv = document.getElementById('resume-preview');
  pv.classList.remove('hidden');
  pv.scrollIntoView({behavior:'smooth'});
};

/* PDF generation using html2canvas + jsPDF */
async function generatePDFBlob() {
  populatePreview();

  const pv = document.getElementById('resume-preview');
  pv.style.display = 'block';

  // Apply internal padding for PDF rendering
  pv.style.padding = "40px";   // A4 margins approx 20mm

  const canvas = await html2canvas(pv, { 
      scale: 2, 
      useCORS: true 
  });

  const imgData = canvas.toDataURL('image/png');

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'pt', 'a4');

  const pdfWidth  = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth  = canvas.width;
  const imgHeight = canvas.height;

  const scaleFactor = pdfWidth / imgWidth;
  const newHeight   = imgHeight * scaleFactor;

  let heightLeft = newHeight;
  let position = 0;

  // FIRST PAGE WITH TOP MARGIN
  pdf.addImage(
      imgData,
      'PNG',
      0,
      position,
      pdfWidth,
      newHeight
  );

  heightLeft -= pdfHeight;

  // ADDITIONAL PAGES WITH MARGINS
  while (heightLeft > -40) {
      position = heightLeft - newHeight;
      pdf.addPage();
      pdf.addImage(
          imgData,
          'PNG',
          0,
          position,
          pdfWidth,
          newHeight
      );
      heightLeft -= pdfHeight;
  }

  const blob = pdf.output('blob');
  return { pdf, blob };
}

document.getElementById('download-btn').onclick = async ()=>{
  const {pdf} = await generatePDFBlob();
  const name = (document.getElementById('name').value || 'resume').replace(/\s+/g,'_') + '.pdf';
  pdf.save(name);
};

document.getElementById('share-btn').onclick = async ()=>{
  try {
    const {blob} = await generatePDFBlob();
    const file = new File([blob], (document.getElementById('name').value||'resume')+'.pdf', {type:'application/pdf'});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({files:[file], title: 'My Resume'});
    } else {
      // fallback: download
      const url = URL.createObjectURL(file);
      const a = document.createElement('a'); a.href=url; a.download = file.name; a.click();
      URL.revokeObjectURL(url);
    }
  } catch (e){
    alert('Share not supported; downloading instead.');
    document.getElementById('download-btn').click();
  }
};

/* Save to server: generate PDF, convert to base64 and POST to /save_resume */
document.getElementById('save-btn').onclick = async ()=>{
  const {pdf} = await generatePDFBlob();
  const name = (document.getElementById('name').value || 'resume').replace(/\s+/g,'_') + '.pdf';
  const dataUrl = pdf.output('datauristring'); // data:application/pdf;base64,...
  const res = await fetch('/save_resume', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({filename: name, pdf_base64: dataUrl})
  });
  const j = await res.json();
  if(j.ok) alert('Saved to dashboard.');
  else alert('Save failed.');
};

// initial small UI tweaks
document.addEventListener('DOMContentLoaded', ()=>{
  // set remove buttons for default rows
  document.querySelectorAll('.remove-row').forEach(b=>b.onclick=(e)=>e.target.closest('tr').remove());
});
