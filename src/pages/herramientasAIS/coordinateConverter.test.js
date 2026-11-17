import assert from 'node:assert/strict';
import test from 'node:test';
import {
  convertCoordinates,
  createOpenStreetMapEmbedUrl,
  parseCoordinate,
} from './coordinateConverter.js';

test('converts the provided MTU AIS-C DMS sample to Kanaton and common formats', () => {
  const result = convertCoordinates('34° 37\' 49.740" S', '58° 21\' 4.680" W');

  assert.ok(Math.abs(result.latitude - (-34.6304833333)) < 0.0000001);
  assert.ok(Math.abs(result.longitude - (-58.3513)) < 0.0000001);
  assert.equal(result.formats.find((format) => format.id === 'mtu').latitude, '34° 37\' 49.740" S');
  assert.equal(result.formats.find((format) => format.id === 'mtu').longitude, '58° 21\' 4.680" W');
  assert.equal(result.formats.find((format) => format.id === 'kanaton').latitude, '34° 37.829 S');
  assert.equal(result.formats.find((format) => format.id === 'kanaton').longitude, '58° 21.078 W');
});

test('accepts signed decimal, decimal comma, DDM, and colon-separated DMS input', () => {
  assert.ok(Math.abs(parseCoordinate('-34.6304833', 'latitude') - (-34.6304833)) < 0.0000001);
  assert.ok(Math.abs(parseCoordinate('34,6304833 S', 'latitude') - (-34.6304833)) < 0.0000001);
  assert.ok(Math.abs(parseCoordinate('34 37.829 S', 'latitude') - (-34.6304833)) < 0.0000001);
  assert.ok(Math.abs(parseCoordinate('W 58:21:4.680', 'longitude') - (-58.3513)) < 0.0000001);
  assert.ok(Math.abs(parseCoordinate('58° 21.078 Oeste', 'longitude') - (-58.3513)) < 0.0000001);
});

test('rejects invalid hemispheres, minute values, and coordinate ranges', () => {
  assert.throws(() => parseCoordinate('34° 20\' N', 'longitude'), /La longitud/);
  assert.throws(() => parseCoordinate('34 60.1 S', 'latitude'), /Los minutos y segundos/);
  assert.throws(() => parseCoordinate('91', 'latitude'), /excede el máximo/);
  assert.throws(() => parseCoordinate('-34 N', 'latitude'), /no coincide/);
});

test('creates a map embed URL with the converted point as its marker', () => {
  const url = new URL(createOpenStreetMapEmbedUrl(-34.6304833, -58.3513));

  assert.equal(url.origin, 'https://www.openstreetmap.org');
  assert.equal(url.pathname, '/export/embed.html');
  assert.equal(url.searchParams.get('marker'), '-34.63048330,-58.35130000');
  assert.equal(url.searchParams.get('layer'), 'mapnik');
});
