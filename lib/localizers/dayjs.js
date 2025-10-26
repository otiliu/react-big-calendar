'use strict'

var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = _default
exports.formats = void 0
var _slicedToArray2 = _interopRequireDefault(
  require('@babel/runtime/helpers/slicedToArray')
)
var _localizer = require('../localizer')
var _isBetween = _interopRequireDefault(require('dayjs/plugin/isBetween'))
var _isSameOrAfter = _interopRequireDefault(
  require('dayjs/plugin/isSameOrAfter')
)
var _isSameOrBefore = _interopRequireDefault(
  require('dayjs/plugin/isSameOrBefore')
)
var _localeData = _interopRequireDefault(require('dayjs/plugin/localeData'))
var _localizedFormat = _interopRequireDefault(
  require('dayjs/plugin/localizedFormat')
)
var _minMax = _interopRequireDefault(require('dayjs/plugin/minMax'))
var _utc = _interopRequireDefault(require('dayjs/plugin/utc'))
var _isLeapYear = _interopRequireDefault(require('dayjs/plugin/isLeapYear'))
// import dayjs plugins

var weekRangeFormat = function weekRangeFormat(_ref, culture, local) {
  var start = _ref.start,
    end = _ref.end
  return (
    local.format(start, 'MMMM DD', culture) +
    ' – ' +
    local.format(end, local.eq(start, end, 'month') ? 'DD' : 'MMMM DD', culture)
  )
}
var dateRangeFormat = function dateRangeFormat(_ref2, culture, local) {
  var start = _ref2.start,
    end = _ref2.end
  return (
    local.format(start, 'L', culture) + ' – ' + local.format(end, 'L', culture)
  )
}
var timeRangeFormat = function timeRangeFormat(_ref3, culture, local) {
  var start = _ref3.start,
    end = _ref3.end
  return (
    local.format(start, 'LT', culture) +
    ' – ' +
    local.format(end, 'LT', culture)
  )
}
var timeRangeStartFormat = function timeRangeStartFormat(
  _ref4,
  culture,
  local
) {
  var start = _ref4.start
  return local.format(start, 'LT', culture) + ' – '
}
var timeRangeEndFormat = function timeRangeEndFormat(_ref5, culture, local) {
  var end = _ref5.end
  return ' – ' + local.format(end, 'LT', culture)
}
var formats = (exports.formats = {
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
})
function fixUnit(unit) {
  var datePart = unit ? unit.toLowerCase() : unit
  if (datePart === 'fullyear') datePart = 'year'
  if (!datePart) datePart = undefined
  return datePart
}
function _default(dayjsLib) {
  // load plugins
  dayjsLib.extend(_isBetween.default)
  dayjsLib.extend(_isSameOrAfter.default)
  dayjsLib.extend(_isSameOrBefore.default)
  dayjsLib.extend(_localeData.default)
  dayjsLib.extend(_localizedFormat.default)
  dayjsLib.extend(_minMax.default)
  dayjsLib.extend(_utc.default)
  dayjsLib.extend(_isLeapYear.default)
  var locale = function locale(dj, c) {
    return c ? dj.locale(c) : dj
  }
  var dayjs = dayjsLib.tz ? dayjsLib.tz : dayjsLib
  function getTimezoneOffset(date) {
    return dayjs(date).toDate().getTimezoneOffset()
  }
  function getDstOffset(start, end) {
    var _st$tz$$x$$timezone
    var st = dayjs(start)
    var ed = dayjs(end)
    if (!dayjs.tz) {
      return st.toDate().getTimezoneOffset() - ed.toDate().getTimezoneOffset()
    }
    var tzName =
      (_st$tz$$x$$timezone = st.tz().$x.$timezone) !== null &&
      _st$tz$$x$$timezone !== void 0
        ? _st$tz$$x$$timezone
        : dayjsLib.tz.guess()
    var startOffset = -dayjs.tz(+st, tzName).utcOffset()
    var endOffset = -dayjs.tz(+ed, tzName).utcOffset()
    return startOffset - endOffset
  }

  /*** DATE ARITHMETIC HELPERS ***/
  function defineComparators(a, b, unit) {
    var datePart = fixUnit(unit)
    var dtA = datePart ? dayjs(a).startOf(datePart) : dayjs(a)
    var dtB = datePart ? dayjs(b).startOf(datePart) : dayjs(b)
    return [dtA, dtB, datePart]
  }
  function startOf() {
    var date =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null
    var unit = arguments.length > 1 ? arguments[1] : undefined
    var datePart = fixUnit(unit)
    return datePart
      ? dayjs(date).startOf(datePart).toDate()
      : dayjs(date).toDate()
  }
  function endOf() {
    var date =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null
    var unit = arguments.length > 1 ? arguments[1] : undefined
    var datePart = fixUnit(unit)
    return datePart
      ? dayjs(date).endOf(datePart).toDate()
      : dayjs(date).toDate()
  }
  function eq(a, b, unit) {
    var datePart = fixUnit(unit)
    if (datePart === 'month') {
      return (
        dayjs(a).year() === dayjs(b).year() &&
        dayjs(a).month() === dayjs(b).month()
      )
    }
    if (datePart === 'year') {
      return dayjs(a).year() === dayjs(b).year()
    }
    var _defineComparators = defineComparators(a, b, unit),
      _defineComparators2 = (0, _slicedToArray2.default)(_defineComparators, 2),
      dtA = _defineComparators2[0],
      dtB = _defineComparators2[1]
    return dtA.isSame(dtB, datePart)
  }
  function neq(a, b, unit) {
    return !eq(a, b, unit)
  }
  function gt(a, b, unit) {
    var _defineComparators3 = defineComparators(a, b, unit),
      _defineComparators4 = (0, _slicedToArray2.default)(
        _defineComparators3,
        3
      ),
      dtA = _defineComparators4[0],
      dtB = _defineComparators4[1],
      datePart = _defineComparators4[2]
    return dtA.isAfter(dtB, datePart)
  }
  function lt(a, b, unit) {
    var _defineComparators5 = defineComparators(a, b, unit),
      _defineComparators6 = (0, _slicedToArray2.default)(
        _defineComparators5,
        3
      ),
      dtA = _defineComparators6[0],
      dtB = _defineComparators6[1],
      datePart = _defineComparators6[2]
    return dtA.isBefore(dtB, datePart)
  }
  function gte(a, b, unit) {
    var _defineComparators7 = defineComparators(a, b, unit),
      _defineComparators8 = (0, _slicedToArray2.default)(
        _defineComparators7,
        3
      ),
      dtA = _defineComparators8[0],
      dtB = _defineComparators8[1],
      datePart = _defineComparators8[2]
    return dtA.isSameOrAfter(dtB, datePart)
  }
  function lte(a, b, unit) {
    var _defineComparators9 = defineComparators(a, b, unit),
      _defineComparators10 = (0, _slicedToArray2.default)(
        _defineComparators9,
        3
      ),
      dtA = _defineComparators10[0],
      dtB = _defineComparators10[1],
      datePart = _defineComparators10[2]
    return dtA.isSameOrBefore(dtB, datePart)
  }
  function inRange(day, min, max) {
    var unit =
      arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'day'
    var datePart = fixUnit(unit)
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
    var tm = dayjs(time).format('HH:mm:ss')
    var dt = dayjs(date).startOf('day').format('MM/DD/YYYY')
    return dayjsLib(''.concat(dt, ' ').concat(tm)).toDate()
  }
  function add(date, adder, unit) {
    return dayjs(date).add(adder, fixUnit(unit)).toDate()
  }
  function range(start, end) {
    var unit =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'day'
    var datePart = fixUnit(unit)
    var current = dayjs(start).startOf(datePart)
    var days = []
    while (current.isSameOrBefore(dayjs(end), datePart)) {
      days.push(current.toDate())
      current = current.add(1, datePart)
    }
    return days
  }
  function ceil(date, unit) {
    var floor = startOf(date, unit)
    return eq(floor, date) ? floor : add(floor, 1, unit)
  }
  function diff(a, b) {
    var unit =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'day'
    return dayjs(b).diff(dayjs(a), fixUnit(unit))
  }
  function minutes(date) {
    return dayjs(date).minutes()
  }
  function firstOfWeek(culture) {
    var data = culture ? dayjsLib.localeData(culture) : dayjsLib.localeData()
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
    var current = dayjs(date).startOf('month').startOf('week').startOf('day')
    var last = dayjs(date).endOf('month').endOf('week').startOf('day')
    var days = []
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
    var startMinutes = getMinutesFromMidnight(start)
    var endMinutes = getMinutesFromMidnight(end)
    var dayDiff = diff(start, end, 'day')
    return dayDiff * 1440 + (endMinutes - startMinutes)
  }
  function getMinutesFromMidnight(start) {
    var d = dayjs(start)
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
  function sortEvents(_ref6) {
    var _ref6$evtA = _ref6.evtA,
      aStart = _ref6$evtA.start,
      aEnd = _ref6$evtA.end,
      aAllDay = _ref6$evtA.allDay,
      _ref6$evtB = _ref6.evtB,
      bStart = _ref6$evtB.start,
      bEnd = _ref6$evtB.end,
      bAllDay = _ref6$evtB.allDay
    var startSort = +startOf(aStart, 'day') - +startOf(bStart, 'day')
    var durA = daySpan(aStart, aEnd)
    var durB = daySpan(bStart, bEnd)
    return (
      startSort ||
      durB - durA ||
      !!bAllDay - !!aAllDay ||
      +aStart - +bStart ||
      +aEnd - +bEnd
    )
  }

  /*** FIXED inEventRange ***/
  function inEventRange(_ref7) {
    var _ref7$event = _ref7.event,
      start = _ref7$event.start,
      end = _ref7$event.end,
      _ref7$range = _ref7.range,
      rangeStart = _ref7$range.start,
      rangeEnd = _ref7$range.end
    var s = dayjs(start)
    var e = dayjs(end)
    var rS = dayjs(rangeStart).startOf('day')
    var rE = dayjs(rangeEnd).endOf('day')
    var overlaps =
      s.isSameOrBefore(rE, 'minute') && e.isSameOrAfter(rS, 'minute')
    return overlaps
  }
  function isSameDate(date1, date2) {
    return dayjs(date1).isSame(dayjs(date2), 'day')
  }
  function browserTZOffset() {
    var dt = new Date()
    var neg = /-/.test(dt.toString()) ? '-' : ''
    var dtOffset = dt.getTimezoneOffset()
    var comparator = Number(''.concat(neg).concat(Math.abs(dtOffset)))
    var mtOffset = dayjs().utcOffset()
    return mtOffset > comparator ? 1 : 0
  }
  return new _localizer.DateLocalizer({
    formats: formats,
    firstOfWeek: firstOfWeek,
    firstVisibleDay: firstVisibleDay,
    lastVisibleDay: lastVisibleDay,
    visibleDays: visibleDays,
    format: function format(value, _format, culture) {
      return locale(dayjs(value), culture).format(_format)
    },
    lt: lt,
    lte: lte,
    gt: gt,
    gte: gte,
    eq: eq,
    neq: neq,
    merge: merge,
    inRange: inRange,
    startOf: startOf,
    endOf: endOf,
    range: range,
    add: add,
    diff: diff,
    ceil: ceil,
    min: min,
    max: max,
    minutes: minutes,
    getSlotDate: getSlotDate,
    getTimezoneOffset: getTimezoneOffset,
    getDstOffset: getDstOffset,
    getTotalMin: getTotalMin,
    getMinutesFromMidnight: getMinutesFromMidnight,
    continuesPrior: continuesPrior,
    continuesAfter: continuesAfter,
    sortEvents: sortEvents,
    inEventRange: inEventRange,
    isSameDate: isSameDate,
    browserTZOffset: browserTZOffset,
  })
}
