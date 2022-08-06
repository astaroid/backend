import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import supabaseClient from "$lib/utils/supabaseClient"

const {
    VITE_API_KEY
} = import.meta.env

export async function post({ url, request }:RequestEvent): Promise<RequestHandlerOutput> { 
    let apiKey = url.searchParams.get("api_key")

    if (apiKey == VITE_API_KEY) {
        let { email } = await request.json() as { email:string }
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
    } else {
        return {
            status: 400,
            body: {
                code: 102,
                message: "Incorrect api key"
            }
        }
    }
    
}