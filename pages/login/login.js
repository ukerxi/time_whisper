//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    tipsText: '获取验证码',
    tipsTimer: '',
    tipsTimes: 0,
    canGetCode: true, // 是否可以进行获取验证码
    code: '', // 验证码
    phone: '' // 手机号
  },
  onLoad: function(query) {
    // 页面加载成功
  },
  onUnload: function() {
    // 页面卸载
    this.setTipsTimer('clear') // 清除定时器
  },
  getCode: function() {
    // 获取验证码
    var self = this
    var status = util.checkPhone(self.data.phone)
    if (self.data.canGetCode && status) {
      self.setData({
        canGetCode: false
      })
      app.request({
        showLogin: true,
        url: '/api/time_whisper/get_random_code',
        method: 'POST',
        data: {
          phone: self.data.phone
        },
        success(res) {
          if (res.code === '000') {
            // util.showToast('获取验证码成功，请注意查收！')
            util.showToast('获取验证码成功，请直接登录！')
            self.setData({
              code: res.data.code
            })
            self.setTipsTimer('init') // 启动定时器
          } else {
            self.setData({
              canGetCode: true
            })
            util.showToast(res.info || '操作失败！')
          }
        },
        fail: function() {
          self.setData({
            canGetCode: true
          })
        }
      })
    } else {
      if (!status) {
        util.showToast('请输入正确的手机号！')
      } else {
        util.showToast('频繁获取，请稍后重试！')
      }
    }
  },
  setTipsTimer: function(type) {
    // 获取验证码的时间倒数
    var self = this
    // 先清除
    if (self.data.tipsTimer) {
      clearInterval(self.data.tipsTimer)
      self.setData({
        canGetCode: true,
        tipsTimer: '',
        tipsTimes: 0,
        tipsText: '获取验证码'
      })
    }
    // 开启定时器
    if (type === 'init') {
      self.setData({
        tipsTimes: 60,
        tipsTimer: setInterval(function() {
          var val = self.data.tipsTimes - 1
          if (self.data.tipsTimes > 1) {
            self.setData({
              tipsTimes: val,
              tipsText: '重新获取（' + val + '）'
            })
          } else {
            if (self.data.tipsTimer) {
              clearInterval(self.data.tipsTimer)
            }
            // 可以重新获取
            self.setData({
              canGetCode: true,
              tipsTimer: '',
              tipsTimes: 0,
              tipsText: '获取验证码'
            })
          }
        }, 1000)
      })
    }
  },
  inputCode: function(e) {
    // 输入验证码
    this.setData({
      code: e.detail.value
    })
  },
  inputPhone: function(e) {
    // 输入手机号
    this.setData({
      phone: e.detail.value
    })
  },
  doLogin: function() {
    // 手机号登录
    var self = this
    var status = util.checkPhone(self.data.phone)
    if (self.data.code && status) {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          if (res && res.code) {
            app.request({
              showLogin: true,
              url: '/api/user_app/login', // 授权接口
              method: 'POST',
              data: {
                phone: self.data.phone,
                phone_code: self.data.code,
                code: res.code
              },
              success(res) {
                if (res.code === '000') {
                  app.globalData.token = res.data.session_id
                  app.globalData.loginInfo = res.data
                  wx.setStorageSync('sessionToken', res.data.session_id) // 缓存本地
                  util.showToast({
                    title: '登录成功！',
                    callback: function() {
                      self.setTipsTimer('clear') // 清除定时器
                      // 关闭所有页面重定向
                      wx.reLaunch({
                        url: '../range/range',
                        success: function () { },
                        fail: function () { }
                      })
                    }
                  })
                } else {
                  util.showToast(res.info || '登录失败！')
                }
              }
            })
          } else {
            util.showToast('获取微信授权失败')
          }
        }
      })
    } else {
      if (!self.data.phone) {
        util.showToast('请输入手机号')
      } else if (!status) {
        util.showToast('请输入正确的手机号')
      } else if (!self.data.code) {
        util.showToast('请输入验证码')
      }
    }
  }
})