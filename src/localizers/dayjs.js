import { DateLocalizer } from '../localizer'

// import dayjs plugins
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import localeData from 'dayjs/plugin/localeData'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import minMax from 'dayjs/plugin/minMax'
import utc from 'dayjs/plugin/utc'
import isLeapYear from 'dayjs/plugin/isLeapYear'

const weekRangeFormat = ({ start, end }, culture, local) =>
  local.format(start, 'MMMM DD', culture) +
  ' – ' +
  local.format(end, local.eq(start, end, 'month') ? 'DD' : 'MMMM DD', culture)

const dateRangeFormat = ({ start, end }, culture, local) =>
  local.format(start, 'L', culture) + ' – ' + local.format(end, 'L', culture)

const timeRangeFormat = ({ start, end }, culture, local) =>
  local.format(start, 'LT', culture) + ' – ' + local.format(end, 'LT', culture)

const timeRangeStartFormat = ({ start }, culture, local) =>
  local.format(start, 'LT', culture) + ' – '

const timeRangeEndFormat = ({ end }, culture, local) =>
  ' – ' + local.format(end, 'LT', culture)

export const formats = {
  dateFormat: 'DD',
  dayFormat: 'DD ddd',
  weekdayFormat: 'ddd',

  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,

  timeGutterFormat: 'LT',

  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'dddd MMM DD',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,

  agendaDateFormat: 'ddd MMM DD',
  agendaTimeFormat: 'LT',
  agendaTimeRangeFormat: timeRangeFormat,
}

function fixUnit(unit) {
  let datePart = unit ? unit.toLowerCase() : unit
  if (datePart === 'fullyear') datePart = 'year'
  if (!datePart) datePart = undefined
  return datePart
}

export default function (dayjsLib) {
  // load plugins
  dayjsLib.extend(isBetween)
  dayjsLib.extend(isSameOrAfter)
  dayjsLib.extend(isSameOrBefore)
  dayjsLib.extend(localeData)
  dayjsLib.extend(localizedFormat)
  dayjsLib.extend(minMax)
  dayjsLib.extend(utc)
  dayjsLib.extend(isLeapYear)

  const locale = (dj, c) => (c ? dj.locale(c) : dj)
  const dayjs = dayjsLib.tz ? dayjsLib.tz : dayjsLib

  function getTimezoneOffset(date) {
    return dayjs(date).toDate().getTimezoneOffset()
  }

  function getDstOffset(start, end) {
    const st = dayjs(start)
    const ed = dayjs(end)
    if (!dayjs.tz) {
      return st.toDate().getTimezoneOffset() - ed.toDate().getTimezoneOffset()
    }
    const tzName = st.tz().$x.$timezone ?? dayjsLib.tz.guess()
    const startOffset = -dayjs.tz(+st, tzName).utcOffset()
    const endOffset = -dayjs.tz(+ed, tzName).utcOffset()
    return startOffset - endOffset
  }

  /*** DATE ARITHMETIC HELPERS ***/
  function defineComparators(a, b, unit) {
    const datePart = fixUnit(unit)
    const dtA = datePart ? dayjs(a).startOf(datePart) : dayjs(a)
    const dtB = datePart ? dayjs(b).startOf(datePart) : dayjs(b)
    return [dtA, dtB, datePart]
  }

  function startOf(date = null, unit) {
    const datePart = fixUnit(unit)
    return datePart
      ? dayjs(date).startOf(datePart).toDate()
      : dayjs(date).toDate()
  }

  function endOf(date = null, unit) {
    const datePart = fixUnit(unit)
    return datePart
      ? dayjs(date).endOf(datePart).toDate()
      : dayjs(date).toDate()
  }

  function eq(a, b, unit) {
    const datePart = fixUnit(unit)
    if (datePart === 'month') {
      return (
        dayjs(a).year() === dayjs(b).year() &&
        dayjs(a).month() === dayjs(b).month()
      )
    }
    if (datePart === 'year') {
      return dayjs(a).year() === dayjs(b).year()
    }
    const [dtA, dtB] = defineComparators(a, b, unit)
    return dtA.isSame(dtB, datePart)
  }

  function neq(a, b, unit) {
    return !eq(a, b, unit)
  }
  function gt(a, b, unit) {
    const [dtA, dtB, datePart] = defineComparators(a, b, unit)
    return dtA.isAfter(dtB, datePart)
  }
  function lt(a, b, unit) {
    const [dtA, dtB, datePart] = defineComparators(a, b, unit)
    return dtA.isBefore(dtB, datePart)
  }
  function gte(a, b, unit) {
    const [dtA, dtB, datePart] = defineComparators(a, b, unit)
    return dtA.isSameOrAfter(dtB, datePart)
  }
  function lte(a, b, unit) {
    const [dtA, dtB, datePart] = defineComparators(a, b, unit)
    return dtA.isSameOrBefore(dtB, datePart)
  }

  function inRange(day, min, max, unit = 'day') {
    const datePart = fixUnit(unit)
    return dayjs(day).isBetween(dayjs(min), dayjs(max), datePart, '[]')
  }

  function min(dateA, dateB) {
    return dayjsLib.min(dayjs(dateA), dayjs(dateB)).toDate()
  }
  function max(dateA, dateB) {
    return dayjsLib.max(dayjs(dateA), dayjs(dateB)).toDate()
  }

  function merge(date, time) {
    if (!date && !time) return null
    const tm = dayjs(time).format('HH:mm:ss')
    const dt = dayjs(date).startOf('day').format('MM/DD/YYYY')
    return dayjsLib(`${dt} ${tm}`).toDate()
  }

  function add(date, adder, unit) {
    return dayjs(date).add(adder, fixUnit(unit)).toDate()
  }

  function range(start, end, unit = 'day') {
    const datePart = fixUnit(unit)
    let current = dayjs(start).startOf(datePart)
    const days = []
    while (current.isSameOrBefore(dayjs(end), datePart)) {
      days.push(current.toDate())
      current = current.add(1, datePart)
    }
    return days
  }

  function ceil(date, unit) {
    const floor = startOf(date, unit)
    return eq(floor, date) ? floor : add(floor, 1, unit)
  }

  function diff(a, b, unit = 'day') {
    return dayjs(b).diff(dayjs(a), fixUnit(unit))
  }

  function minutes(date) {
    return dayjs(date).minutes()
  }

  function firstOfWeek(culture) {
    const data = culture ? dayjsLib.localeData(culture) : dayjsLib.localeData()
    return data ? data.firstDayOfWeek() : 0
  }

  /*** FIXED DAY/VISIBLE DAY GENERATION ***/
  function firstVisibleDay(date) {
    return dayjs(date).startOf('month').startOf('week').startOf('day').toDate()
  }

  function lastVisibleDay(date) {
    return dayjs(date).endOf('month').endOf('week').endOf('day').toDate()
  }

  function visibleDays(date) {
    let current = dayjs(date).startOf('month').startOf('week').startOf('day')
    const last = dayjs(date).endOf('month').endOf('week').startOf('day')
    const days = []
    while (current.isSameOrBefore(last, 'day')) {
      days.push(current.toDate())
      current = current.add(1, 'day').startOf('day')
    }
    return days
  }

  /*** SLOT / MINUTES ***/
  function getSlotDate(dt, minutesFromMidnight, offset) {
    return dayjs(dt)
      .startOf('day')
      .minute(minutesFromMidnight + offset)
      .toDate()
  }

  function getTotalMin(start, end) {
    const startMinutes = getMinutesFromMidnight(start)
    const endMinutes = getMinutesFromMidnight(end)
    const dayDiff = diff(start, end, 'day')
    return dayDiff * 1440 + (endMinutes - startMinutes)
  }

  function getMinutesFromMidnight(start) {
    const d = dayjs(start)
    return d.hour() * 60 + d.minute()
  }

  function continuesPrior(start, first) {
    return dayjs(start).isBefore(dayjs(first), 'day')
  }
  function continuesAfter(start, end, last) {
    return dayjs(end).isSameOrAfter(dayjs(last), 'minute')
  }

  function daySpan(start, end) {
    return dayjs(end).diff(dayjs(start), 'day')
  }

  function sortEvents({
    evtA: { start: aStart, end: aEnd, allDay: aAllDay },
    evtB: { start: bStart, end: bEnd, allDay: bAllDay },
  }) {
    const startSort = +startOf(aStart, 'day') - +startOf(bStart, 'day')
    const durA = daySpan(aStart, aEnd)
    const durB = daySpan(bStart, bEnd)
    return (
      startSort ||
      durB - durA ||
      !!bAllDay - !!aAllDay ||
      +aStart - +bStart ||
      +aEnd - +bEnd
    )
  }

  /*** FIXED inEventRange ***/
  function inEventRange({
    event: { start, end },
    range: { start: rangeStart, end: rangeEnd },
  }) {
    const s = dayjs(start)
    const e = dayjs(end)
    const rS = dayjs(rangeStart).startOf('day')
    const rE = dayjs(rangeEnd).endOf('day')

    const overlaps =
      s.isSameOrBefore(rE, 'minute') && e.isSameOrAfter(rS, 'minute')

    return overlaps
  }

  function isSameDate(date1, date2) {
    return dayjs(date1).isSame(dayjs(date2), 'day')
  }

  function browserTZOffset() {
    const dt = new Date()
    const neg = /-/.test(dt.toString()) ? '-' : ''
    const dtOffset = dt.getTimezoneOffset()
    const comparator = Number(`${neg}${Math.abs(dtOffset)}`)
    const mtOffset = dayjs().utcOffset()
    return mtOffset > comparator ? 1 : 0
  }

  return new DateLocalizer({
    formats,
    firstOfWeek,
    firstVisibleDay,
    lastVisibleDay,
    visibleDays,
    format(value, format, culture) {
      return locale(dayjs(value), culture).format(format)
    },
    lt,
    lte,
    gt,
    gte,
    eq,
    neq,
    merge,
    inRange,
    startOf,
    endOf,
    range,
    add,
    diff,
    ceil,
    min,
    max,
    minutes,
    getSlotDate,
    getTimezoneOffset,
    getDstOffset,
    getTotalMin,
    getMinutesFromMidnight,
    continuesPrior,
    continuesAfter,
    sortEvents,
    inEventRange,
    isSameDate,
    browserTZOffset,
  })
}
