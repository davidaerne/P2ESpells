// script.js
let allSpells = [];
let filteredSpells = [];
// Load the previously expanded level from localStorage (if any)
let expandedLevel = localStorage.getItem("expandedLevel") || null;

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

// Toggle spell level expansion and save state to localStorage
function toggleLevel(level) {
  if (expandedLevel === level) {
    expandedLevel = null;
  } else {
    expandedLevel = level;
  }
  localStorage.setItem("expandedLevel", expandedLevel || '');
  renderSpells();
}

// -------------------------------
// Rendering Functions
// -------------------------------

function renderSpells() {
  const container = document.getElementById('spellContainer');
  container.innerHTML = '';

  if (filteredSpells.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-600">
        No spells found matching your criteria
      </div>
    `;
    return;
  }

  // Group spells by level (cantrips have level 0)
  const spellsByLevel = filteredSpells.reduce((acc, spell) => {
    const level = getSpellLevel(spell);
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {});

  // Sort levels numerically
  const sortedLevels = Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b));

  sortedLevels.forEach(level => {
    // Create group container
    const groupDiv = document.createElement('div');
    groupDiv.className = "bg-white rounded-lg shadow mb-4";

    // Create header that toggles expansion
    const headerDiv = document.createElement('div');
    headerDiv.className = "p-4 font-semibold text-lg border-b cursor-pointer hover:bg-gray-50";
    headerDiv.innerHTML = `
      <div class="flex justify-between items-center">
        <span>
          ${level === '0' ? 'Cantrips' : `Level ${level}`} 
          <span class="text-gray-500 text-sm">(${spellsByLevel[level].length} spells)</span>
        </span>
        <span class="transform transition-transform duration-200 ${expandedLevel === level ? 'rotate-180' : ''}">▼</span>
      </div>
    `;
    headerDiv.addEventListener('click', () => toggleLevel(level));
    groupDiv.appendChild(headerDiv);

    // Create container for spell cards
    const spellsContainer = document.createElement('div');
    spellsContainer.className = "divide-y " + (expandedLevel === level ? '' : 'hidden');

    // Create each spell card
    spellsByLevel[level].forEach(spell => {
      const card = document.createElement('div');
      card.className = "p-4 hover:bg-gray-50 cursor-pointer";
      card.innerHTML = `
        <div class="font-medium">${spell.name}</div>
        <div class="text-sm text-gray-600 mt-1">${spell.traits ? spell.traits.join(', ') : ''}</div>
      `;
      // Attach click event to open modal with spell details
      card.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent header toggle
        showSpellDetails(spell);
      });
      spellsContainer.appendChild(card);
    });

    groupDiv.appendChild(spellsContainer);
    container.appendChild(groupDiv);
  });
}

// Show spell details in the modal
function showSpellDetails(spell) {
  const modal = document.getElementById('spellModal');
  const title = document.getElementById('spellTitle');
  const levelElem = document.getElementById('spellLevel');
  const details = document.getElementById('spellDetails');

  title.textContent = spell.name;
  levelElem.textContent = isCantrip(spell) ? 'Cantrip' : `Level ${spell.level}`;

  // Replace any **bold** markdown with HTML <strong> tags
  let description = spell.description || 'No description available.';
  description = description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  details.innerHTML = `
    <div>
      <div class="font-semibold">Traits</div>
      <div>${spell.traits?.join(', ') || 'None'}</div>
    </div>
    ${spell.cast ? `
      <div>
        <div class="font-semibold">Cast</div>
        <div>${spell.cast}</div>
      </div>
    ` : ''}
    ${spell.range ? `
      <div>
        <div class="font-semibold">Range</div>
        <div>${spell.range}</div>
      </div>
    ` : ''}
    ${spell.targets ? `
      <div>
        <div class="font-semibold">Targets</div>
        <div>${spell.targets}</div>
      </div>
    ` : ''}
    ${spell['saving throw'] ? `
      <div>
        <div class="font-semibold">Saving Throw</div>
        <div>${spell['saving throw']}</div>
      </div>
    ` : ''}
    <div>
      <div class="font-semibold">Description</div>
      <div class="whitespace-pre-wrap">${description}</div>
    </div>
  `;

  modal.classList.remove('hidden');
}

// -------------------------------
// Active Filters Management
// -------------------------------

function updateActiveFilters() {
  const activeFiltersContainer = document.getElementById('activeFilters');
  activeFiltersContainer.innerHTML = '';
  const filters = [];
  
  const searchValue = document.getElementById('searchInput').value.trim();
  const typeValue = document.getElementById('typeSelect').value;
  const levelValue = document.getElementById('levelSelect').value;
  const traditionsSelect = document.getElementById('traditionsSelect');
  const traditionsValues = Array.from(traditionsSelect.selectedOptions).map(o => o.value);
  
  if (searchValue) {
    filters.push({name: 'Search', value: searchValue});
  }
  if (typeValue !== 'All') {
    filters.push({name: 'Type', value: typeValue});
  }
  // Always show the level filter
  filters.push({name: 'Level', value: levelValue});
  if (traditionsValues.length > 0) {
    filters.push({name: 'Traditions', value: traditionsValues.join(', ')});
  }
  
  if (filters.length > 0) {
    const filtersHTML = filters.map(filter => {
      return `<span class="bg-blue-100 text-blue-800 rounded px-2 py-1 mr-2 inline-flex items-center">
        ${filter.name}: ${filter.value}
        <button class="ml-1 text-blue-500 hover:text-blue-700" data-filter="${filter.name}">x</button>
      </span>`;
    }).join('');
    activeFiltersContainer.innerHTML = filtersHTML;
    // Attach click events for each "x" to reset that filter
    activeFiltersContainer.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', function(){
         const filterName = this.getAttribute('data-filter');
         if (filterName === 'Search') {
           document.getElementById('searchInput').value = '';
         } else if (filterName === 'Type') {
           document.getElementById('typeSelect').value = 'All';
         } else if (filterName === 'Level') {
           document.getElementById('levelSelect').value = '1';
         } else if (filterName === 'Traditions') {
           const traditionsSelect = document.getElementById('traditionsSelect');
           Array.from(traditionsSelect.options).forEach(option => option.selected = false);
         }
         applyFilters();
         updateActiveFilters();
      });
    });
  }
}

// -------------------------------
// Local Storage for Filter Selections
// -------------------------------

function saveFiltersToLocalStorage() {
  const searchTerm = document.getElementById('searchInput').value;
  const type = document.getElementById('typeSelect').value;
  const sortBy = document.getElementById('sortSelect').value;
  const level = document.getElementById('levelSelect').value;
  const traditionsSelect = document.getElementById('traditionsSelect');
  const selectedTraditions = Array.from(traditionsSelect.selectedOptions).map(option => option.value);

  const filterState = { searchTerm, type, sortBy, level, selectedTraditions };
  localStorage.setItem("spellFilterState", JSON.stringify(filterState));
}

function loadFiltersFromLocalStorage() {
  const stored = localStorage.getItem("spellFilterState");
  if (stored) {
    const filterState = JSON.parse(stored);
    document.getElementById('searchInput').value = filterState.searchTerm || '';
    document.getElementById('typeSelect').value = filterState.type || 'All';
    document.getElementById('sortSelect').value = filterState.sortBy || 'Level';
    document.getElementById('levelSelect').value = filterState.level || '1';
    const traditionsSelect = document.getElementById('traditionsSelect');
    for (const option of traditionsSelect.options) {
      option.selected = filterState.selectedTraditions && filterState.selectedTraditions.includes(option.value);
    }
  }
}

// -------------------------------
// Filtering Functions
// -------------------------------

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const type = document.getElementById('typeSelect').value;
  const selectedLevel = document.getElementById('levelSelect').value;
  const sortBy = document.getElementById('sortSelect').value;
  const traditionsSelect = document.getElementById('traditionsSelect');
  const selectedTraditions = Array.from(traditionsSelect.selectedOptions).map(option => option.value);

  filteredSpells = allSpells.filter(spell => {
    const traditions = (spell.traditions || []).map(t => t.toLowerCase());
    const traits = (spell.traits || []).map(t => t.toLowerCase());
    const combined = [...traditions, ...traits];
    
    if (selectedTraditions.length > 0 && !selectedTraditions.some(t => combined.includes(t.toLowerCase()))) {
      return false;
    }
    if (searchTerm) {
      const inName = spell.name.toLowerCase().includes(searchTerm);
      const inTraits = traits.some(t => t.includes(searchTerm));
      if (!inName && !inTraits) return false;
    }
    
    // Filtering based on Type and Level:
    if (type === 'Cantrip') {
      // Only show cantrips if Type is set to "Cantrip"
      return isCantrip(spell);
    } else if (type === 'Spell') {
      // Show only non-cantrip spells that match the selected level
      if (isCantrip(spell)) return false;
      return parseInt(spell.level, 10) === parseInt(selectedLevel, 10);
    } else { // type === 'All'
      // Always show cantrips; for non-cantrips, show if they match the selected level
      if (isCantrip(spell)) return true;
      return parseInt(spell.level, 10) === parseInt(selectedLevel, 10);
    }
  });

  if (sortBy === 'Level') {
    filteredSpells.sort((a, b) => getSpellLevel(a) - getSpellLevel(b));
  } else {
    filteredSpells.sort((a, b) => a.name.localeCompare(b.name));
  }

  saveFiltersToLocalStorage();
  renderSpells();
  updateActiveFilters();
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
      container.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error parsing spells data: ${parseError.message}
        </div>
      `;
    }
  } catch (err) {
    console.error('Fetch Error:', err);
    container.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading spells: ${err.message}
        <br>
        <small>Please check the console for more details.</small>
      </div>
    `;
  }
}

// -------------------------------
// Initialization
// -------------------------------

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  loadFiltersFromLocalStorage();
  fetchSpells();
  setupEventListeners();
});
