import type { RequestEvent } from "@sveltejs/kit/types/internal"
import { parse } from "cookie"

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }:{ event: RequestEvent<Record<string, string>>, resolve:any }) {
    const cookies = parse(event.request.headers.get("cookie") || "")

    if (cookies.session) {
        let session = JSON.parse(cookies.session)
        if (session.platform == "browser")
            event.locals = session["data"]  
    } 

    const response = await resolve(event)
    return response
}

/** @type {import('@sveltejs/kit').GetSession} */
export function getSession(event:RequestEvent<Record<string, string>>) {
    if ("user" in event.locals) {
        return event.locals
    } else {
        return {}
    }
}