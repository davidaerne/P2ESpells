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
let expandedLevel = null;
// Track sorting state for each level
let levelSortStates = {};

// -------------------------------
// Helper Functions
// -------------------------------
function isCantrip(spell) {
    return (spell.traits || []).map(t => t.toLowerCase()).includes('cantrip');
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

function formatActionDetails(text) {
    return text.replace(/\|(\d+)\|/g, (match, number) => 
        `<span class="bg-blue-600 text-white rounded-full inline-flex items-center justify-center px-2 py-1 text-xs">${number}</span>`
    );
}

// -------------------------------
// Sorting Functions
// -------------------------------
function initializeLevelSort(level) {
    if (!levelSortStates[level]) {
        levelSortStates[level] = {
            isDesc: true // Start with descending sort
        };
    }
}

function toggleLevelSort(level) {
    initializeLevelSort(level);
    levelSortStates[level].isDesc = !levelSortStates[level].isDesc;
}

function sortSpellsByAction(spells, level) {
    initializeLevelSort(level);
    const isDesc = levelSortStates[level].isDesc;
    
    return [...spells].sort((a, b) => {
        const aVal = parseInt(a.action, 10) || 0;
        const bVal = parseInt(b.action, 10) || 0;
        return isDesc ? bVal - aVal : aVal - bVal;
    });
}

// -------------------------------
// Rendering Functions
// -------------------------------
function renderSpells() {
    console.log("Rendering spells...");
    const container = document.getElementById('spellContainer');
    container.innerHTML = '';

    if (filteredSpells.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-gray-600">No spells found matching your criteria</div>`;
        return;
    }

    // Group spells by level
    const spellsByLevel = filteredSpells.reduce((acc, spell) => {
        const level = getSpellLevel(spell);
        if (!acc[level]) acc[level] = [];
        acc[level].push(spell);
        return acc;
    }, {});

    // Sort levels in ascending order
    Object.keys(spellsByLevel)
        .sort((a, b) => Number(a) - Number(b))
        .forEach(level => {
            const groupDiv = document.createElement('div');
            groupDiv.className = "bg-white rounded-lg shadow mb-4";

            // Accordion Header
            const headerDiv = document.createElement('div');
            headerDiv.className = "p-4 font-semibold text-lg border-b cursor-pointer hover:bg-gray-50";
            headerDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <span>${level === '0' ? 'Cantrips' : `Level ${level}`} 
                        <span class="text-gray-500 text-sm">(${spellsByLevel[level].length} spells)</span>
                    </span>
                    <span>${expandedLevel === level ? '&#9660;' : '&#9654;'}</span>
                </div>
            `;
            headerDiv.addEventListener('click', () => toggleLevel(level));
            groupDiv.appendChild(headerDiv);

            // Spells Container
            const spellsContainer = document.createElement('div');
            spellsContainer.className = `divide-y ${expandedLevel === level ? '' : 'hidden'}`;

            if (expandedLevel === level) {
                // Title Row with Sortable Actions
                const titleRow = document.createElement('div');
                titleRow.className = "bg-gray-200 px-4 py-2 flex justify-between text-sm font-semibold";
                
                // Initialize sort state if needed
                initializeLevelSort(level);
                const sortDirection = levelSortStates[level].isDesc ? '↓' : '↑';
                
                titleRow.innerHTML = `
                    <div>Spell Name</div>
                    <div>
                        <span class="sort-actions-link cursor-pointer hover:text-blue-600" 
                              data-filter="actions-sort" 
                              data-level="${level}">
                            Actions ${sortDirection}
                        </span>
                    </div>
                `;

                // Add sorting event listener
                const sortLink = titleRow.querySelector('[data-filter="actions-sort"]');
                sortLink.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const levelToSort = e.target.getAttribute('data-level');
                    toggleLevelSort(levelToSort);
                    renderSpells();
                });

                spellsContainer.appendChild(titleRow);

                // Sort and render spells for this level
                const sortedSpells = sortSpellsByAction(spellsByLevel[level], level);

                // Render spell cards
                sortedSpells.forEach(spell => {
                    const card = document.createElement('div');
                    card.className = "p-4 hover:bg-gray-50 cursor-pointer";
                    card.innerHTML = `
                        <div class="flex justify-between items-center">
                            <div>
                                <div class="font-medium">${spell.name}</div>
                                <div class="text-sm text-gray-600 mt-1">
                                    ${spell.traits ? spell.traits.join(', ') : ''}
                                </div>
                            </div>
                            ${getActionBadgeHtml(spell, "text-xs")}
                        </div>
                    `;
                    card.addEventListener('click', () => showSpellDetails(spell));
                    spellsContainer.appendChild(card);
                });
            }

            groupDiv.appendChild(spellsContainer);
            container.appendChild(groupDiv);
        });
}

// -------------------------------
// Toggle Level Expansion
// -------------------------------
function toggleLevel(level) {
    expandedLevel = (expandedLevel === level) ? null : level;
    renderSpells();
}

// -------------------------------
// Modal Functions
// -------------------------------
function showSpellDetails(spell) {
    const modal = document.getElementById('spellModal');
    const title = document.getElementById('spellTitle');
    const levelElem = document.getElementById('spellLevel');
    const details = document.getElementById('spellDetails');
    const actionsElem = document.getElementById('spellActions');
    
    title.textContent = spell.name;
    levelElem.textContent = isCantrip(spell) ? 'Cantrip' : `Level ${spell.level}`;
    actionsElem.innerHTML = 'Action Cost: ' + getActionBadgeHtml(spell, "text-sm");
    
    let detailsHtml = '';
    detailsHtml += `<div class="mb-4"><div class="font-semibold">Traits</div><div>${spell.traits ? spell.traits.join(', ') : 'None'}</div></div>`;
    if (spell.description) {
        detailsHtml += `<div><div class="font-semibold">Description</div><div class="whitespace-pre-wrap">${formatActionDetails(spell.description)}</div></div>`;
    }
    
    details.innerHTML = detailsHtml;
    modal.classList.remove('hidden');
}

// -------------------------------
// Initialize
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    fetchSpells();
    
    // Add modal close handlers
    document.getElementById('spellModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('spellModal')) {
            document.getElementById('spellModal').classList.add('hidden');
        }
    });
    
    document.getElementById('closeSpellBtn')?.addEventListener('click', () => {
        document.getElementById('spellModal').classList.add('hidden');
    });
});

// -------------------------------
// Fetch Spells Data
// -------------------------------
async function fetchSpells() {
    console.log('Fetching spells...');
    try {
        const response = await fetch('https://raw.githubusercontent.com/davidaerne/OracleSpells/76953dbcbc7738dbfc8352de3165b315a63312ea/spells.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        allSpells = await response.json();
        filteredSpells = allSpells;
        renderSpells();
    } catch (err) {
        console.error('Fetch Error:', err);
        document.getElementById('spellContainer').innerHTML = 
            `<div class="text-red-600">Error loading spells: ${err.message}</div>`;
    }
}
