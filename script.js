// script.js
let allSpells = [];
let filteredSpells = [];
let expandedLevel = null; // Track which level is expanded

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchSpells();
    setupEventListeners();
});

// ... [previous fetchSpells and setupEventListeners functions remain the same] ...

// Toggle spell level expansion
function toggleLevel(level) {
    if (expandedLevel === level) {
        expandedLevel = null; // Collapse if already expanded
    } else {
        expandedLevel = level; // Expand new level
    }
    renderSpells(); // Re-render to show/hide content
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
                        <div class="p-4 hover:bg-gray-50 cursor-pointer" onclick="showSpellDetails(${JSON.stringify(spell).replace(/"/g, '&quot;')})">
                            <div class="font-medium">${spell.name}</div>
                            <div class="text-sm text-gray-600 mt-1">${spell.traits?.join(', ') || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
}

// ... [rest of the previous functions remain the same] ...
