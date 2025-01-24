import { Hono } from 'hono';
import { userSigninController, userSignupController, createPostController, updatePostController, allPostsController, specificPostController, personalPostsController, meController } from '../controller/user.controller';
import { authMiddleware } from '../middleware/authMiddleware';

export const userRoutes = new Hono(); 

userRoutes.post('/signup', userSignupController)

userRoutes.post('/signin', userSigninController)

userRoutes.post('/blog', authMiddleware, createPostController)

userRoutes.post('/me', authMiddleware, meController)

userRoutes.put('/blog/:id', authMiddleware, updatePostController)

userRoutes.get('/blog/bulk', authMiddleware, allPostsController)

userRoutes.get('/blog/myBlogs', authMiddleware, personalPostsController)

userRoutes.get('/blog/:id', authMiddleware, specificPostController)
