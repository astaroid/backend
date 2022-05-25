import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import supabaseClient from "$lib/utils/supabaseClient"

export async function post(event:RequestEvent): Promise<RequestHandlerOutput> {
    let { id } = await event.request.json() as { id:string }
    const { data } = await supabaseClient
        .from("users")
        .select("email")
        .eq("id", id)
        .single()
    if (data) {
        await supabaseClient.auth.api.resetPasswordForEmail(data.email)
        return {
            status: 200
        }
    } else {
        return {
            status: 400,
            body: {
                code: 400,
                message: "User doesn't exist"
            }
        }
    }
}