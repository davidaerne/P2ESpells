// script.js
let allSpells = [];
let filteredSpells = [];
let expandedLevel = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    fetchSpells();
    setupEventListeners();
});

// Fetch spells data with improved error handling
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
            renderSpells();
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
