// src/components/SpellDatabase.jsx
import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

const SpellDatabase = () => {
  const [spells, setSpells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpells = async () => {
      try {
        console.log('Fetching spells...');
        setLoading(true);
        const response = await fetch('https://raw.githubusercontent.com/davidaerne/OracleSpells/76953dbcbc7738dbfc8352de3165b315a63312ea/spells.json');
        console.log('Fetch response:', response.ok);
        if (!response.ok) throw new Error('Failed to fetch spells');
        const data = await response.json();
        console.log('Spells loaded:', data.length);
        setSpells(data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSpells();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Debug Info */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h1 className="text-2xl font-bold mb-2">Debug Info</h1>
        <p>Loading: {loading.toString()}</p>
        <p>Error: {error || 'None'}</p>
        <p>Spells Count: {spells.length}</p>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center text-xl">Loading spells...</div>
      ) : error ? (
        <div className="text-red-500 text-center text-xl">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Spells ({spells.length})</h2>
          <ul>
            {spells.slice(0, 5).map((spell, index) => (
              <li key={index} className="mb-2">
                {spell.name} - Level {spell.level}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SpellDatabase;
