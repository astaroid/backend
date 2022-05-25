import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import { serialize, type CookieSerializeOptions } from "cookie"

export async function post(event:RequestEvent): Promise<RequestHandlerOutput> {
    let body = await event.request.json()

    let cookieOption:CookieSerializeOptions =  {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 31557600 
    }

    const headers = {
        "Set-Cookie": serialize(
            "session", 
            JSON.stringify({ cookie: {...cookieOption}, data: body, platform: "browser" }), 
            cookieOption
        )
    }
    
    return {
        status: 200,
        headers
    }
}

export async function del(): Promise<RequestHandlerOutput> {
    let cookieOption:CookieSerializeOptions =  {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0 
    }

    const headers = {
        "Set-Cookie": serialize(
            "session", 
            JSON.stringify({ cookie: {...cookieOption}, data: {}, platform: "browser" }), 
            cookieOption
        )
    }

    return {
        status: 200,
        headers
    }
}