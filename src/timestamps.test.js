import assert from 'node:assert/strict';
import test from 'node:test';
import { DateTime } from 'luxon';
import { generateTimestamps, parseWhen } from './timestamps.js';

test('parseWhen parses tomorrow relative to a fixed timezone reference', () => {
  const referenceNow = DateTime.fromObject(
    { year: 2026, month: 6, day: 2, hour: 14, minute: 30 },
    { zone: 'America/New_York' }
  );

  const result = parseWhen('tomorrow', 'America/New_York', referenceNow);

  assert.equal(result.error, undefined);
  assert.equal(result.dt.year, 2026);
  assert.equal(result.dt.month, 6);
  assert.equal(result.dt.day, 3);
  assert.equal(result.dt.zoneName, 'America/New_York');
});

test('parseWhen parses next Tuesday at 5pm', () => {
  const referenceNow = DateTime.fromObject(
    { year: 2026, month: 6, day: 1, hour: 10, minute: 0 },
    { zone: 'America/New_York' }
  );

  const result = parseWhen('next Tuesday at 5pm', 'America/New_York', referenceNow);

  assert.equal(result.error, undefined);
  assert.equal(result.dt.weekday, 2);
  assert.equal(result.dt.hour, 17);
  assert.equal(result.dt.minute, 0);
  assert.equal(result.dt.zoneName, 'America/New_York');
});

test('parseWhen returns a helpful error for nonsense input', () => {
  const result = parseWhen('banana phone', 'America/New_York');

  assert.match(result.error, /Could not understand/);
});

test('parseWhen defaults to America/New_York', () => {
  const referenceNow = DateTime.fromObject(
    { year: 2026, month: 6, day: 2, hour: 10, minute: 0 },
    { zone: 'America/New_York' }
  );

  const result = parseWhen('tomorrow at 3pm', undefined, referenceNow);

  assert.equal(result.error, undefined);
  assert.equal(result.dt.zoneName, 'America/New_York');
  assert.equal(result.dt.hour, 15);
});

test('generateTimestamps generates markdown for natural language input', () => {
  const referenceNow = DateTime.fromObject(
    { year: 2026, month: 6, day: 1, hour: 10, minute: 0 },
    { zone: 'UTC' }
  );

  const result = generateTimestamps({
    when: 'next Tuesday at 5pm',
    timezone: 'UTC',
    referenceNow
  });

  assert.match(result.content, /^Full date\/time:/);
  assert.match(result.content, /Copy this: `<t:\d+:F>`/);
  assert.match(result.content, /Preview \(UTC\): <t:\d+:F>/);
  assert.doesNotMatch(result.content, /Unix timestamp:/);
  assert.doesNotMatch(result.content, /Short time:/);
});

test('generateTimestamps uses full date and time format when selected', () => {
  const referenceNow = DateTime.fromObject(
    { year: 2026, month: 6, day: 1, hour: 10, minute: 0 },
    { zone: 'UTC' }
  );

  const result = generateTimestamps({
    when: 'next Tuesday at 5pm',
    format: 'full',
    timezone: 'UTC',
    referenceNow
  });

  assert.match(result.content, /^Full date\/time:/);
  assert.match(result.content, /Copy this: `<t:\d+:F>`/);
  assert.match(result.content, /Preview \(UTC\): <t:\d+:F>/);
});

test('generateTimestamps uses time-only format when selected', () => {
  const referenceNow = DateTime.fromObject(
    { year: 2026, month: 6, day: 1, hour: 10, minute: 0 },
    { zone: 'UTC' }
  );

  const result = generateTimestamps({
    when: 'next Tuesday at 5pm',
    format: 'time',
    timezone: 'UTC',
    referenceNow
  });

  assert.match(result.content, /^Time:/);
  assert.match(result.content, /Copy this: `<t:\d+:t>`/);
  assert.match(result.content, /Preview \(UTC\): <t:\d+:t>/);
  assert.doesNotMatch(result.content, /Full date\/time:/);
});

test('generateTimestamps requires natural language input', () => {
  const result = generateTimestamps({ timezone: 'UTC' });

  assert.match(result.content, /Invalid input/);
  assert.match(result.content, /Natural language time is required/);
  assert.match(result.content, /When: `tomorrow at 5pm`/);
});

test('generateTimestamps defaults preview label to America/New_York', () => {
  const referenceNow = DateTime.fromObject(
    { year: 2026, month: 6, day: 1, hour: 10, minute: 0 },
    { zone: 'America/New_York' }
  );

  const result = generateTimestamps({
    when: 'tomorrow at 1pm',
    referenceNow
  });

  assert.match(result.content, /Preview \(America\/New_York\): <t:\d+:F>/);
});

test('generateTimestamps returns invalid input for bad natural language input', () => {
  const result = generateTimestamps({ when: 'banana phone', timezone: 'UTC' });

  assert.match(result.content, /Invalid input/);
  assert.match(result.content, /Could not understand/);
});
