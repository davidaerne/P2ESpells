// Show spell details in a modal window
function showSpellDetails(spell) {
  const modal = document.getElementById('spellModal');
  const title = document.getElementById('spellTitle');
  const levelElem = document.getElementById('spellLevel');
  const details = document.getElementById('spellDetails');
  const actionsElem = document.getElementById('spellActions');

  // If the spell has a nethysUrl, make the name a link that opens in a new tab.
  if (spell.nethysUrl) {
    title.innerHTML = `<a href="${spell.nethysUrl}" target="_blank" class="hover:underline">${spell.name}</a>`;
  } else {
    title.textContent = spell.name;
  }

  levelElem.textContent = isCantrip(spell) ? 'Cantrip' : `Level ${spell.level}`;
  // Update the actions text in the modal header (using a slightly larger size)
  actionsElem.innerHTML = getActionBadgeHtml(spell, "text-sm");

  // Process description to replace **text** with <strong>text</strong>
  let description = spell.description || 'No description available.';
  description = description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Build the details HTML and only show rows for properties that have a value.
  let detailsHtml = '';

  // Always show Traits (if available)
  detailsHtml += `<div>
                    <div class="font-semibold">Traits</div>
                    <div>${spell.traits ? spell.traits.join(', ') : 'None'}</div>
                  </div>`;

  // Additional components: Range, Area, Targets, Duration, Type, Cast, Trigger
  if (spell.range) {
    detailsHtml += `<div>
                      <div class="font-semibold">Range</div>
                      <div>${spell.range}</div>
                    </div>`;
  }
  if (spell.area) {
    detailsHtml += `<div>
                      <div class="font-semibold">Area</div>
                      <div>${spell.area}</div>
                    </div>`;
  }
  if (spell.targets) {
    detailsHtml += `<div>
                      <div class="font-semibold">Targets</div>
                      <div>${spell.targets}</div>
                    </div>`;
  }
  if (spell.duration) {
    detailsHtml += `<div>
                      <div class="font-semibold">Duration</div>
                      <div>${spell.duration}</div>
                    </div>`;
  }
  if (spell.type) {
    detailsHtml += `<div>
                      <div class="font-semibold">Type</div>
                      <div>${spell.type}</div>
                    </div>`;
  }
  if (spell.cast) {
    detailsHtml += `<div>
                      <div class="font-semibold">Cast</div>
                      <div>${spell.cast}</div>
                    </div>`;
  }
  if (spell.trigger) {
    detailsHtml += `<div>
                      <div class="font-semibold">Trigger</div>
                      <div>${spell.trigger}</div>
                    </div>`;
  }

  // Always show Description at the end.
  detailsHtml += `<div>
                    <div class="font-semibold">Description</div>
                    <div class="whitespace-pre-wrap">${description}</div>
                  </div>`;

  details.innerHTML = detailsHtml;

  modal.classList.remove('hidden');
}
