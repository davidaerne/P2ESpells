<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>P2E Spells Database</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { theme: { extend: {} } }
  </script>
</head>
<body class="bg-gray-100 min-h-screen">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <header class="bg-white shadow-lg rounded-lg p-4 mb-2">
      <!-- Top row: Title, Search Box, Filter Button -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold mb-2 sm:mb-0">P2E Spells</h1>
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <!-- Shortened Search Box -->
          <input type="text" id="searchInput" class="w-full sm:w-64 p-2 border rounded" placeholder="Search spells..." />
          <!-- Filter Button -->
          <button id="filterBtn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Filter
          </button>
        </div>
      </div>
      <!-- Second row: Active Filters Display -->
      <div id="activeFilterDisplay" class="mt-2 flex flex-wrap gap-2"></div>
    </header>
    
    <!-- Filter Modal -->
    <div id="filterModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Filter Options</h2>
          <button id="closeFilterBtn" class="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div class="space-y-4">
          <!-- Class Dropdown -->
          <div>
            <label for="classSelect" class="block mb-2 text-sm font-medium">Class</label>
            <select id="classSelect" class="w-full p-2 border rounded">
              <!-- Options populated via JavaScript -->
            </select>
          </div>
          <!-- Association Dropdown (conditionally shown) -->
          <div id="associationContainer" style="display: none;">
            <label for="associationSelect" class="block mb-2 text-sm font-medium">Association</label>
            <select id="associationSelect" class="w-full p-2 border rounded">
              <option value="All">All</option>
            </select>
          </div>
          <!-- Max Level Dropdown -->
          <div>
            <label for="maxLevelSelect" class="block mb-2 text-sm font-medium">Max Level</label>
            <select id="maxLevelSelect" class="w-full p-2 border rounded">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>
          <!-- Actions Dropdown -->
          <div>
            <label for="actionsSelect" class="block mb-2 text-sm font-medium">Actions</label>
            <select id="actionsSelect" class="w-full p-2 border rounded">
              <option value="All">All</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <!-- Range Dropdown (ordered logically) -->
          <div>
            <label for="rangeSelect" class="block mb-2 text-sm font-medium">Range</label>
            <select id="rangeSelect" class="w-full p-2 border rounded">
              <option value="All">All</option>
              <option value="touch">touch</option>
              <option value="5 feet">5 feet</option>
              <option value="10 feet">10 feet</option>
              <option value="30 feet">30 feet</option>
              <option value="60 feet">60 feet</option>
              <option value="100 feet">100 feet</option>
              <option value="120 feet">120 feet</option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button id="applyFilterBtn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Apply
          </button>
        </div>
      </div>
    </div>
    
    <!-- Spell Detail Modal -->
    <div id="spellModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 id="spellTitle" class="text-2xl font-semibold"></h2>
              <div id="spellLevel" class="text-gray-600"></div>
              <div id="spellActions" class="mt-2"></div>
            </div>
            <button id="closeSpellBtn" class="text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-3 py-1">
              Close
            </button>
          </div>
          <div id="spellDetails" class="space-y-4"></div>
        </div>
      </div>
    </div>
    
    <!-- Main Content (Spells List) -->
    <main id="spellContainer" class="space-y-4">
      <div class="text-center py-8 text-gray-600">Loading spells...</div>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>
