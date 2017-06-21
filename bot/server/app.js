const yzy = new Vue({
  el: '#app',
  data: {
    started: new Date(),
    instances: [],
    cpu: '-',
    memory: '-',
  },
})

const socket = io.connect('http://localhost:3000')
socket.on('nodeSync', data => {
  yzy.cpu = data.performance.cpu
  yzy.memory = data.performance.memory

  data.instanceStatus.forEach((status, index) => {
    yzy.instances[index] = {
      status: status,
      count: data.instanceReloadCount[index],
    }
  })
  console.log(data)
})
