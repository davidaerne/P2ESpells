// -------------------------------
// Data for Pathfinder Classes
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
    // First handle action numbers
    text = text.replace(/\|(\d+)\|/g, (match, number) => 
        `<span class="bg-blue-600 text-white rounded-full inline-flex items-center justify-center px-2 py-1 text-xs">${number}</span>`
    );
    
    // Then handle bold text (both single and double asterisks)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Double asterisks
    text = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');     // Single asterisks
    
    return text;
}

// -------------------------------
// Filter Functions
// -------------------------------
function populateClassSelect() {
    const classSelect = document.getElementById('classSelect');
    classSelect.innerHTML = '<option value="All">All</option>';
    classData.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.class;
        opt.textContent = item.class;
        classSelect.appendChild(opt);
    });
}

// First, clean up updateAssociationSelect
function updateAssociationSelect() {
    const selected = document.getElementById('classSelect').value;
    const associationContainer = document.getElementById('associationContainer');
    const associationSelect = document.getElementById('associationSelect');
    
    if (selected === "All") {
        associationContainer.style.display = "none";
        associationSelect.innerHTML = '<option value="All">All</option>';
        return;
    }

    const classObj = classData.find(item => item.class === selected);
    let associations = [];
    if (classObj) {
        // Combine traits and traditions into associations
        if (classObj.traits && classObj.traits[0].toLowerCase() !== "none") {
            associations = associations.concat(classObj.traits);
        }
        if (classObj.traditions && classObj.traditions[0].toLowerCase() !== "none") {
            associations = associations.concat(classObj.traditions);
        }
        associations = [...new Set(associations)].sort();
    }

    // Always show container for valid classes with associations
    if (associations.length > 0) {
        associationContainer.style.display = "block";
        associationSelect.innerHTML = '<option value="All">All</option>';
        associations.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a;
            opt.textContent = a;
            associationSelect.appendChild(opt);
        });
    } else {
        associationContainer.style.display = "none";
        associationSelect.innerHTML = '<option value="All">All</option>';
    }
}

// -------------------------------
// Update Active Filters Display
// -------------------------------
function updateActiveFiltersDisplay() {
    const activeContainer = document.getElementById('activeFilterDisplay');
    activeContainer.innerHTML = "";
    
    // Class filter (with association if selected)
    const selectedClass = document.getElementById('classSelect').value;
    if (selectedClass !== "All") {
        let classText = `Class: ${selectedClass}`;
        const selectedAssociation = document.getElementById('associationSelect').value;
        if (selectedAssociation !== "All") {
            classText += ` (${selectedAssociation})`;
        }
        const classTag = document.createElement('span');
        classTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
        classTag.textContent = classText;
        activeContainer.appendChild(classTag);
    }
    
    // Spell Level filter
    const maxLevel = document.getElementById('maxLevelSelect').value;
    if (maxLevel !== "1") { // Only show if not default
        const spellLevelTag = document.createElement('span');
        spellLevelTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
        spellLevelTag.textContent = "Spell Level " + maxLevel;
        activeContainer.appendChild(spellLevelTag);
    }
    
    // Actions filter (with remove option)
    const actionsValue = document.getElementById('actionsSelect').value;
    if (actionsValue !== "All") {
        const actionsTag = document.createElement('span');
        actionsTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
        actionsTag.innerHTML = `Actions: ${actionsValue} <span class="ml-2 cursor-pointer" data-filter="actions">×</span>`;
        activeContainer.appendChild(actionsTag);
    }
    
    // Range filter (with remove option)
    const rangeValue = document.getElementById('rangeSelect').value;
    if (rangeValue !== "All") {
        const rangeTag = document.createElement('span');
        rangeTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
        rangeTag.innerHTML = `Range: ${rangeValue} <span class="ml-2 cursor-pointer" data-filter="range">×</span>`;
        activeContainer.appendChild(rangeTag);
    }
    
    // Search filter (with remove option)
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm !== "") {
        const searchTag = document.createElement('span');
        searchTag.className = "inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full mr-2 mb-2";
        searchTag.innerHTML = `Search: ${searchTerm} <span class="ml-2 cursor-pointer" data-filter="search">×</span>`;
        activeContainer.appendChild(searchTag);
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const maxLevel = parseInt(document.getElementById('maxLevelSelect').value, 10);
    const actionsSelectValue = document.getElementById('actionsSelect').value;
    const rangeValue = document.getElementById('rangeSelect').value.toLowerCase();
    const selectedClass = document.getElementById('classSelect').value;
    const selectedAssociation = document.getElementById('associationSelect').value.toLowerCase();

    filteredSpells = allSpells.filter(spell => {
        // Search Filter
        if (searchTerm) {
            const inName = spell.name.toLowerCase().includes(searchTerm);
            const inTraits = (spell.traits || []).some(t => t.toLowerCase().includes(searchTerm));
            if (!inName && !inTraits) return false;
        }

        // Level Filter
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
            if (!spell.range || spell.range.toLowerCase() !== rangeValue) return false;
        }

        // Class & Association Filter
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
                const assocMatch = (spell.traditions || []).some(t => t.toLowerCase() === selectedAssociation) ||
                                 (spell.traits || []).some(t => t.toLowerCase() === selectedAssociation);
                if (!assocMatch) return false;
            } else {
                if (classAssociations.length > 0) {
                    const hasAssociation = (spell.traditions || []).some(t => classAssociations.includes(t.toLowerCase())) ||
                                         (spell.traits || []).some(t => classAssociations.includes(t.toLowerCase()));
                    if (!hasAssociation) return false;
                }
            }
        }

        return true;
    });

    saveFiltersToLocalStorage();
    updateActiveFiltersDisplay(); 
    renderSpells();
}

// -------------------------------
// Sorting Functions
// -------------------------------
function initializeLevelSort(level) {
    if (!levelSortStates[level]) {
        levelSortStates[level] = {
            isDesc: true,   // Start with descending sort
            isActive: false // Track if sorting is active
        };
    }
}

// Update the toggle function
function toggleLevelSort(level) {
    initializeLevelSort(level);
    const state = levelSortStates[level];
    
    if (!state.isActive) {
        // If no sort, start with DESC
        state.isActive = true;
        state.isDesc = true;
    } else if (state.isDesc) {
        // If DESC, switch to ASC
        state.isDesc = false;
    } else {
        // If ASC, clear sort
        state.isActive = false;
    }
}

// Update the sort function
function sortSpellsByAction(spells, level) {
    initializeLevelSort(level);
    const state = levelSortStates[level];
    
    if (!state.isActive) {
        return spells; // Return original order if no sort is active
    }
    
    return [...spells].sort((a, b) => {
        const aVal = parseInt(a.action, 10) || 0;
        const bVal = parseInt(b.action, 10) || 0;
        return state.isDesc ? bVal - aVal : aVal - bVal;
    });
}

// -------------------------------
// Local Storage Functions
// -------------------------------
function saveFiltersToLocalStorage() {
    const filterState = {
        searchTerm: document.getElementById('searchInput').value,
        maxLevel: document.getElementById('maxLevelSelect').value,
        actionsValue: document.getElementById('actionsSelect').value,
        rangeValue: document.getElementById('rangeSelect').value,
        selectedClass: document.getElementById('classSelect').value,
        selectedAssociation: document.getElementById('associationSelect').value
    };
    console.log('Saving filter state:', filterState);
    localStorage.setItem("spellFilterState", JSON.stringify(filterState));
}

async function loadFiltersFromLocalStorage() {
    const stored = localStorage.getItem("spellFilterState");
    if (stored) {
        const filterState = JSON.parse(stored);
        
        // Load basic filters first
        document.getElementById('searchInput').value = filterState.searchTerm || "";
        document.getElementById('maxLevelSelect').value = filterState.maxLevel || "1";
        document.getElementById('actionsSelect').value = filterState.actionsValue || "All";
        document.getElementById('rangeSelect').value = filterState.rangeValue || "All";
        
        // Set class first and trigger change event
        const classSelect = document.getElementById('classSelect');
        if (filterState.selectedClass) {
            classSelect.value = filterState.selectedClass;
            // Manually trigger the association population
            updateAssociationSelect();
            
            // Wait for the next tick to ensure associations are populated
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Now set the association
            const associationSelect = document.getElementById('associationSelect');
            if (associationSelect && filterState.selectedAssociation) {
                associationSelect.value = filterState.selectedAssociation;
            }
        }
        
        // Apply filters after everything is set
        applyFilters();
    }
    updateActiveFiltersDisplay();
}

// Update initialization to handle async loading
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    populateClassSelect();
    await loadFiltersFromLocalStorage();
    setupEventListeners();
    await fetchSpells();
    
    const storedLevel = localStorage.getItem("expandedLevel");
    if (storedLevel) {
        expandedLevel = storedLevel;
    }
});


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
                
                initializeLevelSort(level);
                const sortDirection = levelSortStates[level].isDesc ? '↓' : '↑';
                
                titleRow.innerHTML = `
                    <div>Spell Name</div>
                    <div>
                        <span class="sort-actions-link cursor-pointer hover:text-blue-600" 
                              data-filter="actions-sort" 
                              data-level="${level}">
                            Actions ${levelSortStates[level].isActive 
                                    ? (levelSortStates[level].isDesc ? ' ↓' : ' ↑') 
                                    : ''}
                        </span>
                    </div>
                `;

                const sortLink = titleRow.querySelector('[data-filter="actions-sort"]');
                sortLink.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const levelToSort = e.target.getAttribute('data-level');
                    toggleLevelSort(levelToSort);
                    renderSpells();
                });

                spellsContainer.appendChild(titleRow);

                // Sort and render spells
                const sortedSpells = sortSpellsByAction(spellsByLevel[level], level);

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
    localStorage.setItem("expandedLevel", expandedLevel || '');
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

    // ✅ Make the title a clickable link if the spell has a Nethys URL
    if (spell.nethysUrl) {
        title.innerHTML = `<a href="${spell.nethysUrl}" target="_blank" class="text-blue-600 underline font-bold">${spell.name}</a>`;
    } else {
        title.textContent = spell.name;
    }

    levelElem.textContent = isCantrip(spell) ? 'Cantrip' : `Level ${spell.level}`;
    actionsElem.innerHTML = 'Action Cost: ' + getActionBadgeHtml(spell, "text-sm");

    let detailsHtml = '';
    detailsHtml += `<div class="mb-4"><div class="font-semibold">Traits</div><div>${spell.traits ? spell.traits.join(', ') : 'None'}</div></div>`;

    // Additional spell details
    if (spell.cast && spell.cast.trim().toLowerCase() !== "to") {
        detailsHtml += `<div class="mb-4"><div class="font-semibold">Cast</div><div>${spell.cast}</div></div>`;
    }
    if (spell.area) {
        detailsHtml += `<div class="mb-4"><div class="font-semibold">Area</div><div>${spell.area}</div></div>`;
    }
    if (spell.range) {
        detailsHtml += `<div class="mb-4"><div class="font-semibold">Range</div><div>${spell.range}</div></div>`;
    }
    if (spell.duration) {
        detailsHtml += `<div class="mb-4"><div class="font-semibold">Duration</div><div>${spell.duration}</div></div>`;
    }
    if (spell.description) {
        detailsHtml += `<div><div class="font-semibold">Description</div><div class="whitespace-pre-wrap">${formatActionDetails(spell.description)}</div></div>`;
    }

    details.innerHTML = detailsHtml;
    modal.classList.remove('hidden');
}

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
        // Apply filters immediately after loading spells
        applyFilters();
        renderSpells();
    } catch (err) {
        console.error('Fetch Error:', err);
        document.getElementById('spellContainer').innerHTML = 
            `<div class="text-red-600">Error loading spells: ${err.message}</div>`;
    }
}

function setupEventListeners() {
    // Filter modal events
    document.getElementById('filterBtn')?.addEventListener('click', () => {
        document.getElementById('filterModal').classList.remove('hidden');
    });
    
    document.getElementById('closeFilterBtn')?.addEventListener('click', () => {
        document.getElementById('filterModal').classList.add('hidden');
    });
    
    document.getElementById('applyFilterBtn')?.addEventListener('click', () => {
        applyFilters();
        document.getElementById('filterModal').classList.add('hidden');
    });
    
    // Class selection change
    document.getElementById('classSelect')?.addEventListener('change', updateAssociationSelect);
    
    // Dynamic search
    document.getElementById('searchInput')?.addEventListener('input', () => {
        applyFilters();
    });
    
    // Modal close events
    document.getElementById('spellModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('spellModal')) {
            document.getElementById('spellModal').classList.add('hidden');
        }
    });
    
    document.getElementById('closeSpellBtn')?.addEventListener('click', () => {
        document.getElementById('spellModal').classList.add('hidden');
    });
    
    // Filter modal outside click
    document.getElementById('filterModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('filterModal')) {
            document.getElementById('filterModal').classList.add('hidden');
        }
    });
    
    // Escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('spellModal')?.classList.add('hidden');
            document.getElementById('filterModal')?.classList.add('hidden');
        }
    });
        document.getElementById('activeFilterDisplay').addEventListener('click', (e) => {
        const filterElement = e.target.closest('[data-filter]');
        if (filterElement) {
            const filterType = filterElement.getAttribute('data-filter');
            
            switch(filterType) {
                case 'search':
                    document.getElementById('searchInput').value = '';
                    break;
                case 'range':
                    document.getElementById('rangeSelect').value = 'All';
                    break;
                case 'actions':
                    document.getElementById('actionsSelect').value = 'All';
                    break;
            }
            
            applyFilters(); // This will also update the active filters display
        }
     });
}
// -------------------------------
// Initialize
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    populateClassSelect();
    loadFiltersFromLocalStorage();
    setupEventListeners();
    fetchSpells();
    
    // Restore expanded level from localStorage
    const storedLevel = localStorage.getItem("expandedLevel");
    if (storedLevel) {
        expandedLevel = storedLevel;
    }
});
