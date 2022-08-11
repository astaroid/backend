import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import supabaseClient from "$lib/utils/supabaseClient"

const {
    VITE_API_KEY
} = import.meta.env

export async function post({ url, request }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")

    if (apiKey == VITE_API_KEY) {
        let { 
            usernameOrEmail, 
            password, 
        } = await request.json() as { usernameOrEmail:string, password:string }
    
        const { data } = await supabaseClient
            .from("users")
            .select("password, id, email_confirm")
            .or(`username.eq.${usernameOrEmail}, email.eq.${usernameOrEmail}`)
            .single()
        
        if (data) {
            if (password == data.password) {
                return {
                    status: 200,
                    body: {
                        data: {
                            id: data.id,
                            verify: data.email_confirm
                        },
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
                            code: 205,
                            message: "Incorrect password"
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