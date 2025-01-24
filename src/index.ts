import { Hono } from 'hono'
import { userRoutes } from './routes/user.routes'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(cors())

app.route('/api/v1/user', userRoutes)

export default app