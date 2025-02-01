// src/components/SpellDatabase.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

const SpellDatabase = () => {
    const [spells, setSpells] = useState([]);
    const [filteredSpells, setFilteredSpells] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedSpell, setSelectedSpell] = useState(null);
    const [expandedLevel, setExpandedLevel] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        type: 'All',
        sort: 'Level',
        actions: 'Any',
        traditions: ['Divine', 'Oracle']
    });

    useEffect(() => {
        const fetchSpells = async () => {
            try {
                const response = await fetch('https://raw.githubusercontent.com/davidaerne/OracleSpells/76953dbcbc7738dbfc8352de3165b315a63312ea/spells.json');
                if (!response.ok) throw new Error('Failed to fetch spells');
                const data = await response.json();
                setSpells(data);
                setFilteredSpells(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchSpells();
    }, []);

    const isCantrip = (spell) => {
        const traitsLower = (spell.traits || []).map(t => t.toLowerCase());
        const typeLower = (spell.type || '').toLowerCase();
        return traitsLower.includes('cantrip') || typeLower === 'cantrip';
    };

    const getSpellLevel = (spell) => {
        if (isCantrip(spell)) return 0;
        const num = parseInt(spell.level, 10);
        return isNaN(num) ? -1 : num;
    };

    const applyFilters = () => {
        let filtered = spells.filter(spell => {
            const traditions = (spell.traditions || []).map(t => t.toLowerCase());
            const traits = (spell.traits || []).map(t => t.toLowerCase());
            const combined = [...traditions, ...traits];

            // Filter by selected traditions
            if (!combined.some(t => filters.traditions.map(f => f.toLowerCase()).includes(t))) {
                return false;
            }

            // Type filter
            if (filters.type === 'Cantrip' && !isCantrip(spell)) return false;
            if (filters.type === 'Spell' && isCantrip(spell)) return false;

            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const inName = spell.name.toLowerCase().includes(searchLower);
                const inTraits = traits.some(t => t.includes(searchLower));
                if (!inName && !inTraits) return false;
            }

            return true;
        });

        // Sort
        if (filters.sort === 'Level') {
            filtered.sort((a, b) => getSpellLevel(a) - getSpellLevel(b));
        } else {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        setFilteredSpells(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [filters, spells]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Pathfinder 2E Spells</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Filter size={18} />
                            Filter
                        </button>
                        <button
                            onClick={() => {
                                setFilters({
                                    search: '',
                                    type: 'All',
                                    sort: 'Level',
                                    actions: 'Any',
                                    traditions: ['Divine', 'Oracle']
                                });
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {loading && (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <div className="text-lg text-gray-600">Loading spells...</div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Error loading spells: {error}
                    </div>
                )}

                {!loading && !error && filteredSpells.length === 0 && (
                    <div className="text-center py-8 text-gray-600">
                        No spells found matching your criteria
                    </div>
                )}

                {!loading && !error && filteredSpells.length > 0 && (
                    <div className="space-y-4">
                        {Object.entries(
                            filteredSpells.reduce((acc, spell) => {
                                const level = getSpellLevel(spell);
                                if (!acc[level]) acc[level] = [];
                                acc[level].push(spell);
                                return acc;
                            }, {})
                        )
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([level, levelSpells]) => (
                                <div key={level} className="bg-white rounded-lg shadow">
                                    <button
                                        className="w-full p-4 text-left font-semibold flex justify-between items-center"
                                        onClick={() => setExpandedLevel(expandedLevel === level ? null : level)}
                                    >
                                        <span>{level === '0' ? 'Cantrips' : `Level ${level}`}</span>
                                        <span>{levelSpells.length} spells</span>
                                    </button>
                                    {expandedLevel === level && (
                                        <div className="divide-y">
                                            {levelSpells.map((spell, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-4 hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => setSelectedSpell(spell)}
                                                >
                                                    <div className="font-medium">{spell.name}</div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {spell.traits?.join(', ')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </main>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Filter Spells</h2>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) =>
                                            setFilters({ ...filters, search: e.target.value })
                                        }
                                        className="w-full p-2 border rounded"
                                        placeholder="Search by name or trait"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) =>
                                            setFilters({ ...filters, type: e.target.value })
                                        }
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="All">All</option>
                                        <option value="Spell">Spells</option>
                                        <option value="Cantrip">Cantrips</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sort}
                                        onChange={(e) =>
                                            setFilters({ ...filters, sort: e.target.value })
                                        }
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="Level">Level</option>
                                        <option value="Name">Name</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Spell Detail Modal */}
            {selectedSpell && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-semibold">{selectedSpell.name}</h2>
                                    <div className="text-gray-600">
                                        {getSpellLevel(selectedSpell) === 0
                                            ? 'Cantrip'
                                            : `Level ${selectedSpell.level}`}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedSpell(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="font-semibold">Traits</div>
                                    <div>{selectedSpell.traits?.join(', ')}</div>
                                </div>

                                {selectedSpell.cast && (
                                    <div>
                                        <div className="font-semibold">Cast</div>
                                        <div>{selectedSpell.cast}</div>
                                    </div>
                                )}

                                {selectedSpell.range && (
                                    <div>
                                        <div className="font-semibold">Range</div>
                                        <div>{selectedSpell.range}</div>
                                    </div>
                                )}

                                {selectedSpell.targets && (
                                    <div>
                                        <div className="font-semibold">Targets</div>
                                        <div>{selectedSpell.targets}</div>
                                    </div>
                                )}

                                {selectedSpell['saving throw'] && (
                                    <div>
                                        <div className="font-semibold">Saving Throw</div>
                                        <div>{selectedSpell['saving throw']}</div>
                                    </div>
                                )}

                                <div>
                                    <div className="font-semibold">Description</div>
                                    <div className="whitespace-pre-wrap">
                                        {selectedSpell.description}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpellDatabase;