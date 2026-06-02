import * as chrono from 'chrono-node';
import { DateTime } from 'luxon';

const DEFAULT_TIMEZONE = 'America/New_York';

const full_date_time_format = 'F';

function validateTimezone(timezone) {
  if (!timezone) {
    return 'Timezone is required';
  }

  if (!DateTime.local().setZone(timezone).isValid) {
    return `Invalid timezone "${timezone}". Use a valid IANA timezone like America/New_York or UTC.`;
  }

  return null;
}

function invalidInput(errors, examples = [
  '- When: `tomorrow at 5pm`',
  '- When: `next Tuesday`',
  '- When: `in 3 hours`',
  '- Timezone: `America/New_York`'
]) {
  return {
    content: [
      '**Invalid input**',
      '',
      ...errors.map(error => `- ${error}`),
      '',
      '**Examples:**',
      ...examples
    ].join('\n')
  };
}

function formatTimestampOutput(dt, timezone) {
  const unixSeconds = Math.floor(dt.toSeconds());

  return {
    content: [
      'Full date/time:',
      `Copy this: \`<t:${unixSeconds}:${full_date_time_format}>\``,
      `Preview (${timezone}): <t:${unixSeconds}:${full_date_time_format}>`
    ].join('\n')
  };
}

export function parseWhen(when, timezone = DEFAULT_TIMEZONE, referenceNow = null) {
  const effectiveTimezone = timezone || DEFAULT_TIMEZONE;
  const timezoneError = validateTimezone(effectiveTimezone);

  if (timezoneError) {
    return { error: timezoneError };
  }

  const trimmedWhen = when?.trim();

  if (!trimmedWhen) {
    return { error: 'Natural language time is required' };
  }

  const nowInZone = referenceNow
    ? referenceNow.setZone(effectiveTimezone)
    : DateTime.now().setZone(effectiveTimezone);

  const referenceDate = new Date(
    nowInZone.year,
    nowInZone.month - 1,
    nowInZone.day,
    nowInZone.hour,
    nowInZone.minute,
    nowInZone.second,
    nowInZone.millisecond
  );

  const results = chrono.parse(trimmedWhen, referenceDate, { forwardDate: true });

  if (!results.length) {
    return { error: `Could not understand "${trimmedWhen}". Try phrases like "tomorrow at 5pm" or "next Tuesday".` };
  }

  const parsed = results[0].start;
  const dt = DateTime.fromObject({
    year: parsed.get('year'),
    month: parsed.get('month'),
    day: parsed.get('day'),
    hour: parsed.get('hour'),
    minute: parsed.get('minute'),
    second: parsed.get('second'),
    millisecond: 0
  }, { zone: effectiveTimezone });

  if (!dt.isValid) {
    return { error: `Could not create a valid date from "${trimmedWhen}".` };
  }

  return { dt };
}

export function generateTimestamps({ timezone, when, referenceNow } = {}) {
  const effectiveTimezone = timezone || DEFAULT_TIMEZONE;

  if (when) {
    const result = parseWhen(when, effectiveTimezone, referenceNow);

    if (result.error) {
      return invalidInput([result.error], [
        '- When: `tomorrow at 5pm`',
        '- When: `next Tuesday`',
        '- When: `in 3 hours`',
        '- Timezone: `America/New_York`'
      ]);
    }

    return formatTimestampOutput(result.dt, effectiveTimezone);
  }

  return invalidInput(['Natural language time is required'], [
    '- When: `tomorrow at 5pm`',
    '- When: `next Tuesday`',
    '- When: `in 3 hours`',
    '- Timezone: `America/New_York`'
  ]);
}
