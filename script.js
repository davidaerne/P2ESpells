// -------------------------------
// Global Variables
// -------------------------------
let allSpells = [];
let filteredSpells = [];
let expandedLevel = null; // Default: No group expanded
let actionSortAsc = true; // Default sorting order

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

// Format action details with blue circle numbers
function formatActionDetails(text) {
    return text.replace(/\|(\d+)\|/g, (match, number) => 
        `<span class="bg-blue-600 text-white rounded-full inline-flex items-center justify-center px-2 py-1 text-xs">${number}</span>`
    );
}

// -------------------------------
// Rendering Functions (Spell List)
// -------------------------------
function renderSpells() {
    console.log("Rendering spells...");
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

    Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b)).forEach(level => {
        const groupDiv = document.createElement('div');
        groupDiv.className = "bg-white rounded-lg shadow mb-4";

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

        const spellsContainer = document.createElement('div');
        spellsContainer.className = `divide-y ${expandedLevel === level ? '' : 'hidden'}`;

        if (expandedLevel === level) {
            const titleRow = document.createElement('div');
            titleRow.className = "bg-gray-200 px-4 py-2 flex justify-between text-sm font-semibold";
            titleRow.innerHTML = `
                <div>Spell Name</div>
                <div>
                    <span class="sort-actions-link underline cursor-pointer" data-filter="actions-sort">Actions</span>
                </div>
            `;
            spellsContainer.appendChild(titleRow);
        }

        spellsByLevel[level].forEach(spell => {
            const card = document.createElement('div');
            card.className = "p-4 hover:bg-gray-50 cursor-pointer spell-card";
            card.dataset.spellIndex = allSpells.indexOf(spell); // Store index for reference
            card.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-medium">${spell.name}</div>
                        <div class="text-sm text-gray-600 mt-1">${spell.traits ? spell.traits.join(', ') : ''}</div>
                    </div>
                    <span>${spell.action ? spell.action : ''}</span>
                </div>
            `;
            spellsContainer.appendChild(card);
        });

        groupDiv.appendChild(spellsContainer);
        container.appendChild(groupDiv);
    });

    attachSpellClickEvents(); // ✅ Ensure spells are clickable
    attachSortingEvent(); // ✅ Ensure sorting event is reattached
}

// -------------------------------
// Attach Click Events to Spells
// -------------------------------
function attachSpellClickEvents() {
    document.querySelectorAll('.spell-card').forEach(card => {
        card.addEventListener('click', function () {
            const spellIndex = this.dataset.spellIndex;
            if (spellIndex !== undefined) {
                showSpellDetails(allSpells[spellIndex]);
            }
        });
    });
}

// -------------------------------
// Attach Sorting Event (Actions)
// -------------------------------
function attachSortingEvent() {
    setTimeout(() => {
        const sortLink = document.querySelector('[data-filter="actions-sort"]');
        if (sortLink) {
            console.log("✅ Attaching click event to Actions sorting.");
            sortLink.addEventListener('click', function (e) {
                e.preventDefault();
                console.log("✅ Sorting actions fired!");
                actionSortAsc = !actionSortAsc;

                filteredSpells.sort((a, b) => {
                    const aVal = parseInt(a.action, 10) || 0;
                    const bVal = parseInt(b.action, 10) || 0;
                    return actionSortAsc ? aVal - bVal : bVal - aVal;
                });

                console.log("Sort Order:", actionSortAsc ? "Ascending" : "Descending");
                renderSpells();
            });
        } else {
            console.error("❌ Sorting event not attached: 'Actions' link not found!");
        }
    }, 500);
}

// -------------------------------
// Toggle Level Expansion
// -------------------------------
function toggleLevel(level) {
    expandedLevel = (expandedLevel === level) ? null : level;
    renderSpells();
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
        renderSpells();
    } catch (err) {
        console.error('Fetch Error:', err);
        document.getElementById('spellContainer').innerHTML = `<div class="text-red-600">Error loading spells: ${err.message}</div>`;
    }
}

// -------------------------------
// Initialize Script
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    fetchSpells();
    setupEventListeners();
});

// -------------------------------
// Setup Event Listeners
// -------------------------------
function setupEventListeners() {
    document.getElementById('filterBtn').addEventListener('click', () => {
        console.log("✅ Filter button clicked!");
        document.getElementById('filterModal').classList.remove('hidden');
    });

    document.getElementById('closeFilterBtn').addEventListener('click', () => {
        document.getElementById('filterModal').classList.add('hidden');
    });

    document.getElementById('applyFilterBtn').addEventListener('click', () => {
        applyFilters();
        document.getElementById('filterModal').classList.add('hidden');
    });
}
