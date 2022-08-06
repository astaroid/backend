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
    
        let isEmailVerify = true, 
            isUsernameVerify = true
        
        let supabaseEmailVerify = await supabaseClient
            .from("users")
            .select("email")
            .eq("email", email)
            .single()
        if (supabaseEmailVerify.data) {
            isEmailVerify = false
            return {
                status: 400,
                body: {
                    code: 201,
                    message: "Email already exist"
                }
            }
        }
    
        let supabaseUsernameVerify = await supabaseClient
            .from("users")
            .select("username")
            .eq("username", username)
            .single()
        if (supabaseUsernameVerify.data) {
            isUsernameVerify = false
            return {
                status: 400,
                body: {
                    code: 202,
                    message: "Username already exist"
                }
            }
        }
    
        if (isEmailVerify && isUsernameVerify) {
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
                        user: {
                            id: user.id,
                            verify: user.user_metadata.email_confirm
                        }
                    }
                }
            } else {
                return {
                    status: 400,
                    body: {
                        code: 104,
                        message: "Backend error"
                    }
                }
            }
        }
    
        return {
            status: 400,
            body: {
                code: 104,
                message: "Backend error"
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