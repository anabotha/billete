import { action, mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

import bcrypt from "bcryptjs"


export const createUser = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("users", {
            email: args.email,
            passwordHash: args.password,
            createdAt: Date.now(),
        })
    },
})
export const register = action({
    args: {
        email: v.string(),
        password: v.string(),
    },

    handler: async (ctx, args) => {

        const hash = await bcrypt.hash(args.password, 10)

        await ctx.runMutation(
            api.users.createUser,
            {
                email: args.email,
                password: hash,
            }
        )
    },
})

export const getUserByEmail = query({
    args: {
        email: v.string(),
    },

    handler: async (ctx, args) => {

        return await ctx.db
            .query("users")
            .withIndex("by_email", q =>
                q.eq("email", args.email)
            )
            .unique()
    }
})

export const login = action({
    args: {
        email: v.string(),
        password: v.string(),
    },

    handler: async (
        ctx,
        args
    ): Promise<any> => {

        const user: any = await ctx.runQuery(
            api.users.getUserByEmail,
            { email: args.email }
        )

        if (!user) throw new Error("No existe el usuario")

        const ok = await bcrypt.compare(
            args.password,
            user.passwordHash
        )

        if (!ok) throw new Error("Incorrecto")

        return user
    }
})