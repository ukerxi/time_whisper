//app.js
const util = require('./utils/util.js')
App({
  globalData: {
    // 全局数据
    userInfo: {},
    token: '', // 用户sessionId
    // reqHost: 'http://127.0.0.1:3001',  // 请求接口链接
    reqHost: 'https://min.ukerxi.com',  // 请求接口链接
    // srcHost: 'http://127.0.0.1:3001', // 请求资源链接
    srcHost: 'https://min.ukerxi.com' // 请求资源链接 
  },
  onLaunch: function (data) {
    // 初始化完成
    var self = this
  },
  checkToken: function (callback, type, link) {
    /** 
     * 登录校验，并进行初始化，每个页面必须先调用，然后才进行初始化
     * @param callback 回调
     * @param type 失败处理类型，login (跳转登录) nothing （不做处理，只进行回调） tips (提示错误))
     * @param link 跳转链接，重定向到登录页面时要进行跳转的链接
     */
    var self = this
    if (self.globalData.token) {
      // 已经登录过，直接调用回调
      if (callback) {
        callback(self.globalData.token)
      }
    } else {
      var sessionToken = wx.getStorageSync('sessionToken') || ''
      if (sessionToken) {
        // 检验是否过期
        self.request({
          showLogin: true,
          url: '/api/user_app/auto_login',
          method: 'POST',
          data: {
            session_id: sessionToken
          },
          success(res) {
            if (res.code === '000') {
              // 登录成功
              self.globalData.token = sessionToken
              self.globalData.loginInfo = res.data
              if (callback) {
                callback(self.globalData.token)
              }
            } else {
              errorHandle()
            }
          },
          fail(res) {
            errorHandle()
          }
        })
      } else {
        errorHandle()
      }
    }

    function errorHandle() {
      // login (跳转登录) nothing （不做处理，只进行回调） tips (提示错误))
      if (type === 'tips') {
        util.showToast({
          title: '登录已过期，请重新登录！',
          callback: function () { }
        })
      } else if (type === 'nothing') {
        if (callback) {
          callback('')
        }
      } else if (type === 'login') {
        util.showToast({
          title: '登录已过期，请重新登录！',
          callback: function () {
            wx.navigateTo({
              url: '../index/index?type=check_token&link=' + (link || ''),
              success: function () { },
              fail: function () { }
            })
          }
        })
      }
    }
  },
  request: function (param) {
    // 全局处理请求
    var self = this
    if (param.showLogin) {
      wx.showLoading({
        title: param.loginTitle || '加载中...'
      })
    }
    // 拿取token
    param.data = param.data || {}
    if (!param.data.session_id) {
      param.data.session_id = self.globalData.token
    }
    wx.request({
      url: self.globalData.reqHost + (param.url || ''),
      method: param.method || 'GET',
      data: param.data || {},
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        if (param.showLogin) {
          wx.hideLoading()
        }
        var _res = res.data || {}
        // 成功
        if (_res.code === '203') {
          // 登录过期处理
          util.showToast('登录已过期，请重新登录!')
        } else {
          if (param.success) {
            param.success(_res)
          }
        }
      },
      fail(err) {
        // 失败
        if (param.showLogin) {
          wx.hideLoading()
        }
        if (param.fail) {
          param.fail(err)
        } else {
          util.showToast('网络错误，请稍后重试!')
        }
      }
    })
  },
  onShow: function (data) {
    // 进入前台，or 启动
    // console.log('前台')
  },
  onHide: function () {
    // 后台运行
    // console.log('后台')
  },
  onError: function (error) {
    // 错误处理
    console.log(error)
  },
  onPageNotFound: function () {
    // 页面不存在， 1.9.90 支持
  }
})