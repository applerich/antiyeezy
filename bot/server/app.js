const app = new Vue({
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
  app.cpu = data.performance.cpu
  app.memory = data.performance.memory

  data.instanceStatus.forEach((status, index) => {
    app.instances[index] = {
      status: status,
      count: data.instanceReloadCount[index],
    }
  })
  console.log(this.cpu, data)
})
