// -------------------------------
// Show Spell Details in Modal
// -------------------------------
function showSpellDetails(spell) {
    console.log("✅ Showing spell details:", spell);

    const modal = document.getElementById('spellModal');
    const title = document.getElementById('spellTitle');
    const level = document.getElementById('spellLevel');
    const details = document.getElementById('spellDetails');

    // Set spell title as a clickable link
    if (spell.nethysUrl) {
        title.innerHTML = `<a href="${spell.nethysUrl}" target="_blank" class="text-blue-600 underline">${spell.name}</a>`;
    } else {
        title.textContent = spell.name;
    }

    level.textContent = isCantrip(spell) ? 'Cantrip' : `Level ${spell.level}`;

    // Generate spell details dynamically
    details.innerHTML = `
        ${spell.traits ? `<div><strong>Traits:</strong> ${spell.traits.join(', ')}</div>` : ''}
        ${spell.range && spell.range !== "to" ? `<div><strong>Range:</strong> ${spell.range}</div>` : ''}
        ${spell.area ? `<div><strong>Area:</strong> ${spell.area}</div>` : ''}
        ${spell.duration ? `<div><strong>Duration:</strong> ${spell.duration}</div>` : ''}
        ${spell.defense ? `<div><strong>Defense:</strong> ${spell.defense}</div>` : ''}
        ${spell.targets ? `<div><strong>Targets:</strong> ${spell.targets}</div>` : ''}
        ${spell.trigger ? `<div><strong>Trigger:</strong> ${spell.trigger}</div>` : ''}
        ${spell.cast && spell.cast !== "to" ? `<div><strong>Cast:</strong> ${spell.cast}</div>` : ''}
        ${spell.action ? `<div><strong>Action Cost:</strong> ${spell.action}</div>` : ''}
        ${spell.description ? `<div class="whitespace-pre-wrap">${formatActionDetails(spell.description)}</div>` : 'No description available.'}
    `;

    modal.classList.remove('hidden');
}

// -------------------------------
// Close Modal Event Listener
// -------------------------------
document.getElementById('closeSpellBtn').addEventListener('click', () => {
    document.getElementById('spellModal').classList.add('hidden');
});

// Close modal when clicking outside
document.getElementById('spellModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('spellModal')) {
        document.getElementById('spellModal').classList.add('hidden');
    }
});
