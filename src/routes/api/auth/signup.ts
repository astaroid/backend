import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import supabaseClient from "$lib/utils/supabaseClient"

const {
    VITE_API_KEY
} = import.meta.env

export async function post({ request, url }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")

    if (apiKey == VITE_API_KEY) {
        let { 
            email, 
            password, 
            username 
        } = await request.json() as { email:string, username:string, password:string }
    
        let isUserVerify = true
        
        let supabaseUserVerifier = await supabaseClient
            .rpc("check_signup_data", { _email: email, _username: username })
            .limit(1)
            .single()

        if (!supabaseUserVerifier.error) {
            
            if ("error" in supabaseUserVerifier.data) {
                isUserVerify = false
                let error = supabaseUserVerifier.data.error
                return {
                    status: 400,
                    body: {
                        data: null,
                        error,
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
                        code: 104,
                        message: "Backend error"
                    },
                    ok: false
                }
            }
        }
    
        if (isUserVerify) {
            const { user } = await supabaseClient.auth.api.createUser({
                email_confirm: true,
                email,
                password,
                user_metadata: {
                    username,
                    password,
                    email_confirm: false
                }
            })
    
            if (user) {
                return {
                    status: 200,
                    body: {
                        data: {
                            id: user.id,
                            verify: user.user_metadata.email_confirm
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
                            code: 104,
                            message: "Backend error"
                        },
                        ok: false
                    }
                }
            }
        }
    
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