import type { GlucoseReading } from '@/types';

export interface CsvGlucoseImport {
  readings: GlucoseReading[];
  rejectedRows: number[];
}

function parseRows(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && source[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((cell) => cell.trim())) {
        rows.push(row);
        if (rows.length > 10001) throw new Error('CSV files may contain at most 10,000 data rows.');
      }
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error('The CSV contains an unclosed quoted field.');
  row.push(field);
  if (row.some((cell) => cell.trim())) {
    rows.push(row);
    if (rows.length > 10001) throw new Error('CSV files may contain at most 10,000 data rows.');
  }
  return rows;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function parseReadingTimestamp(value: string): string | null {
  const date = new Date(value.trim());
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export function parseGlucoseCsv(source: string): CsvGlucoseImport {
  if (source.length > 5 * 1024 * 1024) throw new Error('CSV files must be 5 MB or smaller.');
  const rows = parseRows(source.replace(/^\uFEFF/, ''));
  if (rows.length < 2) throw new Error('The CSV must include a header row and at least one data row.');

  const headers = rows[0].map(normalizeHeader);
  const valueIndex = headers.findIndex((header) =>
    [
      'glucose',
      'value',
      'sgv',
      'bloodglucose',
      'historicglucose',
      'glucosemgdl',
      'glucosemmoll',
      'glucose(mg/dl)',
      'glucose(mmol/l)',
      'historicglucose(mg/dl)',
      'historicglucose(mmol/l)',
    ].includes(header)
  );
  const timestampIndex = headers.findIndex((header) =>
    ['timestamp', 'datetime', 'dateandtime', 'datetimeutc'].includes(header)
  );
  const dateIndex = headers.findIndex((header) => header === 'date');
  const timeIndex = headers.findIndex((header) => header === 'time');
  const unitIndex = headers.findIndex((header) => ['unit', 'units'].includes(header));
  if (valueIndex < 0 || (timestampIndex < 0 && dateIndex < 0)) {
    throw new Error('Include a glucose/value column and a timestamp or date column in the CSV header.');
  }

  const readings: GlucoseReading[] = [];
  const rejectedRows: number[] = [];
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const rawValue = Number(row[valueIndex]?.trim());
    const rawUnit = unitIndex >= 0
      ? row[unitIndex]?.trim().toLowerCase()
      : headers[valueIndex].includes('mmol')
        ? 'mmol/l'
        : 'mg/dl';
    const timestampText = timestampIndex >= 0
      ? row[timestampIndex] ?? ''
      : timeIndex >= 0 && row[timeIndex]?.trim()
        ? `${row[dateIndex] ?? ''}T${row[timeIndex]}`
        : row[dateIndex] ?? '';
    const timestamp = parseReadingTimestamp(timestampText);
    if (!timestamp || !Number.isFinite(rawValue)) {
      rejectedRows.push(index + 1);
      continue;
    }
    if (rawUnit && !['mg/dl', 'mgdl', 'mmol/l', 'mmol'].includes(rawUnit)) {
      rejectedRows.push(index + 1);
      continue;
    }
    const value = Math.round(
      rawUnit === 'mmol/l' || rawUnit === 'mmol' ? rawValue * 18.0182 : rawValue
    );
    if (value < 20 || value > 600) {
      rejectedRows.push(index + 1);
      continue;
    }
    const timeLabel = new Date(timestamp).toLocaleString();
    readings.push({
      id: `csv-${Date.parse(timestamp)}-${value}`,
      timestamp,
      timeLabel,
      value,
      unit: 'mg/dL',
      source: 'manual',
      isDemo: false,
    });
  }

  if (readings.length === 0) throw new Error('No valid glucose readings were found in this CSV.');
  return { readings, rejectedRows };
}
