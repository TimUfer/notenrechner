// Gleiche Logik wie C++ calcGrade
function calcGrade(modules) {
  let upper = 0;
  let lower = 0;
  for (const m of modules) {
    if (m.halfWeight) {
      upper += m.grade * (m.crp / 2);
      lower += m.crp / 2;
    } else {
      upper += m.grade * m.crp;
      lower += m.crp;
    }
  }
  return lower === 0 ? 0 : upper / lower;
}

const modules = [];

function render() {
  const tbody = document.querySelector('#tableModules tbody');
  tbody.innerHTML = '';
  for (let i = 0; i < modules.length; i++) {
    const m = modules[i];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(m.name)}</td>
      <td>${m.grade.toFixed(1)}</td>
      <td>${m.crp}</td>
      <td>${m.halfWeight ? '½' : '1'}</td>
      <td class="actions-cell">
        <div class="dropdown">
          <button class="btn-dots" onclick="toggleMenu(this, ${i})">⋯</button>
          <div class="dropdown-menu" id="menu-${i}" style="display:none;">
            <button onclick="editModule(${i})">✏️ Bearbeiten</button>
            <button onclick="deleteModule(${i})">🗑️ Löschen</button>
          </div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  const avg = calcGrade(modules);
  document.getElementById('avgDisplay').textContent = avg.toFixed(2);
  document.getElementById('results').classList.remove('hidden');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.getElementById('moduleForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('modName').value.trim();
  const grade = parseFloat(document.getElementById('modGrade').value);
  const crp = parseInt(document.getElementById('modCrp').value, 10);
  const half = document.getElementById('modHalf').checked;

  if (!name || isNaN(grade) || isNaN(crp)) return;

  modules.push({ name, grade, crp, halfWeight: half });
  render();

  // Formular zurücksetzen
  document.getElementById('modName').value = '';
  document.getElementById('modGrade').value = '';
  document.getElementById('modCrp').value = '';
  document.getElementById('modHalf').checked = false;
  document.getElementById('modName').focus();
});

function downloadJSON() {
  const data = JSON.stringify(modules, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'notenrechner.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function triggerUpload() {
  document.getElementById('uploadInput').click();
}

function toggleMenu(btn, index) {
  const menu = document.getElementById('menu-' + index);
  document.querySelectorAll('.dropdown-menu').forEach(m => {
    if (m !== menu) m.style.display = 'none';
  });
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function deleteModule(index) {
  if (!confirm('Modul wirklich löschen?')) return;
  modules.splice(index, 1);
  render();
}

function editModule(index) {
  const row = document.querySelectorAll('#tableModules tbody tr')[index];
  const cells = row.querySelectorAll('td');
  const name = modules[index].name;
  const grade = modules[index].grade;
  const crp = modules[index].crp;
  const half = modules[index].halfWeight;

  cells[0].innerHTML = `<input type="text" value="${escapeHtml(name)}" id="edit-name-${index}" />`;
  cells[1].innerHTML = `<input type="number" step="0.1" min="1" max="5" value="${grade}" id="edit-grade-${index}" />`;
  cells[2].innerHTML = `<input type="number" step="1" min="1" value="${crp}" id="edit-crp-${index}" />`;
  cells[3].innerHTML = `<select id="edit-half-${index}"><option value="false" ${half ? '' : 'selected'}>1</option><option value="true" ${half ? 'selected' : ''}>½</option></select>`;
  cells[4].innerHTML = `<button onclick="saveEdit(${index})" class="btn-secondary" style="padding:4px 6px; font-size:0.75rem; min-width:34px;">💾</button> <button onclick="render()" class="btn-secondary" style="padding:4px 6px; font-size:0.75rem; min-width:34px;">✖</button>`;
}

function uploadJSON(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error('JSON muss ein Array sein');
      modules.length = 0;
      for (const item of parsed) {
        modules.push({
          name: item.name || '',
          grade: parseFloat(item.grade),
          crp: parseInt(item.crp, 10),
          halfWeight: !!item.halfWeight
        });
      }
      render();
    } catch (err) {
      alert('Fehler beim Lesen der Datei: ' + err.message);
    }
  };
  reader.readAsText(file);
  input.value = '';
}

function saveEdit(index) {
  modules[index].name = document.getElementById('edit-name-' + index).value.trim();
  modules[index].grade = parseFloat(document.getElementById('edit-grade-' + index).value);
  modules[index].crp = parseInt(document.getElementById('edit-crp-' + index).value, 10);
  modules[index].halfWeight = document.getElementById('edit-half-' + index).value === 'true';
  render();
}

// Theme Management
function applyTheme(isLight) {
  document.body.classList.toggle('light-mode', isLight);
  document.getElementById('themeToggle').checked = isLight;
  localStorage.setItem('notenrechner-theme', isLight ? 'light' : 'dark');
}

// Auto-detection + Switch
function initTheme() {
  const saved = localStorage.getItem('notenrechner-theme');
  if (saved) {
    applyTheme(saved === 'light');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme(true);
  }

  document.getElementById('themeToggle').addEventListener('change', (e) => {
    applyTheme(e.target.checked);
  });
}

document.addEventListener('DOMContentLoaded', initTheme);
