//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    isReady: false, // 是否加载完信息
    srcHost: app.globalData.srcHost,
    showItem: { // 显示控制
      title: true,
      content: true,
      startTime: false,
      endTime: false,
      img: false,
      label: false
    },
    infoId: '', // 记录id
    listType: '', // 类型
    title: '', // 标题
    content: '', // 内容
    startDate: '', // 开始日期
    startTime: '', // 开始时间
    endDate: '', // 结束日期
    endTime: '', // 结束时间
    isShowModal: false, // 添加标签弹框
    labels: [], // 添加的标签
    labelText: '', // 添加一个标签
    allLabels: [], // 全部的标签
    images: [] // 图片列表
  },
  onLoad: function(query) {
    var _query = query || {}
    // 页面加载成功
    var self = this
    // 控制页面显示
    if (_query.type == 'finace') {
      // 财务清单
    }
    self.setData({
      infoId: _query.id || '',
      listType: _query.type || ''
    })
    app.checkToken(function(token) {
      // 登录没有过期
      self.initPage()
    }, 'login', encodeURIComponent(self.route + util.queryStr(query)))
  },
  initPage: function() {
    // 初始化页面
    var self = this
    self.setData({
      isReady: true
    })
    // 获取标签
    self.getLabel(function() {
      // 初始化日期
      if (self.data.infoId) {
        // 有id就进行编辑
        self.getInfo(self.data.infoId)
      } else {
        self.setData({
          startDate: util.formatDate(new Date(), 'yyyy-MM-dd'),
          startTime: util.formatDate(new Date(), 'hh:mm')
        })
      }
    })
  },
  linkPage: function() {
    // 跳转到排班页面
    var self = this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.redirectTo({
        url: '../user/user',
        success: function() {},
        fail: function() {}
      })
    }
  },
  showAddModal: function() {
    var self = this
    self.setData({
      isShowModal: true
    })
  },
  hideModal: function(e) {
    var self = this
    self.setData({
      isShowModal: false
    })
  },
  timeChange: function(e) {
    var self = this
    var detail = e.detail || {}
    var data = e.currentTarget.dataset || {}
    var id = data.id || ''
    var val = detail.value || ''
    if (id === 'start_date') {
      // 开始日期
      self.setData({
        startDate: val
      })
    } else if (id === 'start_time') {
      // 开始时间
      self.setData({
        startTime: val
      })
    } else if (id === 'end_date') {
      // 结束日期
      self.setData({
        endDate: val
      })
    } else if (id === 'end_time') {
      // 结束时间
      self.setData({
        endTime: val
      })
    }
  },
  inputArea: function(e) {
    var self = this
    var detail = e.detail || {}
    var data = e.currentTarget.dataset || {}
    var id = data.id || ''
    var val = detail.value || ''
    if (id === 'title') {
      // 标题
      self.setData({
        title: val
      })
    } else if (id === 'content') {
      // 内容
      self.setData({
        content: val
      })
    }
  },
  labelInput: function(e) {
    var self = this
    var detail = e.detail || {}
    self.setData({
      labelText: detail.value
    })
  },
  checkLabel: function(e) {
    var self = this
    var allLabels = self.data.allLabels || []
    var labels = self.data.labels || []
    if (e) {
      var dataset = e.currentTarget.dataset || {}
      var id = dataset.id || 0
      if (allLabels[id]) {
        if (allLabels[id].check) {
          allLabels[id].check = ''
          if (labels.indexOf(allLabels[id].name) != -1) {
            labels.splice(labels.indexOf(allLabels[id].name), 1)
          }
        } else {
          allLabels[id].check = '1'
          labels.push(allLabels[id].name)
        }
        self.setData({
          allLabels: allLabels,
          labels: labels
        })
      }
    } else {
      for (var i = 0, len = labels.length; i < len; i++) {
        for (var j = 0, len_j = allLabels.length; j < len_j; j++) {
          if (allLabels[j].name === labels[i]) {
            // 初始化选中
            allLabels[j].check = '1'
          }
        }
      }
      self.setData({
        allLabels: allLabels
      })
    }
  },
  uploadImg: function() {
    // 上传文件
    var self = this
    if (wx.chooseImage) {
      wx.chooseImage({
        count: 3,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          const tempFilePaths = res.tempFilePaths || []
          const tempFiles = res.tempFiles
          self.setData({
            images: self.data.images.concat(tempFiles)
          })
        },
        fail: function(res) {
          // 取消不进行弹框
          if (res && res.errMsg.indexOf('cancel') === -1) {
            util.showToast('上传失败，请重试！')
          }
        }
      })
    } else {
      util.showToast('不支持上传图片！')
    }
  },
  delImg: function(e) {
    // 删除图片
    var self = this
    var data = e.currentTarget.dataset || {}
    var index = data.id || 0
    self.data.images.splice(index, 1) // 删除一个
    self.setData({
      images: self.data.images
    })
  },
  updateInfo: function(e) {
    // 添加物语
    var self = this
    var data = e.currentTarget.dataset || {}
    var type = data.type|| ''
    if (self.data.images.length > 0) {
      wx.showLoading({
        title: '加载中...'
      })
      // 先上传图片
      self.doUploadImg(self.data.images, function(files) {
        self.doUpdateInfo(files, type)
      })
    } else {
      self.doUpdateInfo([], type)
    }
  },
  doUpdateInfo: function(files, type) {
    // 添加请求
    var self = this
    var tips = ''
    if (!self.data.title || !self.data.startTime) {
      if (!self.data.title) {
        tips = '请输入标题！'
      } else if (!self.data.startTime) {
        tips = '请输入开始时间！'
      }
      util.showToast(tips)
    } else {
      app.request({
        showLogin: true,
        url: '/api/time_whisper/update_relate',
        method: 'POST',
        data: {
          id: self.data.infoId || '', // 根据是否有id 进行更新或是添加操作
          flag: type == 'del' ? 0 : 1, // 删除标志
          title: self.data.title,
          content: self.data.content,
          listType: self.data.listType,
          start_time: self.data.startDate + ' ' + self.data.startTime,
          end_time: (self.data.endDate && self.data.endTime) ? (self.data.endDate + ' ' + self.data.endTime) : '',
          labels: JSON.stringify(self.data.labels || []),
          images: JSON.stringify(files || [])
        },
        success(res) {
          if (res.code === '000') {
            util.showToast({
              title: '数据已更新！',
              callback: function() {
                // 跳转到首页
                self.linkPage()
              }
            })
          } else {
            util.showToast(res.info || '操作失败！')
          }
        }
      })
    }
  },
  doUploadImg: function(files, callback) {
    var self = this
    var _files = files || []
    var count = _files.length
    var path = []
    if (count > 0) {
      load()
    } else {
      callback && callback(path) // 回调
    }

    function load() {
      count = count - 1 // 定位到新的路径
      if (_files[count].loaded) {
        // 已经上传过的就不用上传了
        path.push(_files[count].origin)
        if (count > 0) {
          load() // 递归上传
        } else {
          callback && callback(path) // 回调
        }
      } else {
        wx.uploadFile({
          url: app.globalData.reqHost + '/upload/images', // 文件上传
          filePath: _files[count].path || '',
          name: 'image',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          formData: {
            'destination': '/time_whisper'
          },
          success(res) {
            const _res = JSON.parse(res.data)
            if (_res.data.image) {
              path.push(_res.data.image)
            }
            if (count > 0) {
              load() // 递归上传
            } else {
              callback && callback(path) // 回调
            }
          },
          fail (res) {
            console.log(res)
          }
        })
      }
      
    }
  },
  getInfo: function(id) {
    // 获取标签列表
    var self = this
    app.request({
      showLogin: true,
      url: '/api/time_whisper/get_range_detail',
      method: 'POST',
      data: {
        id: id
      },
      success(res) {
        var item = res.data || {}
        if (res.code == '000') {
          var param = {
            title: item.title || '', 
            content: item.content || ''
          }
          var date = ''
          if (item.startTime) {
            date = item.startTime.split(' ') || []
            param.startDate = date[0] || ''
            param.startTime = date[1] || ''
          }
          if (item.endTime) {
            date = item.endTime.split(' ') || []
            param.endDate = date[0] || ''
            param.endTime = date[1] || ''
          }
          if (item.labels) {
            param.labels = item.labels || []
          }
          if (item.images) {
            param.images = []
            for (var i = 0, len = item.images.length; i<len; i++){
              param.images.push({
                path: item.images[i].url,
                loaded: '1',
                size: item.images[i].size,
                origin: item.images[i] // 保持原有的数据，方便保存
              })
            }
          }
          self.setData(param)
          self.checkLabel() // 初始化选中的label
        } else {
          util.showToast(res.info || '操作失败！')
        }
      }
    })
  },
  getLabel: function(callback) {
    // 获取标签列表
    var self = this
    app.request({
      showLogin: true,
      url: '/api/time_whisper/get_label_list',
      method: 'POST',
      data: {},
      success(res) {
        var list = res.data || []
        var labels = []
        if (res.code == '000') {
          for (var i = 0, len = list.length; i < len; i++) {
            labels.push({
              name: list[i],
              check: self.data.labels.indexOf(list[i]) != -1 ? '1' : ''
            })
          }
          self.setData({
            allLabels: labels
          })
        } else {
          util.showToast(res.info || '操作失败！')
        }
        if (callback) {
          // 执行回调
          callback()
        }
      }
    })
  },
  addLabel: function() {
    // 添加标签
    var self = this
    app.request({
      showLogin: true,
      url: '/api/time_whisper/add_label',
      method: 'POST',
      data: {
        label: self.data.labelText || ''
      },
      success(res) {
        if (res.code == '000') {
          util.showToast({
            title: '添加成功',
            callback: function() {
              self.setData({
                labelText: '',
                isShowModal: false
              })
              // 重新获取列表
              self.getLabel()
            }
          })
        } else {
          util.showToast(res.info || '操作失败！')
        }
      }
    })
  }
})