import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import supabaseClient from "$lib/utils/supabaseClient"

export async function post(event:RequestEvent): Promise<RequestHandlerOutput> {
    let { 
        usernameOrEmail, 
        password, 
    } = await event.request.json() as { usernameOrEmail:string, password:string }

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
                    user: {
                        id: data.id,
                        verify: data.email_confirm
                    }
                }
            }
        } else {
            return {
                status: 400,
                body: {
                    code: 400,
                    message: "Incorrect password"
                }
            }
        }
    } else {
        return {
            status: 400,
            body: {
                code: 400,
                message: "Username or email doesn't exist"
            }
        }
    }
}