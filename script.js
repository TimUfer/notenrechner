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
