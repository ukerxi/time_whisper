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
    itemList: [], // 数据列表
    itemListShow: [], // 显示的数据列表
    labels: [], // 所有的标签
    activeLabel: '全部',
    relateList: [], // 清单类型列表
    checkRelate: { // 当前选中的
      id: '', // 选中的id
      index: '', // 选中的index
      maxIndex: '', // 最大的index
      data: {} // 数据
    },
    listType: '', // 页面数据类型
    isShowMenu: false, // 是否显示菜单
    isShowModal: false, // 是否添加弹框
    formText: '', // 是否添加的类型
  },
  onLoad: function (query) {
    // 页面加载成功
    var self = this
    var id = query.id || ''
    if (!id) {
      // 获取最近的id
      id = wx.getStorageSync('checkFormId') || ''
    }
    self.setData({
      'checkRelate.id': id,
      listType: query.type
    })
    app.checkToken(function (token) {
      // 登录没有过期
      self.getRelateList()
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
  preCheck: function () {
    var self = this
    var item = {}
    if (self.data.checkRelate.index >= 1) {
      item = self.data.relateList[self.data.checkRelate.index - 1]
      if (item) {
        self.setData({
          'checkRelate.id': item.id,
          'checkRelate.index': self.data.checkRelate.index - 1,
          'checkRelate.data': item
        })
        self.getInfo()
      } else {
        util.showToast('获取账单失败！')
      }
    } else {
      util.showToast('已经没有啦！')
    }
  },
  nextCheck: function () {
    var self = this
    var item = {}
    if (self.data.checkRelate.index < (self.data.checkRelate.maxIndex -1)) {
      item = self.data.relateList[self.data.checkRelate.index + 1]
      if (item) {
        self.setData({
          'checkRelate.id': item.id,
          'checkRelate.index': self.data.checkRelate.index + 1,
          'checkRelate.data': item
        })
        self.getInfo()
      } else {
        util.showToast('获取账单失败！')
      }
    } else {
      util.showToast('已经没有啦！')
    }
  },
  bindPickerChange: function (e) {
    var self = this
    var data = e.detail || {}
    var index = parseInt(data.value) || 0
    var item = self.data.relateList[index]
    if (item) {
      self.setData({
        'checkRelate.id': item.id,
        'checkRelate.index': index,
        'checkRelate.data': item
      })
      self.getInfo()
    }
  },
  controlMenu: function () {
    var self = this
    self.setData({
      isShowMenu: !self.data.isShowMenu
    })
  },
  checkMenu: function (e) {
    // 点击菜单
    var self = this
    var data = e.currentTarget.dataset || {}
    var id = data.id || ''
    if (id == 'add_type') {
      // 添加类型
      self.setData({
        isShowModal: true,
        isShowMenu: false
      })
    } else if (id == 'add_item') {
      // 添加项目
      self.setData({
        isShowMenu: false
      })
      self.linkAddItem()
    } else if (id == 'del') {
      self.setData({
        isShowMenu: false
      })
      self.addFormType('del')
    }
  },
  hideModal: function (e) {
    var self = this
    var data = e.currentTarget.dataset || {}
    var id = data.id || ''
    if (id == 'confirm') {
      self.addFormType('add')
    } else {
      self.setData({
        isShowModal: false
      })
    }
  },
  formInput: function (e) {
    var self = this
    var detail = e.detail || {}
    self.setData({
      formText: detail.value
    })
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
  linkAdd: function () {
    // 跳转到添加页面
    var self = this
    wx.navigateTo({
      url: '../add_form/add_form?id=' + self.data.checkRelate.id + '&type=' + self.data.listType,
      success: function () { },
      fail: function () { }
    })
  },
  linkAddItem: function (e) {
    // 跳转到添加页面
    var self = this
    var data = ''
    var id = ''
    if (e) {
      data = e.currentTarget.dataset || {}
      id = data.id || ''
    }
    wx.navigateTo({
      url: '../add_form_item/add_form_item?form_id=' + self.data.checkRelate.id + '&type=' + self.data.listType + '&id=' + id,
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
          num: item.num,
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
  getCheckRelate: function (list) {
    var self = this
    var _list = list || []
    var isCheck = false // 是否选中
    if (_list.length >0) {
      if (self.data.checkRelate.id) {
        for (var i = 0, len = _list.length; i < len; i++) {
          if (self.data.checkRelate.id == _list[i].id) {
            isCheck = true
            self.setData({
              'checkRelate.id': _list[i].id,
              'checkRelate.index': i,
              'checkRelate.maxIndex': len,
              'checkRelate.data': _list[i]
            })
            break
          }
        }
      }
      if (!isCheck) {
        // 非选中，则选中第一个
        self.setData({
          'checkRelate.id': _list[0].id,
          'checkRelate.index': 0,
          'checkRelate.maxIndex': _list.length,
          'checkRelate.data': _list[0]
        })
      }
    }
  },
  getRelateList: function () {
    // 获取列表信息
    var self = this
    self.setData({
      isLoading: true
    })
    app.request({
      showLogin: true,
      url: '/api/time_whisper/get_relate_list',
      method: 'POST',
      data: {
        type: self.data.listType || ''
      },
      success(res) {
        var _list = []
        if (res.code == '000') {
          _list = res.data.list || []
          self.getCheckRelate(_list)
          self.setData({
            relateList: _list,
            isLoadAll: true
          })
          self.getInfo() // 获取列表详情
        } else {
          util.showToast(res.info || '操作失败！')
        }
        if (_list.length === 0) {
          // 设置初始化状态
          self.setData({
            isLoading: false,
            isReady: true
          })
        }
      },
      fail(res) {
        // 设置初始化状态
        self.setData({
          isLoading: false,
          isReady: true
        })
      }
    })
  },
  getInfo: function () {
    // 获取用户信息
    var self = this
    if (self.data.checkRelate.id) {
      self.setData({
        isLoading: true
      })
      app.request({
        showLogin: true,
        url: '/api/time_whisper/get_form_list',
        method: 'POST',
        data: {
          id: self.data.checkRelate.id || ''
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
            wx.setStorageSync('checkFormId', self.data.checkRelate.id) // 缓存选中的id到本地
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
  },
  addFormType: function (type) {
    // 添加标签
    var self = this
    app.request({
      showLogin: true,
      url: '/api/time_whisper/update_relate',
      method: 'POST',
      data: {
        id: type == 'del' ? self.data.checkRelate.id : '', // 根据是否有id 进行更新或是添加操作
        flag: type == 'del' ? 0 : 1, // 删除标志
        title: self.data.formText,
        content: '',
        listType: self.data.listType
      },
      success(res) {
        if (res.code == '000') {
          util.showToast({
            title: type == 'del' ? '删除成功' : '添加成功',
            callback: function () {
              self.setData({
                'checkRelate.id': res.data.id || '',
                formText: '',
                isShowModal: false
              })
              // 重新获取列表
              self.getRelateList()
            }
          })
        } else {
          util.showToast(res.info || '操作失败！')
        }
      }
    })
  }
})