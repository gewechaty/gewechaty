

class EventEmitter {
  constructor() {
    this.EventNames = []
    this.events = {}
    this.weakEvents = new WeakMap() // 添加弱引用映射
  }

  setEventNames(eventNames) {
    this.EventNames.push(...eventNames)
  }

  on(eventName, callback, force) {
    if(!this.EventNames.includes(eventName) && !force){
      throw new Error('event not found')
    }
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    // 如果回调是对象方法，使用弱引用存储
    if (typeof callback === 'object' && callback !== null) {
      if (!this.weakEvents.has(callback)) {
        this.weakEvents.set(callback, new Set())
      }
      this.weakEvents.get(callback).add(eventName)
    }

    this.events[eventName].push(callback)
    
    // 返回取消监听的函数，方便用户管理
    return () => this.off(eventName, callback)
  }

  once(eventName, callback) {
    const onceCallback = (...args) => {
      callback(...args)
      this.off(eventName, onceCallback)
    }
    this.on(eventName, onceCallback)
  }

  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(fn => fn !== callback)
      
      // 清理弱引用
      if (typeof callback === 'object' && callback !== null && this.weakEvents.has(callback)) {
        const events = this.weakEvents.get(callback)
        events.delete(eventName)
        if (events.size === 0) {
          this.weakEvents.delete(callback)
        }
      }
    }
  }

  removeAllListeners(eventName) {
    if (eventName) {
      if (this.events[eventName]) {
        // 清理相关的弱引用
        this.events[eventName].forEach(callback => {
          if (typeof callback === 'object' && callback !== null && this.weakEvents.has(callback)) {
            const events = this.weakEvents.get(callback)
            events.delete(eventName)
            if (events.size === 0) {
              this.weakEvents.delete(callback)
            }
          }
        })
        this.events[eventName] = []
      }
    } else {
      // 清理所有事件
      this.events = {}
      this.weakEvents = new WeakMap()
    }
  }

  emit(eventName, ...args) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        try {
          callback.apply(this, args)
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error)
        }
      })
    }
  }

  listenerCount(eventName) {
    if (this.events[eventName]) {
      return this.events[eventName].length
    }
    return 0
  }
}

export default EventEmitter