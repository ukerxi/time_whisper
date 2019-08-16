//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    isReady: false, // 是否加载完信息
    srcHost: app.globalData.srcHost,
    userInfo: {} // 用户信息
  },
  onLoad: function (query) {
    // 页面加载成功
    var self = this
    app.checkToken(function (token) {
      // token没有过期
      self.getInfo()
    }, 'login')
  },
  linkPage: function () {
    // 跳转到排班页面
    var self = this
    wx.redirectTo({
      url: '../range/range',
      success: function () { },
      fail: function () { }
    })
  },
  linkRelate: function (e) {
    // 跳转清单列表页面
    var self = this
    var data = ''
    var id = ''
    if (e) {
      data = e.currentTarget.dataset || {}
      id = data.id || ''
    }
    console.log(id)
    if (id) {
      wx.navigateTo({
        url: '../form_list/form_list?type=' + id,
        success: function () { },
        fail: function () { }
      })
    }
  },
  getInfo: function () {
    // 获取用户信息
    var self = this
    app.request({
      showLogin: true,
      url: '/api/user_app/get_user_info',
      method: 'POST',
      data: {
        session_id: app.globalData.token || ''
      },
      success(res) {
        if (res.code == '000') {
          self.setData({
            isReady: true,
            userInfo: res.data || {}
          })
        } else {
          util.showToast(res.info || '操作失败！')
        }
      }
    })
  },
  loginOut: function () {
    var self = this
    util.showModal({
      title: '温馨提示',
      content: '确认退出当前账号吗？',
      success(res) {
        if (res.confirm) {
          self.doLoginOut()
          // 确定
        } else if (res.cancel) {
          // 取消
        }
      }
    })
  },
  doLoginOut: function () {
    // 退出登录
    var self = this
    app.request({
      showLogin: true,
      url: '/api/user_app/logout',
      method: 'POST',
      data: {},
      success(res) {
        if (res.code == '000') {
          // 清空数据
          app.globalData.token = ''
          app.globalData.loginInfo = ''
          wx.setStorageSync('sessionToken', '') // 缓存本地
          util.showToast({
            title: '退出登录成功！',
            callback: function () {
              // 关闭所有页面重定向登录页面
              wx.reLaunch({
                url: '../index/index?type=login_out',
                success: function () { },
                fail: function () { }
              })
            }
          })
        } else {
          util.showToast(res.info || '操作失败！')
        }
      }
    })
  }
})
