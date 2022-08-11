import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import supabaseClient from "$lib/utils/supabaseClient"

const {
    VITE_API_KEY
} = import.meta.env

export async function post({ url }:RequestEvent): Promise<RequestHandlerOutput> { 
    let apiKey = url.searchParams.get("api_key")
    let email = url.searchParams.get("email") as string

    if (apiKey == VITE_API_KEY) {
        const { data } = await supabaseClient
            .from("users")
            .select("id")
            .eq("email", email)
            .single()
        if (data) {
            let magicLink = await supabaseClient.auth.api.sendMagicLinkEmail(email)
            if (!magicLink.error) {
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
                        code: 204,
                        message: "Username or email not found"
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