//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    isReady: false, // 是否准备好显示，先进行校验token
    banner: app.globalData.srcHost +  '/images/time_whisper/bg_user.png',
    backLink: '' // 从别的页面跳转过来的返回链接
  },
  onLoad: function(option) {
    // 页面加载成功
    // 校验 token 是否过期
    var self = this
    if (option.type === 'login_out' || option.type === 'check_token') {
      self.setData({
        isReady: true,
        backLink: decodeURIComponent(option.link || '') || ''
      })
    } else {
      app.checkToken(function(token) {
        if (token) {
          // token没有过期
          wx.reLaunch({
            url: '../range/range',
            success: function () { },
            fail: function () { }
          })
        } else {
          self.setData({
            isReady: true
          })
        }
      }, 'nothing')
    }
  },
  onPullDownRefresh: function() {
    // 下拉刷新
  },
  wxLogin: function() {
    // 微信登录
    var self = this
    self.loginAuthor()
  },
  phoneLogin: function() {
    // 手机登录
    wx.navigateTo({
      url: '../login/login',
      success: function () { },
      fail: function () { }
    })
  },
  loginAuthor: function() {
    // 授权登录
    var self = this
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res && res.code) {
          app.request({
            showLogin: true,
            url: '/api/user_app/author',
            method: 'POST',
            data: {
              code: res.code
            },
            success(res) {
              if (res.data.id) {
                app.globalData.token = res.data.session_id
                app.globalData.loginInfo = res.data || {}
                wx.setStorageSync('sessionToken', res.data.session_id) // 缓存本地
                util.showToast({
                  title: '登录成功！',
                  callback: function() {
                    if (self.data.backLink) {
                      // 有回调链接跳转回调链接
                      wx.reLaunch({
                        url: '/' + self.data.backLink,
                        success: function () { },
                        fail: function () { }
                      })
                    } else {
                      wx.reLaunch({
                        url: '../range/range',
                        success: function () { },
                        fail: function () { }
                      })
                    }
                  }
                })
              } else {
                util.showToast(res.info || '微信登录失败')
              }
            }
          })
        } else {
          util.showToast('获取微信授权失败')
        }
      }
    })
  }
})