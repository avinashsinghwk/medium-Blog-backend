import { Context, Next } from 'hono'
import { verify } from 'hono/jwt';

export async function authMiddleware(c: Context, next: Next) {
    try{
        const reqToken = c.req.header('Authorization')
        if(!reqToken){
            return c.json({message : 'Authentication failed'}, 403);
        }
        const authToken = reqToken.split(' ')[1];
        const decodedVal = await verify(authToken, c.env.JWT_SECRET)
        c.set("userId", decodedVal.id)
        await next();
    } catch(e){
        return c.json({message : 'Authentication failed'}, 403);
    }
}