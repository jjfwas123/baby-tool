import { dateFormat, formatNumber, showLoading, hideLoading } from '../../utils/util'
const App = getApp()

Page({

  /**
   * 组件的初始数据
   */
  data: {
    weekDay: ['日', '一', '二', '三', '四', '五', '六'], // 星期
    weekDays: [], // 选中的当前一周的数据
    curdate: { // 选中的日期
      year: '', // 年
      month: '', // 月
      day: '', // 日
    },
    dateInfo: { // 显示的月份跟天数
      year: '', // 年
      month: '', // 月
      beginWeek: 0, // 这个月是星期几开始的
      days: 0 // 这个月一共多少天
    },
    minDateInfo: null, // 最小日期
    maxDateInfo: null, // 最大日期
    months: [], // 所有月的日期
    scrollView: '',
    yearMonth: '',
    showOneMonthDays: true,
    minDate: '',
    maxDate: '',
    year: '',
    record: {},
  },
  // 初始化
  init: function(){
    let date = (this.data.yearMonthData && this.data.yearMonthData + '-01') || new Date()
    let minDate = this.data.minDate
    let maxDate = this.data.maxDate
    let yearMonthData = dateFormat('YYYY-mm-dd', new Date(date))
    let dateInfo = this.getDisplayInfo(date)
    this.setData({
      yearMonthData: yearMonthData,
      dateInfo: dateInfo,
    },()=>{
      let weekDays = this.getWeekDays(date)
      let curdate = this.getCurDate(date)
      let minDateInfo = minDate ? this.getDisplayInfo(minDate) : null
      let maxDateInfo = maxDate ? this.getDisplayInfo(maxDate) : null
      let year = this.data.year || curdate.year
      this.setData({
        weekDays: weekDays,
        curdate: curdate,
        minDateInfo: minDateInfo,
        maxDateInfo: maxDateInfo
      })
      if(this.data.showAll && year){
        let months = this.getAllYear(year)
        this.setData({
          months: months
        })
      }
    })
  },
  // 是否传入的是日期
  getDate: function(date) {
    date = typeof(date)=='string' ? date.replace(/-/g,'/') : date
    let flag = date && new Date(date) != 'Invalid Date' ? true : false
    if(flag){
      return new Date(date)
    }
    return flag
  },
  // 是否为闰年
  isLeapYear: function(date){
    if (!this.getDate(date)) {
      return false
    }
    date = this.getDate(date)
    //传入为时间格式需要处理
    var year = date.getFullYear()
    if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) return true
    return false
  },
  // 获取某月天数
  getDaysOfMonth: function(date) {
    if (!this.getDate(date)) {
      return false
    }
    date = this.getDate(date)
    var month = date.getMonth(); // 注意此处月份要加1，在此作为的下标，因此不用加1
    return [31, this.isLeapYear(date) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
  },
  // 获取某月的第一天是星期几
  getBeginDayOfMouth: function(date) {
    if (!this.getDate(date)) {
      return false
    }
    date = this.getDate(date)
    var month = date.getMonth() + 1
    var year = date.getFullYear()
    var d = new Date(`${year}/${month}/1`)
    return d.getDay()
  },
  // 获取当前一周的日期
  getWeekDays: function(date){
    if (!this.getDate(date)) {
      return false
    }
    let dateInfo = this.data.dateInfo
    date = this.getDate(date)
    var day = date.getDate()
    var week = date.getDay()
    var weekDays = []
    for(var i = 0; i < 7; i++){
      if(i < week){
        if(day - (week - i) > 0){
          weekDays.push(day - (week - i))
        }else{
          weekDays.push('')
        }
      } else if(i == week){
        weekDays.push(day)
      } else {
        if(day + (i - week) <= dateInfo.days){
          weekDays.push(day + (i - week))
        }
      }
    }
    return weekDays
  },
  // 获取当前选中的日期
  getCurDate: function(date){
    if (!this.getDate(date)) {
      return false
    }
    date = this.getDate(date)
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return {
      year: Number(year),
      month: formatNumber(month),
      day: Number(day)
    }
  },
  // 获取某一年的日期
  getAllYear: function(year){
    let months = []
    for(var i = 1; i <= 12; i++){
      let monthDays = this.getDisplayInfo(`${year}-${i}-1`)
      months.push(monthDays)
    }
    return months
  },
  // 总方法
  getDisplayInfo: function(date) {
    if (!this.getDate(date)) {
      return false
    }
    date = this.getDate(date)
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    // 这个月一共多少天
    var days = this.getDaysOfMonth(date)
    // 这个月是星期几开始的
    var beginWeek = this.getBeginDayOfMouth(date)
    var dateInfo = {
      year: Number(year),
      month: formatNumber(month),
      day: Number(day),
      days: Number(days),
      beginWeek: Number(beginWeek)
    }
    return dateInfo
  },
  // 滑动数据
  touchStart: function(e){
    let clientX = e.changedTouches[0].clientX
    this.setData({
      clientX: clientX
    })
  },
  touchEnd: function(e){
    let endX = e.changedTouches[0].clientX
    let clientX = this.data.clientX
    if(endX - clientX > 10){
      // 往左滑
      let dateInfo = this.data.dateInfo
      let year = dateInfo.year
      let month = Number(dateInfo.month)
      let minDateInfo = this.data.minDateInfo
      if(minDateInfo && (minDateInfo.year > year || (minDateInfo.year == year && minDateInfo.month >= month))) return false
      if(month <= 1){
        year = year - 1
        month = 12
      }else{
        month = month - 1
      }
      let date = new Date(`${year}/${month}/1`)
      let dateInfoNew = this.getDisplayInfo(date)
      this.setData({
        dateInfo: dateInfoNew
      })
    }else if(endX - clientX < -10){
      // 往右滑
      let dateInfo = this.data.dateInfo
      let year = dateInfo.year
      let month = Number(dateInfo.month)
      let maxDateInfo = this.data.maxDateInfo
      if(maxDateInfo && (maxDateInfo.year < year || (maxDateInfo.year == year && maxDateInfo.month <= month))) return false
      if(month < 12){
        month = month + 1
      }else{
        year = year + 1
        month = 1
      }
      let date = new Date(`${year}/${month}/1`)
      let dateInfoNew = this.getDisplayInfo(date)
      this.setData({
        dateInfo: dateInfoNew
      })
    }
    this.getDetail()
  },
  async getDetail() {
    showLoading()
    let ruleMonth = this.data.dateInfo.month, ruleYear = this.data.dateInfo.year
    let {result: [data]} = await App.request.get('/crm-sfa/v1/attendance/attendanceRecordMonth/calendar', {ruleMonth, ruleYear})
    data = data || {}
    let record = {
      1: data.day1,
      2: data.day2,
      3: data.day3,
      4: data.day4,
      5: data.day5,
      6: data.day6,
      7: data.day7,
      8: data.day8,
      9: data.day9,
      10: data.day10,
      11: data.day11,
      12: data.day12,
      13: data.day13,
      14: data.day14,
      15: data.day15,
      16: data.day16,
      17: data.day17,
      18: data.day18,
      19: data.day19,
      20: data.day20,
      21: data.day21,
      22: data.day22,
      23: data.day23,
      24: data.day24,
      25: data.day25,
      26: data.day26,
      27: data.day27,
      28: data.day28,
      29: data.day29,
      30: data.day30,
      31: data.day31,
    }
    this.setData({
      record
    })
    hideLoading()
  },
  pickerConfirm({currentTarget: {dataset: {key}}, detail: {value}}) {
    this.setData({
      [key]: value
    },)
    this.init()
    this.getDetail()
  },
  onLoad() {
    this.init()
    this.getDetail()
  },
})
