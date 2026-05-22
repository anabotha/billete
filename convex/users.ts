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
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first()

        if (existing) throw new Error("El email ya está registrado")

        return await ctx.db.insert("users", {
            email: args.email,
            passwordHash: args.password,
            createdAt: Date.now(),
        })
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

export const updateConfiguracion = mutation({
    args: {
        userId: v.id("users"),
        configuracion: v.object({
            ahorro: v.number(),
            dolares: v.number(),
            vivir: v.number(),
        })
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.userId, {
            configuracion: args.configuracion
        });
    }
});

export const getUserById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId)
    }
});

export const updateSueldo = mutation({
    args: { userId: v.id("users"), sueldo: v.number() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { sueldo: args.sueldo })
    },
})

export const updatePresupuestoCategorias = mutation({
    args: {
        userId: v.id("users"),
        presupuestoCategorias: v.array(v.object({
            categoria: v.string(),
            limite: v.number(),
            moneda: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            presupuestoCategorias: args.presupuestoCategorias,
        })
    },
})

export const getOrCreateDefaultUser = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", "josefina@gmail.com"))
            .first();
            
        if (existing) return existing._id;
        
        return await ctx.db.insert("users", {
            email: "josefina@gmail.com",
            passwordHash: "123456",
            createdAt: Date.now(),
        });
    }
});

// Usar una vez para setear el hash correcto de josefina
export const fixPasswordHash = action({
    args: { email: v.string(), password: v.string() },
    handler: async (ctx, args) => {
        const user: any = await ctx.runQuery(api.users.getUserByEmail, { email: args.email })
        if (!user) throw new Error("Usuario no encontrado")
        const hash = await bcrypt.hash(args.password, 10)
        await ctx.runMutation(api.users.patchPasswordHash, { userId: user._id, hash })
    }
});

export const patchPasswordHash = mutation({
    args: { userId: v.id("users"), hash: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { passwordHash: args.hash })
    }
});