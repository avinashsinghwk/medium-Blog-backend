import { Hono } from 'hono'
import { userRoutes } from './routes/user.routes'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(cors({
    origin: 'https://medium-blog-frontend.vercel.app'
}))

app.route('/api/v1/user', userRoutes)

export default app