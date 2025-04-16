import { Context } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt'
import { signinInput, signupInput, postInput, signinInputType, signupInputType, postInputType } from '@abhinashsinghwk/mediumblog-zod';

enum STATUS_CODE {
    ServerError = 500,
    NotFount = 404,
    Created = 201,
    Success = 200,
    BadRequest = 411
}

export async function userSignupController(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    try {
        const body: signupInputType = await c.req.json();
        const { success } = signupInput.safeParse(body);
        console.log(success)
        if (!success) {
            return c.json({
                message: 'wrong input',
            }, STATUS_CODE.BadRequest)
        }
        const userExistance = await prisma.user.findFirst({
            where: { email: body.email }
        })
        if (userExistance) {
            return c.json({ message: `The user ' ${body.email} ' is already present in our database` }, STATUS_CODE.BadRequest)
        }
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name
            },
            include: {
                posts: true
            }
        })
        const token = await sign({ id: user.id }, c.env.JWT_SECRET)
        return c.json({
            message: 'User created successfully',
            token: `Bearer ${token}`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                posts: user.posts
            }
        }, STATUS_CODE.Created)
    } catch (e) {
        return c.json({ message: 'We are unable to process your request' }, STATUS_CODE.ServerError)
    }
}

export async function userSigninController(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    try {
        const body: signinInputType = await c.req.json();
        const { success } = signinInput.safeParse(body)
        if (!success) {
            return c.json({
                message: 'wrong input',
            }, STATUS_CODE.BadRequest)
        }
        const userExistance = await prisma.user.findUnique({
            where: {
                email: body.email
            },
            include: {
                posts: true
            }
        })
        if (userExistance == null) {
            return c.json({ message: `The user ' ${body.email} ' is not present in our database` }, STATUS_CODE.NotFount)
        }
        if (userExistance.password != body.password) {
            return c.json({ message: 'Wrong Password' }, STATUS_CODE.BadRequest)
        }
        const token = await sign({ id: userExistance.id }, c.env.JWT_SECRET)
        return c.json({
            message: 'Signin Successfully',
            token: `Bearer ${token}`,
            user: {
                id: userExistance.id,
                name: userExistance.name,
                email: userExistance.email,
                createdAt: userExistance.createdAt,
                updatedAt: userExistance.updatedAt,
                posts: userExistance.posts
            }
        }, STATUS_CODE.Success)
    } catch (e) {
        return c.json({ message: 'We are unable to process your request' }, STATUS_CODE.ServerError)
    }
}

export async function createPostController(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const body: postInputType = await c.req.json();
        const { success } = postInput.safeParse(body)
        if (!success) {
            return c.json({
                message: 'wrong input',
            }, STATUS_CODE.BadRequest)
        }
        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                published: body.published,
                authorId: c.get('userId')
            }
        })
        return c.json({
            message: 'Post created successfully',
            post
        }, STATUS_CODE.Created)
    } catch (e) {
        return c.json({ message: 'We are unable to process your request' }, STATUS_CODE.ServerError)
    }
}

export async function updatePostController(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const body: postInputType = await c.req.json();
        const { success } = postInput.safeParse(body)
        if (!success) {
            return c.json({
                message: 'wrong input',
            }, STATUS_CODE.BadRequest)
        }
        const postId = c.req.param('id');
        const updatedPost = await prisma.post.update({
            where: {
                id: postId,
                authorId: c.get('userId')
            },
            data: {
                title: body.title,
                content: body.content,
                published: body.published
            }
        })
        return c.json({
            message: 'Post updated successfully',
            post: updatedPost
        }, STATUS_CODE.Success)
    } catch (e) {
        return c.json({ message: 'We are unable to process your request' }, STATUS_CODE.ServerError)
    }
}

export async function allPostsController(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: true
            }
        })
        return c.json({
            message: 'All posts present in our db are',
            posts: posts.map(p => {
                return {
                    id: p.id,
                    title: p.title,
                    content: p.content,
                    published: p.published,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                    authorName: p.author.name,
                    authorEmail: p.author.email,
                    authorId: p.authorId
                }
            })
        }, STATUS_CODE.Success)
    } catch (e) {
        return c.json({ message: 'We are unable to process your request' }, STATUS_CODE.ServerError)
    }
}

export async function specificPostController(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const specificPost = await prisma.post.findFirst({
            where: {
                id: c.req.param('id')
            },
            include: {
                author: true
            }
        })
        if (specificPost == null) {
            return c.json({
                message: "failed",
                description: "Post id does not match in our database",
                postId: c.req.param('id')
            }, STATUS_CODE.NotFount)
        }
        return c.json({
            message: 'success',
            post: {
                id: specificPost.id,
                title: specificPost.title,
                content: specificPost.content,
                published: specificPost.published,
                createdAt: specificPost.createdAt,
                updatedAt: specificPost.updatedAt,
                authorName: specificPost.author.name,
                authorEmail: specificPost.author.email,
                authorId: specificPost.authorId
            }

        }, STATUS_CODE.Success)
    } catch (e) {
        return c.json({ message: 'We are unable to process your request' }, STATUS_CODE.ServerError)
    }
}

export async function personalPostsController(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const personalPosts = await prisma.post.findMany({
            where: {
                authorId: c.get("userId")
            },
            include: {
                author: true
            }
        })
        if (personalPosts.length == 0) {
            return c.json({
                message: "You don't have any posts",
            }, STATUS_CODE.Success)
        }
        return c.json({
            message: 'Your all posts',
            posts: personalPosts.map(p => {
                return {
                    id: p.id,
                    title: p.title,
                    content: p.content,
                    published: p.published,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                    authorName: p.author.name,
                    authorEmail: p.author.email,
                    authorId: p.authorId
                }
            })
        }, STATUS_CODE.Success)
    } catch (e) {
        return c.json({ message: 'We are unable to process your request' }, STATUS_CODE.ServerError)
    }
}

export const meController = async (c: Context) => {
    return c.json({ message: 'auth passed' }, STATUS_CODE.Success)
}

export const deletePostController = async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const post = await prisma.post.findFirst({
            where: {
                id: c.req.param('id')
            }
        })
        if (!post || post.authorId !== c.get("userId")) {
            return c.json({
                message: "Post not found",
            }, STATUS_CODE.NotFount)
        }
        await prisma.post.delete({
            where: {
                id: c.req.param('id'),
                authorId: c.get("userId")
            }
        })
        return c.json({
            message: 'Post deleted Successfully',
        }, STATUS_CODE.Success)
    } catch (e) {
        return c.json({ message: 'We are unable to process your request' }, STATUS_CODE.ServerError)
    }
}