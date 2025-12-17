// import './assets/main.css'

import { createApp, watch } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"

const app = createApp(App)
const pinia = createPinia()

watch(
  pinia.state,
  (state) => {
    localStorage.setItem("typer", JSON.stringify(state.typer))
  },
  { deep: true },
)

app.use(pinia)
app.mount("#app")
