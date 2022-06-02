import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import supabaseClient from "$lib/utils/supabaseClient"

const {
    VITE_API_KEY
} = import.meta.env

export async function post({ url, request }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")

    if (apiKey == VITE_API_KEY) { 
        let { id } = await request.json() as { id:string }
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
    } else {
        return {
            status: 400,
            body: {
                code: 400,
                message: "Incorrect api key"
            }
        }
    }
    
}