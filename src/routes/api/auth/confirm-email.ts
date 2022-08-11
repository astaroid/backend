import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import supabaseClient from "$lib/utils/supabaseClient"

const {
    VITE_API_KEY
} = import.meta.env

export async function post({ url }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")
    let userId = url.searchParams.get("user_id")

    if (apiKey == VITE_API_KEY) { 
        const { data, error } = await supabaseClient
            .from("users")
            .select("email")
            .eq("id", userId)
            .limit(1)
            .single()
        
        if (data) {
            let confirmEmail = await supabaseClient.auth.api.resetPasswordForEmail(data.email)
            if (!confirmEmail.error) {
                return {
                    status: 200,
                    body: {
                        data: null,
                        error: null,
                        ok: true
                    }
                }
            } else {
                return {
                    status: 400,
                    body: {
                        data: null,
                        error: {
                            code: 104,
                            message: "Backend error"
                        },
                        ok: false
                    }
                }
            }
        } else {
            return {
                status: 400,
                body: {
                    data: null,
                    error: {
                        code: 106,
                        message: "User not found"
                    },
                    ok: false
                }
            }
        }
    } else {
        return {
            status: 400,
            body: {
                data: null,
                error: {
                    code: 102,
                    message: "Incorrect api key"
                },
                ok: false
            }
        }
    }
    
}