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

// Render spells grouped by level
function renderSpells() {
    const container = document.getElementById('spellContainer');

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

    // Render each level group
    container.innerHTML = Object.entries(spellsByLevel)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([level, spells]) => `
            <div class="bg-white rounded-lg shadow mb-4">
                <div class="p-4 font-semibold text-lg border-b cursor-pointer hover:bg-gray-50"
                     onclick="toggleLevel('${level}')">
                    <div class="flex justify-between items-center">
                        <span>${level === '0' ? 'Cantrips' : `Level ${level}`}
                            <span class="text-gray-500 text-sm">(${spells.length} spells)</span>
                        </span>
                        <span class="transform transition-transform duration-200 ${expandedLevel === level ? 'rotate-180' : ''}">▼</span>
                    </div>
                </div>
                <div class="divide-y ${expandedLevel === level ? '' : 'hidden'}">
                    ${spells.map(spell => `
                        <div class="p-4 hover:bg-gray-50 cursor-pointer" onclick='showSpellDetails(${JSON.stringify(spell).replace(/"/g, '&quot;')})'>
                            <div class="font-medium">${spell.name}</div>
                            <div class="text-sm text-gray-600 mt-1">${spell.traits?.join(', ') || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
}

// Show spell details in the detail modal
function showSpellDetails(spell) {
    const modal = document.getElementById('spellModal');
    const title = document.getElementById('spellTitle');
    const level = document.getElementById('spellLevel');
    const details = document.getElementById('spellDetails');

    title.textContent = spell.name;
    level.textContent = isCantrip(spell) ? 'Cantrip' : `Level ${spell.level}`;

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
            <div class="whitespace-pre-wrap">${spell.description || 'No description available.'}</div>
        </div>
    `;

    // (Optional) Save the last viewed spell to localStorage if desired
    // localStorage.setItem("lastSelectedSpell", JSON.stringify(spell));

    modal.classList.remove('hidden');
}

// -------------------------------
// Local Storage for Filter Selections
// -------------------------------

// Save current filter settings to localStorage
function saveFiltersToLocalStorage() {
    const searchTerm = document.getElementById('searchInput').value;
    const type = document.getElementById('typeSelect').value;
    const sortBy = document.getElementById('sortSelect').value;
    const traditionsSelect = document.getElementById('traditionsSelect');
    const selectedTraditions = Array.from(traditionsSelect.selectedOptions).map(option => option.value);

    const filterState = { searchTerm, type, sortBy, selectedTraditions };
    localStorage.setItem("spellFilterState", JSON.stringify(filterState));
}

// Load filter settings from localStorage and update the filter controls
function loadFiltersFromLocalStorage() {
    const stored = localStorage.getItem("spellFilterState");
    if (stored) {
        const filterState = JSON.parse(stored);
        document.getElementById('searchInput').value = filterState.searchTerm || '';
        document.getElementById('typeSelect').value = filterState.type || 'All';
        document.getElementById('sortSelect').value = filterState.sortBy || 'Level';
        const traditionsSelect = document.getElementById('traditionsSelect');
        for (const option of traditionsSelect.options) {
            option.selected = filterState.selectedTraditions && filterState.selectedTraditions.includes(option.value);
        }
    }
}

// -------------------------------
// Filtering Functions
// -------------------------------

// Filter spells based on the filter controls and save the selection state
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('typeSelect').value;
    const sortBy = document.getElementById('sortSelect').value;
    const traditionsSelect = document.getElementById('traditionsSelect');
    const selectedTraditions = Array.from(traditionsSelect.selectedOptions).map(option => option.value);

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

        return true;
    });

    // Sort the filtered spells
    if (sortBy === 'Level') {
        filteredSpells.sort((a, b) => getSpellLevel(a) - getSpellLevel(b));
    } else {
        filteredSpells.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Save the current filter state to localStorage
    saveFiltersToLocalStorage();
    renderSpells();
}

// Clear filters and remove saved filter state from localStorage
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeSelect').value = 'All';
    document.getElementById('sortSelect').value = 'Level';
    const traditionsSelect = document.getElementById('traditionsSelect');
    Array.from(traditionsSelect.options).forEach(option => option.selected = false);

    localStorage.removeItem("spellFilterState");
    
    filteredSpells = allSpells;
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

    document.getElementById('clearFilterBtn').addEventListener('click', clearFilters);

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
            // Initialize filteredSpells with all spells
            filteredSpells = allSpells;
            // After fetching, load any saved filter settings and apply them
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
    // Load any saved filter state (if present)
    loadFiltersFromLocalStorage();
    fetchSpells();
    setupEventListeners();
});
