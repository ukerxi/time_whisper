// 通用工具类
const formatTime = date => {
  // 时间格式化
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDay = date => {
  // 时间格式化
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return month + '月' + day + '日'
}

const formatNumber = n => {
  // 数字 小于 10 的 添加 0开头
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatDate(date, format) {
  /*
   * format="yyyy-MM-dd hh:mm:ss";
   */
  if (!format) {
    format = 'yyyy-MM-dd';
  }
  date = date || new Date()
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    "S": date.getMilliseconds()
  }

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 -
      RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
        o[k] :
        ("00" + o[k]).substr(("" + o[k]).length))
    }
  }
  return format
}

function getPlusDate(num, dayStr) {
  // 获取前后几天的日期
  var _num = parseInt(num) || 0
  var _limit = _num * 24 * 60 * 60 * 1000
  var _date = new Date()
  var _times = 0
  var _startDate = {}
  if (dayStr) {
    _startDate.month = dayStr.substring(5, dayStr.lastIndexOf('-'))
    _startDate.day = dayStr.substring(dayStr.length, dayStr.lastIndexOf('-') + 1)
    _startDate.year = dayStr.substring(0, dayStr.indexOf('-'))
    _times = Date.parse(_startDate.month + '/' + _startDate.day + '/' + _startDate.year) + _limit
  } else {
    _times = _date.getTime() + _limit
  }
  // 返回date格式
  return new Date(_times)
}

function getDay(date) {
  // 获取周几
  var _list = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  var _date = date || new Date()
  // 返回date格式
  return _list[_date.getDay()]
}

function showToast(param) {
  // 弹框显示
  var _param = {}
  if (typeof param === 'string') {
    _param.title = param
  } else {
    _param = param || {}
  }
  wx.showToast({
    title: _param.title || '操作成功！',
    icon: _param.icon || 'none',
    duration: _param.duration || 3000,
    complete: function () {
      setTimeout(function () {
        wx.hideToast()
        // 执行回调
        if (_param.callback) {
          _param.callback()
        }
      }, param.duration || 2500)
    }
  })
}

function showModal(param) {
  // 弹框显示
  var _param = param || {}
  wx.showModal({
    title: _param.title || '',
    content: _param.content || '',
    showCancel: (typeof _param.showCancel !== 'undefined') ? _param.showCancel : true,
    cancelText: _param.cancelText || '取消',
    cancelColor: _param.cancelColor || '#222222',
    confirmText: _param.confirmText || '确定',
    confirmColor: _param.confirmColor || '#ff4a39',
    success(res) {
      if (_param.success) {
        _param.success(res)
      }
    }
  })
}

function checkPhone(phone) {
  // 校验手机号
  var _phone = phone || ''
  var status = true
  if (!(/^1(2|3|4|5|6|7|8|9)\d{9}$/.test(phone))) {
    status = false
  }
  return status
}

function queryStr(params) {
  // 返回查询字符串
  var _str = ''
  for (var key in params) {
    if (_str) {
      _str = _str + '&' + key + '=' + params[key]
    } else {
      _str = '?' + key + '=' + params[key]
    }
  }
  return _str
}

/**
 * js截取字符串，中英文都能用
 * @param str：需要截取的字符串
 * @param len: 需要截取的长度
 */
 function cutStr(str, len) {
  var str_length = 0
  var str_len = 0
  var str_cut = ''
  str_len = str.length
  for (var i = 0; i < str_len; i++) {
    var a = str.charAt(i)
    str_length++
    if (decodeURIComponent(a).length > 4) {
      // 中文字符的长度经编码之后大于4
      str_length++
    }
    if (str_length > len) {
      str_cut = str_cut.concat('...')
      return str_cut
    } else {
      str_cut = str_cut.concat(a)
    }
  }
  // 如果给定字符串小于指定长度，则返回源字符串；
  if (str_length <= len) {
    return str
  }
}


function Coordtransform() {
  // 坐标转换
  //定义一些常量
  var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
  var PI = 3.1415926535897932384626;
  var a = 6378245.0;
  var ee = 0.00669342162296594323;

  /**
   * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
   * 即 百度 转 谷歌、高德
   * @param bd_lon
   * @param bd_lat
   * @returns {*[]}
   */
  var bd09togcj02 = function bd09togcj02(bd_lon, bd_lat) {
    var bd_lon = +bd_lon;
    var bd_lat = +bd_lat;
    var x = bd_lon - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return {
      lng: gg_lng,
      lat: gg_lat
    }
  };

  /**
   * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
   * 即谷歌、高德 转 百度
   * @param lng
   * @param lat
   * @returns {*[]}
   */
  var gcj02tobd09 = function gcj02tobd09(lng, lat) {
    var lat = +lat;
    var lng = +lng;
    var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
    var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
    var bd_lng = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    return {
      lng: bd_lng,
      lat: bd_lat
    }
  };
  // 返回
  return {
    bd09togcj02: bd09togcj02,
    gcj02tobd09: gcj02tobd09
  }
}

var coordtransform = Coordtransform() // 执行转换函数

module.exports = {
  formatTime: formatTime,
  formatDay: formatDay,
  showToast: showToast,
  formatNumber: formatNumber,
  showModal: showModal,
  checkPhone: checkPhone,
  formatDate: formatDate,
  getPlusDate: getPlusDate,
  getDay: getDay,
  queryStr: queryStr,
  cutStr: cutStr,
  bd09togcj02: coordtransform.bd09togcj02,
  gcj02tobd09: coordtransform.gcj02tobd09
}