import { post } from '@/request/request'

// 并发上限
const MAX_CONCURRENCY = 2
let active = 0
const queue = []  // 存放待执行的任务（函数）

function drainQueue() {
  while (active < MAX_CONCURRENCY && queue.length) {
    const task = queue.shift()
    task && task()
  }
}

export const downloadFile = (data, config) => {
  return new Promise((resolve, reject) => {
    const run = () => {
      active++
      post('/message/downloadImage', data, config)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          active--
          drainQueue()
        })
    }

    if (active < MAX_CONCURRENCY) {
      run()
    } else {
      queue.push(run)
    }
  })
}
