// Script to generate preset mountain data from CSV
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'Mountain Achievement - Mountain.csv');
const raw = fs.readFileSync(csvPath, 'utf-8');
const lines = raw.split('\n').map(l => l.trim()).filter(l => l);

// Skip header rows (lines 0 and 1)
const dataLines = lines.slice(2);

const mountains = [];

for (const line of dataLines) {
  // Parse CSV properly (handle commas in fields)
  const cols = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      cols.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cols.push(current);

  const num = cols[0];
  const name = cols[1];
  const lat = cols[2];
  const lng = cols[3];
  const category = cols[5];
  const elevation = cols[6];
  const climbDate = cols[7];
  const flag = cols[8];

  // Skip empty rows and non-300 mountains
  if (!name || !lat || !lng) continue;
  if (!['百名山', '二百名山', '三百名山'].includes(category)) continue;

  const numVal = parseInt(num);
  if (isNaN(numVal) || numVal < 1 || numVal > 301) continue;

  // Map category
  let appCategory;
  if (category === '百名山') appCategory = '百名山';
  else if (category === '二百名山') appCategory = '二百名山';
  else if (category === '三百名山') appCategory = '三百名山';
  else continue;

  const isClimbed = flag === '●';

  // Normalize date format
  let normalizedDate = null;
  if (isClimbed && climbDate) {
    const d = climbDate.replace(/\//g, '-').trim();
    // Handle formats like "2022/09/18", "2021/6/24", "2023-07-09"
    const parts = d.split('-');
    if (parts.length === 3) {
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const dd = parts[2].padStart(2, '0');
      normalizedDate = `${y}-${m}-${dd}`;
    }
  }

  mountains.push({
    name,
    elevation: parseInt(elevation) || 0,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    category: appCategory,
    isClimbed,
    climbDate: normalizedDate,
  });
}

console.log(`Total mountains: ${mountains.length}`);
console.log(`百名山: ${mountains.filter(m => m.category === '百名山').length}`);
console.log(`二百名山: ${mountains.filter(m => m.category === '二百名山').length}`);
console.log(`三百名山: ${mountains.filter(m => m.category === '三百名山').length}`);
console.log(`Climbed: ${mountains.filter(m => m.isClimbed).length}`);

// Generate TypeScript file
const tsContent = `import type { Mountain } from '../types/index.ts';

/** 日本百名山・二百名山・三百名山 全301座プリセットデータ */
export const PRESET_MOUNTAINS: Omit<Mountain, 'id' | 'createdAt' | 'updatedAt'>[] = ${JSON.stringify(mountains.map(m => ({
  name: m.name,
  elevation: m.elevation,
  lat: m.lat,
  lng: m.lng,
  category: m.category,
  isClimbed: m.isClimbed,
  climbDate: m.climbDate,
  notes: '',
  gpxTrackIds: [],
})), null, 2)};
`;

const outPath = path.join(__dirname, 'src', 'data', 'preset-mountains.ts');
fs.writeFileSync(outPath, tsContent, 'utf-8');
console.log(`Written to ${outPath}`);
