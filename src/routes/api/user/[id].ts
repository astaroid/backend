import supabaseClient from "$lib/utils/supabaseClient"
import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"

export async function post({ params, request }:RequestEvent): Promise<RequestHandlerOutput> {
    let id = params.id
    let body = await request.json()
    let hasError = false
    let errorMessageList = Array<string>()

    body.user_metadata = {}

    let idChecker = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", id)
        .limit(1)
        .single()
    if (idChecker.data) {
        if (body.username) {
            let { data } = await supabaseClient
                .from("users")
                .select("id")
                .eq("username", body.username)
                .limit(1)
                .single() 
            if (data) {
                if (data.id != id) {
                    delete body.username
                    hasError = true
                    errorMessageList.push("Username already exist")
                }
            } else {
                body.user_metadata.username = body.username
                delete body.username
            }
        }
    
        if (body.email) {
            let { data } = await supabaseClient
                .from("users")
                .select("id")
                .eq("email", body.email)
                .limit(1)
                .single() 
            if (data) {
                if (data.id != id) {
                    delete body.email
                    hasError = true
                    errorMessageList.push("Email already exist")
                } 
            } else {
                body.user_metadata.email_confirm = false
            }
        }
    
        if (body.password) {     
            body.user_metadata.password = body.password
        }
    
        let { data } = await supabaseClient.auth.api.updateUserById( id, body )
    
        if (hasError) {
            return {
                status: 400,
                body: {
                    code: 400,
                    message: errorMessageList
                }
            }
        } else if (data) {
            return {
                status: 200,
                body: {
                    email: data.email,
                    password: data.user_metadata.password,
                    username: data.user_metadata.username
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
    } else {
        return {
            status: 400,
            body: {
                code: 400,
                message: "User not found"
            }
        }
    }
    
}

export async function get({ params }:RequestEvent): Promise<RequestHandlerOutput> {
    let id = params.id
    let { data } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", id)
        .limit(1)
        .single()
    if (data) {
        return {
            status: 200,
            body: data
        }
    } else {
        return {
            status: 400,
            body: {
                code: 400,
                message: "User not found"
            }
        }
    }
}

export async function del({ params }:RequestEvent): Promise<RequestHandlerOutput> {
    let id = params.id
    let idChecker = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", id)
        .limit(1)
        .single()
    if (idChecker.data)  {
        let { error } = await supabaseClient.auth.api.deleteUser(id) 
        if (!error) {
            return {
                status: 200
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
    } else {
        return {
            status: 400,
            body: {
                code: 400,
                message: "User not found"
            }
        }
    }
}