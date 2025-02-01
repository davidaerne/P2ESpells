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

/**
 * Returns the HTML for the action badge.  
 * If both spell.action and spell.actionMax exist and differ, returns "action-actionMax".
 * Otherwise, returns just the action.
 * The sizeClass parameter lets you specify Tailwind classes (e.g. "w-6 h-6 text-xs" for small badges).
 */
function getActionBadgeHtml(spell, sizeClass) {
  if (spell.action) {
    let badgeText = '';
    if (spell.actionMax && spell.actionMax !== spell.action) {
      badgeText = spell.action + '-' + spell.actionMax;
    } else {
      badgeText = spell.action;
    }
    return `<span class="inline-flex items-center justify-center bg-blue-600 text-white font-bold rounded-full ${sizeClass}">${badgeText}</span>`;
  }
  return '';
}

// Toggle spell level expansion and save the state to localStorage
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

  // Group spells by level
  const spellsByLevel = filteredSpells.reduce((acc, spell) => {
    const level = getSpellLevel(spell);
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {});

  // Sort the levels numerically
  const sortedLevels = Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b));

  sortedLevels.forEach(level => {
    // Create the group container
    const groupDiv = document.createElement('div');
    groupDiv.className = "bg-white rounded-lg shadow mb-4";

    // Create the header that toggles expansion
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

    // Create the container for the spell cards
    const spellsContainer = document.createElement('div');
    spellsContainer.className = "divide-y " + (expandedLevel === level ? '' : 'hidden');

    // For each spell, create a card element
    spellsByLevel[level].forEach(spell => {
      const card = document.createElement('div');
      card.className = "p-4 hover:bg-gray-50 cursor-pointer";
      // Create a flex container with spell info on the left and the action badge on the right
      card.innerHTML = `
        <div class="flex justify-between items-center">
          <div>
            <div class="font-medium">${spell.name}</div>
            <div class="text-sm text-gray-600 mt-1">${spell.traits ? spell.traits.join(', ') : ''}</div>
          </div>
          ${getActionBadgeHtml(spell, "w-6 h-6 text-xs")}
        </div>
      `;
      // Attach the click event directly to show spell details
      card.addEventListener('click', (e) => {
        // Prevent the event from bubbling up to the header (which toggles the group)
        e.stopPropagation();
        showSpellDetails(spell);
      });
      spellsContainer.appendChild(card);
    });

    groupDiv.appendChild(spellsContainer);
    container.appendChild(groupDiv);
  });
}

// Show spell details in a modal window
function showSpellDetails(spell) {
  const modal = document.getElementById('spellModal');
  const title = document.getElementById('spellTitle');
  const levelElem = document.getElementById('spellLevel');
  const details = document.getElementById('spellDetails');
  const actionsElem = document.getElementById('spellActions');

  title.textContent = spell.name;
  levelElem.textContent = isCantrip(spell) ? 'Cantrip' : `Level ${spell.level}`;
  // Update the actions badge in the modal header (using a slightly larger size)
  actionsElem.innerHTML = getActionBadgeHtml(spell, "w-8 h-8 text-sm");

  // Process description to replace **text** with <strong>text</strong>
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
// Active Filters Display
// -------------------------------

function updateActiveFiltersDisplay() {
  const activeContainer = document.getElementById('activeFilterDisplay');
  activeContainer.innerHTML = ''; // clear previous tags

  // Always show Spell Level filter (static tag)
  const maxLevel = document.getElementById('maxLevelSelect').value;
  const spellLevelTag = document.createElement('span');
  spellLevelTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
  spellLevelTag.textContent = "Spell Level " + maxLevel;
  activeContainer.appendChild(spellLevelTag);

  // Show Search filter if active
  const searchTerm = document.getElementById('searchInput').value.trim();
  if (searchTerm !== '') {
    const searchTag = document.createElement('span');
    searchTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
    searchTag.innerHTML = `Search: ${searchTerm} <span class="ml-2 cursor-pointer" data-filter="search">×</span>`;
    activeContainer.appendChild(searchTag);
  }

  // Show Type filter if active (not "All")
  const type = document.getElementById('typeSelect').value;
  if (type !== 'All') {
    const typeTag = document.createElement('span');
    typeTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
    typeTag.innerHTML = `Type: ${type} <span class="ml-2 cursor-pointer" data-filter="type">×</span>`;
    activeContainer.appendChild(typeTag);
  }

  // Show Traditions filter if any are selected
  const traditionsSelect = document.getElementById('traditionsSelect');
  const selectedTraditions = Array.from(traditionsSelect.selectedOptions).map(option => option.value);
  if (selectedTraditions.length > 0) {
    const traditionsTag = document.createElement('span');
    traditionsTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
    traditionsTag.innerHTML = `Traditions: ${selectedTraditions.join(', ')} <span class="ml-2 cursor-pointer" data-filter="traditions">×</span>`;
    activeContainer.appendChild(traditionsTag);
  }
}

// -------------------------------
// Local Storage for Filter Selections
// -------------------------------

function saveFiltersToLocalStorage() {
  const searchTerm = document.getElementById('searchInput').value;
  const type = document.getElementById('typeSelect').value;
  const sortBy = document.getElementById('sortSelect').value;
  const traditionsSelect = document.getElementById('traditionsSelect');
  const selectedTraditions = Array.from(traditionsSelect.selectedOptions).map(option => option.value);
  const maxLevel = document.getElementById('maxLevelSelect').value;

  const filterState = { searchTerm, type, sortBy, selectedTraditions, maxLevel };
  localStorage.setItem("spellFilterState", JSON.stringify(filterState));
}

function loadFiltersFromLocalStorage() {
  const stored = localStorage.getItem("spellFilterState");
  if (stored) {
    const filterState = JSON.parse(stored);
    document.getElementById('searchInput').value = filterState.searchTerm || '';
    document.getElementById('typeSelect').value = filterState.type || 'All';
    document.getElementById('sortSelect').value = filterState.sortBy || 'Level';
    document.getElementById('maxLevelSelect').value = filterState.maxLevel || '1';
    const traditionsSelect = document.getElementById('traditionsSelect');
    for (const option of traditionsSelect.options) {
      option.selected = filterState.selectedTraditions && filterState.selectedTraditions.includes(option.value);
    }
  }
  updateActiveFiltersDisplay();
}

// -------------------------------
// Filtering Functions
// -------------------------------

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const type = document.getElementById('typeSelect').value;
  const sortBy = document.getElementById('sortSelect').value;
  const traditionsSelect = document.getElementById('traditionsSelect');
  const selectedTraditions = Array.from(traditionsSelect.selectedOptions).map(option => option.value);
  const maxLevel = parseInt(document.getElementById('maxLevelSelect').value, 10);

  filteredSpells = allSpells.filter(spell => {
    const traditions = (spell.traditions || []).map(t => t.toLowerCase());
    const traits = (spell.traits || []).map(t => t.toLowerCase());
    const combined = [...traditions, ...traits];

    // Filter by selected traditions if any
    if (selectedTraditions.length > 0 && !selectedTraditions.some(t => combined.includes(t.toLowerCase()))) {
      return false;
    }
    // Filter by type (Cantrip/Spell)
    if (type === 'Cantrip' && !isCantrip(spell)) return false;
    if (type === 'Spell' && isCantrip(spell)) return false;

    // Filter by search term in name or traits
    if (searchTerm) {
      const inName = spell.name.toLowerCase().includes(searchTerm);
      const inTraits = traits.some(t => t.includes(searchTerm));
      if (!inName && !inTraits) return false;
    }

    // Level Filter:
    // Always include cantrips; for spells, include only if spell level is less than or equal to maxLevel
    if (!isCantrip(spell) && getSpellLevel(spell) > maxLevel) {
      return false;
    }

    return true;
  });

  // Sort the filtered spells
  if (sortBy === 'Level') {
    filteredSpells.sort((a, b) => getSpellLevel(a) - getSpellLevel(b));
  } else {
    filteredSpells.sort((a, b) => a.name.localeCompare(b.name));
  }

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

  // Delegate click events on active filter tags (for clearing filters)
  document.getElementById('activeFilterDisplay').addEventListener('click', function(e) {
    if (e.target && e.target.getAttribute('data-filter')) {
      const filterType = e.target.getAttribute('data-filter');
      if (filterType === 'search') {
        document.getElementById('searchInput').value = '';
      } else if (filterType === 'type') {
        document.getElementById('typeSelect').value = 'All';
      } else if (filterType === 'traditions') {
        const traditionsSelect = document.getElementById('traditionsSelect');
        for (const option of traditionsSelect.options) {
          option.selected = false;
        }
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
