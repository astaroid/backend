import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import supabaseClient from "$lib/utils/supabaseClient"

export async function post(event:RequestEvent): Promise<RequestHandlerOutput> { 
    let { email } = await event.request.json() as { email:string }
    const { data } = await supabaseClient
        .from("users")
        .select("id")
        .eq("email", email)
        .single()
    if (data) {
        await supabaseClient.auth.api.sendMagicLinkEmail(email)
        return {
            status: 200
        }
    } else {
        return {
            status: 400,
            body: {
                code: 400,
                message: "Email doesn't exist"
            }
        }
    }
}