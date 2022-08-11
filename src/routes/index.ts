import type { RequestHandlerOutput } from "@sveltejs/kit"

const responseHandler = (): RequestHandlerOutput => {
    return {
        status: 200,
        body: {
            data: {
                os: process.env["OS"] as string,
                version: "1.0.0",
                versions: {
                    "node": process.version,
                    "typescript": "4.6.2",
                    "supabase-js": "1.35.4",
                    "svelte": "3.44.0",
                    "svelte-kit": "1.0.0-next.334",
                    "astaroid-backend": "1.0.0"
                },
                platform: process.platform,
                arch: process.arch,
            },
            error: null,
            ok: true
        }
    }
} 

export const get = responseHandler

export const post = responseHandler

export const patch = responseHandler

export const del = responseHandler