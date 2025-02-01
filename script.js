// -------------------------------
// Data for Pathfinder Classes (New Dataset)
// -------------------------------
const classData = [
  {"class": "Bard", "traits": ["occult"], "traditions": ["occult"]},
  {"class": "Champion", "traits": ["divine"], "traditions": ["divine"]},
  {"class": "Cleric", "traits": ["divine"], "traditions": ["divine"]},
  {"class": "Druid", "traits": ["primal"], "traditions": ["primal"]},
  {"class": "Magus", "traits": ["arcane"], "traditions": ["arcane"]},
  {"class": "Oracle", "traits": ["arcane", "divine", "occult", "primal"], "traditions": ["arcane", "divine", "occult", "primal"]},
  {"class": "Psychic", "traits": ["occult"], "traditions": ["occult"]},
  {"class": "Ranger", "traits": ["primal"], "traditions": ["primal"]},
  {"class": "Sorcerer", "traits": ["arcane", "divine", "occult", "primal"], "traditions": ["arcane", "divine", "occult", "primal"]},
  {"class": "Summoner", "traits": ["arcane", "divine", "occult", "primal"], "traditions": ["arcane", "divine", "occult", "primal"]},
  {"class": "Thaumaturge", "traits": ["occult"], "traditions": ["occult"]},
  {"class": "Witch", "traits": ["arcane", "divine", "occult", "primal"], "traditions": ["arcane", "divine", "occult", "primal"]},
  {"class": "Wizard", "traits": ["arcane"], "traditions": ["arcane"]}
];

// -------------------------------
// Global Variables
// -------------------------------
let allSpells = [];
let filteredSpells = [];
// Force all groups to be collapsed initially.
let expandedLevel = null;

// -------------------------------
// Helper Functions
// -------------------------------
function isCantrip(spell) {
  const traitsLower = (spell.traits || []).map(t => t.toLowerCase());
  return traitsLower.includes('cantrip');
}

function getSpellLevel(spell) {
  if (isCantrip(spell)) return 0;
  const num = parseInt(spell.level, 10);
  return isNaN(num) ? -1 : num;
}

function getActionBadgeHtml(spell, sizeClass) {
  if (spell.action) {
    let badgeText = '';
    if (spell.actionMax && spell.actionMax !== spell.action) {
      badgeText = spell.action + '-' + spell.actionMax;
    } else {
      badgeText = spell.action;
    }
    return `<span class="${sizeClass} bg-blue-600 text-white font-bold px-2 py-1">${badgeText}</span>`;
  }
  return '';
}

// -------------------------------
// Populate Class Dropdown
// -------------------------------
function populateClassSelect() {
  const classSelect = document.getElementById('classSelect');
  classSelect.innerHTML = `<option value="All">All</option>`;
  classData.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.class;
    opt.textContent = item.class;
    classSelect.appendChild(opt);
  });
}

// -------------------------------
// Update Association Dropdown Based on Selected Class
// -------------------------------
document.getElementById('classSelect').addEventListener('change', function() {
  const selected = this.value;
  const associationContainer = document.getElementById('associationContainer');
  const associationSelect = document.getElementById('associationSelect');
  if (selected === "All") {
    associationContainer.style.display = "none";
    associationSelect.innerHTML = `<option value="All">All</option>`;
  } else {
    const classObj = classData.find(item => item.class === selected);
    let associations = [];
    if (classObj) {
      // Merge traits and traditions, ignoring "none"
      if (classObj.traits && classObj.traits[0].toLowerCase() !== "none") {
        associations = associations.concat(classObj.traits);
      }
      if (classObj.traditions && classObj.traditions[0].toLowerCase() !== "none") {
        associations = associations.concat(classObj.traditions);
      }
      associations = [...new Set(associations)];
    }
    if (associations.length > 0) {
      associationContainer.style.display = "block";
      associationSelect.innerHTML = `<option value="All">All</option>`;
      associations.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        associationSelect.appendChild(opt);
      });
    } else {
      associationContainer.style.display = "none";
      associationSelect.innerHTML = `<option value="All">All</option>`;
    }
  }
});

// -------------------------------
// Rendering Functions
// -------------------------------
function renderSpells() {
  const container = document.getElementById('spellContainer');
  container.innerHTML = '';
  if (filteredSpells.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-gray-600">No spells found matching your criteria</div>`;
    return;
  }
  const spellsByLevel = filteredSpells.reduce((acc, spell) => {
    const level = getSpellLevel(spell);
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {});
  const sortedLevels = Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b));
  sortedLevels.forEach(level => {
    const groupDiv = document.createElement('div');
    groupDiv.className = "bg-white rounded-lg shadow mb-4";
    const headerDiv = document.createElement('div');
    headerDiv.className = "p-4 font-semibold text-lg border-b cursor-pointer hover:bg-gray-50";
    // Use the requested Unicode icons:
    headerDiv.innerHTML = `
      <div class="flex justify-between items-center">
        <span>${level === '0' ? 'Cantrips' : `Level ${level}`} <span class="text-gray-500 text-sm">(${spellsByLevel[level].length} spells)</span></span>
        <span class="transition-colors duration-200">
          ${expandedLevel === level ? '&#9660;' : '&#9654;'}
        </span>
      </div>
    `;
    headerDiv.style.cursor = "pointer";
    headerDiv.addEventListener('click', () => toggleLevel(level));
    groupDiv.appendChild(headerDiv);
    const spellsContainer = document.createElement('div');
    spellsContainer.className = "divide-y " + (expandedLevel === level ? '' : 'hidden');
    if (expandedLevel === level) {
      const titleRow = document.createElement('div');
      titleRow.className = "bg-gray-200 px-4 py-2 flex justify-between text-sm font-semibold";
      titleRow.innerHTML = `<div>Spell Name</div><div>Actions</div>`;
      spellsContainer.appendChild(titleRow);
    }
    spellsByLevel[level].forEach(spell => {
      const card = document.createElement('div');
      card.className = "p-4 hover:bg-gray-50 cursor-pointer";
      card.innerHTML = `
        <div class="flex justify-between items-center">
          <div>
            <div class="font-medium">${spell.name}</div>
            <div class="text-sm text-gray-600 mt-1">${spell.traits ? spell.traits.join(', ') : ''}</div>
          </div>
          ${getActionBadgeHtml(spell, "text-xs")}
        </div>
      `;
      card.style.cursor = "pointer";
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        showSpellDetails(spell);
      });
      spellsContainer.appendChild(card);
    });
    groupDiv.appendChild(spellsContainer);
    container.appendChild(groupDiv);
  });
}

function toggleLevel(level) {
  if (expandedLevel === level) {
    expandedLevel = null;
  } else {
    expandedLevel = level;
  }
  localStorage.setItem("expandedLevel", expandedLevel || '');
  renderSpells();
}

function showSpellDetails(spell) {
  const modal = document.getElementById('spellModal');
  const title = document.getElementById('spellTitle');
  const levelElem = document.getElementById('spellLevel');
  const details = document.getElementById('spellDetails');
  const actionsElem = document.getElementById('spellActions');
  if (spell.nethysUrl) {
    title.innerHTML = `<a href="${spell.nethysUrl}" target="_blank" class="text-blue-600 underline">${spell.name}</a>`;
  } else {
    title.textContent = spell.name;
  }
  levelElem.textContent = isCantrip(spell) ? 'Cantrip' : `Level ${spell.level}`;
  actionsElem.innerHTML = 'Action Cost: ' + getActionBadgeHtml(spell, "text-sm");
  let description = spell.description || 'No description available.';
  description = description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  let detailsHtml = '';
  detailsHtml += `<div><div class="font-semibold">Traits</div><div>${spell.traits ? spell.traits.join(', ') : 'None'}</div></div>`;
  if (spell.cast) {
    detailsHtml += `<div><div class="font-semibold">Cast</div><div>${spell.cast}</div></div>`;
  }
  if (spell.area) {
    detailsHtml += `<div><div class="font-semibold">Area</div><div>${spell.area}</div></div>`;
  }
  if (spell.range) {
    detailsHtml += `<div><div class="font-semibold">Range</div><div>${spell.range}</div></div>`;
  }
  if (spell.duration) {
    detailsHtml += `<div><div class="font-semibold">Duration</div><div>${spell.duration}</div></div>`;
  }
  if (spell.defense) {
    detailsHtml += `<div><div class="font-semibold">Defense</div><div>${spell.defense}</div></div>`;
  }
  if (spell.targets) {
    detailsHtml += `<div><div class="font-semibold">Targets</div><div>${spell.targets}</div></div>`;
  }
  if (spell.trigger) {
    detailsHtml += `<div><div class="font-semibold">Trigger</div><div>${spell.trigger}</div></div>`;
  }
  detailsHtml += `<div><div class="font-semibold">Description</div><div class="whitespace-pre-wrap">${description}</div></div>`;
  details.innerHTML = detailsHtml;
  modal.classList.remove('hidden');
}

// -------------------------------
// Active Filters Display
// -------------------------------
function updateActiveFiltersDisplay() {
  const activeContainer = document.getElementById('activeFilterDisplay');
  activeContainer.innerHTML = '';
  const maxLevel = document.getElementById('maxLevelSelect').value;
  const spellLevelTag = document.createElement('span');
  spellLevelTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
  spellLevelTag.textContent = "Spell Level " + maxLevel;
  activeContainer.appendChild(spellLevelTag);
  const actionsValue = document.getElementById('actionsSelect').value;
  if (actionsValue !== "All") {
    const actionsTag = document.createElement('span');
    actionsTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
    actionsTag.innerHTML = `Actions: ${actionsValue} <span class="ml-2 cursor-pointer" data-filter="actions">×</span>`;
    activeContainer.appendChild(actionsTag);
  }
  const rangeValue = document.getElementById('rangeSelect').value;
  if (rangeValue !== "All") {
    const rangeTag = document.createElement('span');
    rangeTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
    rangeTag.innerHTML = `Range: ${rangeValue} <span class="ml-2 cursor-pointer" data-filter="range">×</span>`;
    activeContainer.appendChild(rangeTag);
  }
  const searchTerm = document.getElementById('searchInput').value.trim();
  if (searchTerm !== '') {
    const searchTag = document.createElement('span');
    searchTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
    searchTag.innerHTML = `Search: ${searchTerm} <span class="ml-2 cursor-pointer" data-filter="search">×</span>`;
    activeContainer.appendChild(searchTag);
  }
  const traditionsValue = document.getElementById('traditionsSelect').value;
  if (traditionsValue !== "All") {
    const traditionsTag = document.createElement('span');
    traditionsTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
    traditionsTag.innerHTML = `Traditions: ${traditionsValue} <span class="ml-2 cursor-pointer" data-filter="traditions">×</span>`;
    activeContainer.appendChild(traditionsTag);
  }
  const selectedClass = document.getElementById('classSelect').value;
  if (selectedClass !== "All") {
    let classText = `Class: ${selectedClass}`;
    const selectedAssociation = document.getElementById('associationSelect').value;
    if (selectedAssociation !== "All") {
      classText += ` (${selectedAssociation})`;
    }
    const classTag = document.createElement('span');
    classTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
    classTag.innerHTML = `${classText} <span class="ml-2 cursor-pointer" data-filter="class">×</span>`;
    activeContainer.appendChild(classTag);
  }
}

// -------------------------------
// Local Storage for Filter Selections
// -------------------------------
function saveFiltersToLocalStorage() {
  const searchTerm = document.getElementById('searchInput').value;
  const traditionsValue = document.getElementById('traditionsSelect').value;
  const maxLevel = document.getElementById('maxLevelSelect').value;
  const actionsValue = document.getElementById('actionsSelect').value;
  const rangeValue = document.getElementById('rangeSelect').value;
  const selectedClass = document.getElementById('classSelect').value;
  const selectedAssociation = document.getElementById('associationSelect').value;
  const filterState = { searchTerm, traditionsValue, maxLevel, actionsValue, rangeValue, selectedClass, selectedAssociation };
  localStorage.setItem("spellFilterState", JSON.stringify(filterState));
}

function loadFiltersFromLocalStorage() {
  const stored = localStorage.getItem("spellFilterState");
  if (stored) {
    const filterState = JSON.parse(stored);
    document.getElementById('searchInput').value = filterState.searchTerm || '';
    document.getElementById('traditionsSelect').value = filterState.traditionsValue || 'All';
    document.getElementById('maxLevelSelect').value = filterState.maxLevel || '1';
    document.getElementById('actionsSelect').value = filterState.actionsValue || 'All';
    document.getElementById('rangeSelect').value = filterState.rangeValue || 'All';
    document.getElementById('classSelect').value = filterState.selectedClass || 'All';
    document.getElementById('associationSelect').value = filterState.selectedAssociation || 'All';
  }
  updateActiveFiltersDisplay();
}

// -------------------------------
// Filtering Functions
// -------------------------------
function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const traditionsValue = document.getElementById('traditionsSelect').value.toLowerCase();
  const maxLevel = parseInt(document.getElementById('maxLevelSelect').value, 10);
  const actionsSelectValue = document.getElementById('actionsSelect').value;
  const rangeValue = document.getElementById('rangeSelect').value.toLowerCase().trim();
  const selectedClass = document.getElementById('classSelect').value;
  const selectedAssociation = document.getElementById('associationSelect').value.toLowerCase();
  
  filteredSpells = allSpells.filter(spell => {
    // Search Filter: check name and traits
    if (searchTerm) {
      const inName = spell.name.toLowerCase().includes(searchTerm);
      const inTraits = (spell.traits || []).some(t => t.toLowerCase().includes(searchTerm));
      if (!inName && !inTraits) return false;
    }
    // Level Filter: always include cantrips; for spells, level must be <= maxLevel
    if (!isCantrip(spell) && getSpellLevel(spell) > maxLevel) return false;
    // Actions Filter
    if (actionsSelectValue !== "All") {
      const selectedAction = parseInt(actionsSelectValue, 10);
      if (!spell.action) return false;
      const spellAction = parseInt(spell.action, 10);
      if (isNaN(spellAction)) return false;
      if (spell.actionMax) {
        const spellActionMax = parseInt(spell.actionMax, 10);
        if (!isNaN(spellActionMax)) {
          if (selectedAction < spellAction || selectedAction > spellActionMax) return false;
        } else {
          if (spellAction !== selectedAction) return false;
        }
      } else {
        if (spellAction !== selectedAction) return false;
      }
    }
    // Range Filter
    if (rangeValue !== "all") {
      if (!spell.range || spell.range.toLowerCase().trim() !== rangeValue) return false;
    }
    // Traditions Filter (if selected in modal)
    if (traditionsValue !== "all") {
      const inTraditions = (spell.traditions || []).some(t => t.toLowerCase() === traditionsValue);
      const inTraits = (spell.traits || []).some(t => t.toLowerCase() === traditionsValue);
      if (!inTraditions && !inTraits) return false;
    }
    // Class & Association Filter:
    if (selectedClass !== "All") {
      const classObj = classData.find(item => item.class === selectedClass);
      let classAssociations = [];
      if (classObj) {
        if (classObj.traits && classObj.traits[0].toLowerCase() !== "none") {
          classAssociations = classAssociations.concat(classObj.traits.map(t => t.toLowerCase()));
        }
        if (classObj.traditions && classObj.traditions[0].toLowerCase() !== "none") {
          classAssociations = classAssociations.concat(classObj.traditions.map(t => t.toLowerCase()));
        }
      }
      if (selectedAssociation !== "all") {
        // Spell must include the selected association in either traits or traditions.
        const assocMatch = (spell.traditions || []).some(t => t.toLowerCase() === selectedAssociation) ||
                           (spell.traits || []).some(t => t.toLowerCase() === selectedAssociation);
        if (!assocMatch) return false;
      } else {
        // If no specific association is chosen, then if classAssociations exist,
        // require that the spell has at least one association from that list.
        if (classAssociations.length > 0) {
          const hasAssociation = (spell.traditions || []).some(t => classAssociations.includes(t.toLowerCase())) ||
                                 (spell.traits || []).some(t => classAssociations.includes(t.toLowerCase()));
          if (!hasAssociation) return false;
        }
      }
    }
    return true;
  });
  
  // Sort by level (ascending)
  filteredSpells.sort((a, b) => getSpellLevel(a) - getSpellLevel(b));
  
  saveFiltersToLocalStorage();
  updateActiveFiltersDisplay();
  renderSpells();
}

// -------------------------------
// Event Listeners Setup
// -------------------------------
function setupEventListeners() {
  document.getElementById('filterBtn').addEventListener('click', () => {
    document.getElementById('filterModal').classList.remove('hidden');
  });
  
  document.getElementById('closeFilterBtn').addEventListener('click', () => {
    document.getElementById('filterModal').classList.add('hidden');
  });
  
  document.getElementById('applyFilterBtn').addEventListener('click', () => {
    applyFilters();
    document.getElementById('filterModal').classList.add('hidden');
  });
  
  document.getElementById('spellModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('spellModal')) {
      document.getElementById('spellModal').classList.add('hidden');
    }
  });
  
  document.getElementById('closeSpellBtn').addEventListener('click', () => {
    document.getElementById('spellModal').classList.add('hidden');
  });
  
  document.getElementById('activeFilterDisplay').addEventListener('click', function(e) {
    if (e.target && e.target.getAttribute('data-filter')) {
      const filterType = e.target.getAttribute('data-filter');
      if (filterType === 'search') {
        document.getElementById('searchInput').value = '';
      } else if (filterType === 'traditions') {
        document.getElementById('traditionsSelect').value = 'All';
      } else if (filterType === 'actions') {
        document.getElementById('actionsSelect').value = 'All';
      } else if (filterType === 'range') {
        document.getElementById('rangeSelect').value = 'All';
      } else if (filterType === 'class') {
        document.getElementById('classSelect').value = 'All';
        document.getElementById('associationSelect').value = 'All';
        document.getElementById('associationContainer').style.display = "none";
      } else if (filterType === 'association') {
        document.getElementById('associationSelect').value = 'All';
      }
      applyFilters();
    }
  });
}

// -------------------------------
// Fetch Spells Data
// -------------------------------
async function fetchSpells() {
  const container = document.getElementById('spellContainer');
  console.log('Fetching spells...');
  try {
    const response = await fetch('https://raw.githubusercontent.com/davidaerne/OracleSpells/76953dbcbc7738dbfc8352de3165b315a63312ea/spells.json');
    console.log('Fetch response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    console.log('Response text length:', text.length);
    try {
      allSpells = JSON.parse(text);
      console.log('Parsed spells count:', allSpells.length);
      filteredSpells = allSpells;
      loadFiltersFromLocalStorage();
      applyFilters();
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      container.innerHTML = `<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">Error parsing spells data: ${parseError.message}</div>`;
    }
  } catch (err) {
    console.error('Fetch Error:', err);
    container.innerHTML = `<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">Error loading spells: ${err.message}<br><small>Please check the console for more details.</small></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  populateClassSelect();
  loadFiltersFromLocalStorage();
  fetchSpells();
  setupEventListeners();
});
