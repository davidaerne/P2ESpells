// script.js
let allSpells = [];
let filteredSpells = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchSpells();
    setupEventListeners();
});

// Fetch spells data
async function fetchSpells() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/davidaerne/OracleSpells/76953dbcbc7738dbfc8352de3165b315a63312ea/spells.json');
        if (!response.ok) throw new Error('Failed to fetch spells');
        allSpells = await response.json();
        filteredSpells = allSpells;
        renderSpells();
    } catch (err) {
        console.error('Error fetching spells:', err);
        document.getElementById('spellContainer').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                Error loading spells: ${err.message}
            </div>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filter modal
    document.getElementById('filterBtn').addEventListener('click', () => {
        document.getElementById('filterModal').classList.remove('hidden');
    });
    
    document.getElementById('closeFilterBtn').addEventListener('click', () => {
        document.getElementById('filterModal').classList.add('hidden');
    });

    // Apply filters
    document.getElementById('applyFilterBtn').addEventListener('click', () => {
        applyFilters();
        document.getElementById('filterModal').classList.add('hidden');
    });

    // Clear filters
    document.getElementById('clearFilterBtn').addEventListener('click', clearFilters);

    // Close spell modal when clicking outside
    document.getElementById('spellModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('spellModal')) {
            document.getElementById('spellModal').classList.add('hidden');
        }
    });

    document.getElementById('closeSpellBtn').addEventListener('click', () => {
        document.getElementById('spellModal').classList.add('hidden');
    });
}

// Helper functions
function isCantrip(spell) {
    const traitsLower = (spell.traits || []).map(t => t.toLowerCase());
    return traitsLower.includes('cantrip');
}

function getSpellLevel(spell) {
    if (isCantrip(spell)) return 0;
    const num = parseInt(spell.level, 10);
    return isNaN(num) ? -1 : num;
}

// Filter spells
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('typeSelect').value;
    const sortBy = document.getElementById('sortSelect').value;
    const traditionsSelect = document.getElementById('traditionsSelect');
    const selectedTraditions = Array.from(traditionsSelect.selectedOptions).map(option => option.value);

    filteredSpells = allSpells.filter(spell => {
        // Filter by traditions
        const traditions = (spell.traditions || []).map(t => t.toLowerCase());
        const traits = (spell.traits || []).map(t => t.toLowerCase());
        const combined = [...traditions, ...traits];
        
        if (selectedTraditions.length > 0 && !selectedTraditions.some(t => combined.includes(t.toLowerCase()))) {
            return false;
        }

        // Filter by type
        if (type === 'Cantrip' && !isCantrip(spell)) return false;
        if (type === 'Spell' && isCantrip(spell)) return false;

        // Filter by search term
        if (searchTerm) {
            const inName = spell.name.toLowerCase().includes(searchTerm);
            const inTraits = traits.some(t => t.includes(searchTerm));
            if (!inName && !inTraits) return false;
        }

        return true;
    });

    // Sort spells
    if (sortBy === 'Level') {
        filteredSpells.sort((a, b) => getSpellLevel(a) - getSpellLevel(b));
    } else {
        filteredSpells.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderSpells();
}

// Clear filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeSelect').value = 'All';
    document.getElementById('sortSelect').value = 'Level';
    const traditionsSelect = document.getElementById('traditionsSelect');
    Array.from(traditionsSelect.options).forEach(option => option.selected = false);
    
    filteredSpells = allSpells;
    renderSpells();
}

// Show spell details
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

    modal.classList.remove('hidden');
}

// Render spells
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
            <div class="bg-white rounded-lg shadow">
                <div class="p-4 font-semibold text-lg border-b">
                    ${level === '0' ? 'Cantrips' : `Level ${level}`}
                    <span class="text-gray-500 text-sm">(${spells.length} spells)</span>
                </div>
                <div class="divide-y">
                    ${spells.map(spell => `
                        <div class="p-4 hover:bg-gray-50 cursor-pointer" onclick="showSpellDetails(${JSON.stringify(spell).replace(/"/g, '&quot;')})">
                            <div class="font-medium">${spell.name}</div>
                            <div class="text-sm text-gray-600 mt-1">${spell.traits?.join(', ') || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
}
