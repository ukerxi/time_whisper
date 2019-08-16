//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    isReady: false, // 是否加载完信息
    isLoading: false, // 是否在加载数据中
    isLoadAll: false, // 全部加载完成
    srcHost: app.globalData.srcHost,
    reqHost: app.globalData.reqHost,
    date: '', // 选中的日期
    dateStr: '', // 选中的日期
    itemList: [], // 数据列表
    itemListShow: [], // 显示的数据列表
    labels: [], // 所有的标签
    activeLabel: '全部'
  },
  onLoad: function (query) {
    // 页面加载成功
    var self = this
    // 初始化当前的日期
    var today = util.formatDate()
    self.setData({
      date: today,
      dateStr: '今天 ' + util.getDay(),
      today: today
    })
    app.checkToken(function (token) {
      // 登录没有过期
      self.getInfo()
    }, 'login', self.route)
  },
  onShow: function () {
    // 页面显示重新加载数据
    var self = this
    if(self.data.isReady) {
      self.getInfo()
    }
  },
  onPullDownRefresh: function () {
    // 下拉刷新
    var self = this
    wx.stopPullDownRefresh()
    if (!self.data.isLoading) {
      // 下拉加载数据
      self.getInfo()
    }
  },
  onReachBottom: function () {
    // 上拉列表刷新
    var self = this
  },
  preDate: function () {
    var self = this
    var time = util.getPlusDate(-1, self.data.date)
    var _date = util.formatDate(time)
    self.setData({
      date: _date,
      dateStr: self.getDateStr(time, _date)
    })
    self.getInfo()
  },
  nextDate: function () {
    var self = this
    var time = util.getPlusDate(1, self.data.date)
    var _date = util.formatDate(time)
    self.setData({
      date: _date,
      dateStr: self.getDateStr(time, _date)
    })
    self.getInfo()
  },
  getDateStr: function (dateObj, date) {
    var self = this
    var str = ''
    if (date == self.data.today) {
      str = '今天 ' + util.getDay()
    } else {
      str = util.formatDay(dateObj) + ' ' + util.getDay(dateObj)
    }
    return str
  },
  linkPage: function () {
    // 跳转到个人中心页面
    var self = this
    wx.redirectTo({
      url: '../user/user',
      success: function () { },
      fail: function () { }
    })
  },
  linkAdd: function (e) {
    // 跳转到添加页面
    var self = this
    var data = ''
    var id = ''
    if (e) {
      data = e.currentTarget.dataset || {}
      id = data.id || ''
    }
    wx.navigateTo({
      url: '../add_range/add_range?id=' + id,
      success: function () { },
      fail: function () { }
    })
  },
  checkLabel: function (e) {
    var self = this
    var data = e.currentTarget.dataset || {}
    var id = data.id || ''
    self.setData({
      activeLabel: id
    })
    self.checkShow()
  },
  checkShow: function () {
    // 控制列表显示
    var self = this
    var item = ''
    var list = []
    for (var i=0, len=self.data.itemList.length; i < len; i++) {
      item = self.data.itemList[i]
      if (self.data.activeLabel == '全部' || item.labels.indexOf(self.data.activeLabel) != -1) {
        list.push({
          id: item.id,
          title: item.title,
          content: item.content,
          startTime: item.startTime,
          startDate: item.startDate,
          image: item.image,
          images: item.images,
          isShow: true
        })
      }
    }
    self.setData({
      itemListShow: list
    })
  },
  previewImg: function (e) {
    // 预览图片
    var self = this
    var data = e.currentTarget.dataset || {}
    var src = data.src || ''
    var index = data.index || 0
    var images = (self.data.itemListShow[index] && self.data.itemListShow[index].images) || []
    var list = []
    for (var i = 0, len = images.length; i <len; i++){
      list.push(self.data.reqHost + images[i].url)
    }
    if (wx.previewImage) {
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: list || [src] // 需要预览的图片http链接列表
      })
    }
  },
  getInfo: function () {
    // 获取用户信息
    var self = this
    self.setData({
      isLoading: true
    })
    app.request({
      showLogin: true,
      url: '/api/time_whisper/get_range_list',
      method: 'POST',
      data: {
        date: self.data.date || ''
      },
      success(res) {
        if (res.code == '000') {
          var labels = []
          labels.push('全部')
          labels = labels.concat(res.data.labels)
          self.setData({
            itemList: res.data.list || [],
            labels: labels,
            activeLabel: '全部',
            isLoadAll: true
          })
          // 控制显示
          self.checkShow()
        } else {
          util.showToast(res.info || '操作失败！')
        }
        // 设置初始化状态
        self.setData({
          isLoading: false,
          isReady: true
        })
      },
      fail(res) {
        // 设置初始化状态
        self.setData({
          isLoading: false,
          isReady: true
        })
      }
    })
  }
})