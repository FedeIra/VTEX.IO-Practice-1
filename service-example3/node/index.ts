/*
*1) agrego a las rutas del client de vtex el path de la ruta de la API externa que quiero utilizar, en este caso, universities.
*2) agrego el resolver de la ruta que cree para hacer la petición a la API externa. En este caso, le paso el resolver de getUniversities.
*/

import type { ClientsConfig, ServiceContext } from '@vtex/api'
import { LRUCache, method, Service } from '@vtex/api'

import { Clients } from './clients'
import { status } from './middlewares/status'
import { getUniversities } from './middlewares/getUniversities'
// import { validate } from './middlewares/validate'
import { getUniversitiesResolver } from './resolvers/universities'

// new weather service:
import { getWeather } from './middlewares/getWeather'
// import { getWeatherResolver } from './resolvers/weather'

const TIMEOUT_MS = 800

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('status', memoryCache)

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    // This key will be merged with the default options and add this cache to our Status client.
    status: {
      memoryCache,
    },
  },
}

declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients>

  // The shape of our State object found in `ctx.state`. This is used as state bag to communicate between middlewares.
  // interface State extends RecorderState {
  //   code: number
  // }
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  routes: {
    // `status` is the route ID from service.json. It maps to an array of middlewares (or a single handler).
    status: method({
      GET: [/* validate,  */status],
    }),
    universities: method({
      GET: [getUniversities],
    }),
    weather: method({
      GET: [getWeather],
    }),
  },
  graphql: {
    resolvers: {
      Query: {
        getUniversitiesResolver,
        // getWeatherResolver,
      },
    },
  },
})
