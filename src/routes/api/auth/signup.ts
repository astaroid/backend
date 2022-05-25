import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import supabaseClient from "$lib/utils/supabaseClient"

export async function post(event:RequestEvent): Promise<RequestHandlerOutput> {
    let { 
        email, 
        password, 
        username 
    } = await event.request.json() as { email:string, username:string, password:string }

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
                code: 400,
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
                code: 400,
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
                    code: 400,
                    message: "Backend error"
                }
            }
        }
    }

    return {
        status: 400,
        body: {
            code: 400,
            message: "Backend error"
        }
    }
}