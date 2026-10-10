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
  for (const m of modules) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(m.name)}</td>
      <td>${m.grade.toFixed(1)}</td>
      <td>${m.crp}</td>
      <td>${m.halfWeight ? '½' : '1'}</td>
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
