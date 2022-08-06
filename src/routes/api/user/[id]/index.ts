import supabaseClient from "$lib/utils/supabaseClient"
import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"

const {
    VITE_API_KEY
} = import.meta.env

export async function post({ params, request, url }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")

    if (apiKey == VITE_API_KEY) {
        let id = params.id
        let body = await request.json()
        let updatedUserMetadata:{ [name:string]: any } = {}
        updatedUserMetadata.user_metadata = {}

        let { data, error: E } = await supabaseClient
            .rpc("check_user_data", { _user_id: id, _user_metadata: { email: body.email, username: body.username } })
            .limit(1)
            .single()

        if (data) {
            if ("error" in data) {
                if (data.error.code == 201)
                    updatedUserMetadata.user_metadata.username = body.username
                if (data.error.code == 202) {
                    updatedUserMetadata.user_metadata.email_confirm = false
                    updatedUserMetadata.email = body.email
                }
                if (data.error.code == 106) {
                    return {
                        status: 400,
                        body: {
                            user: null,
                            error: data.error
                        }
                    }
                }
            } else {
                if ("username" in  body)
                    updatedUserMetadata.user_metadata.username = body.username
                if ("email" in  body) {
                    updatedUserMetadata.user_metadata.email_confirm = false 
                    updatedUserMetadata.email = body.email
                }
            }

            if (body.password)   
                updatedUserMetadata.user_metadata.password = body.password

            let { data: user, error } = await supabaseClient.auth.api.updateUserById( id, updatedUserMetadata )

            if (user) {
                return {
                    status: 200,
                    body: {
                        user: {
                            email: user.email,
                            password: user.user_metadata.password,
                            username: user.user_metadata.username
                        },
                        error: null
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
        } else {
            return {
                status: 400,
                body: {
                    code: 104,
                    message: "Backend error"
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

export async function get({ params, url }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")

    if (apiKey == VITE_API_KEY) {
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
                    code: 106,
                    message: "User not found"
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

export async function del({ params, url }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")

    if (apiKey == VITE_API_KEY) {
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
                        code: 104,
                        message: "Backend error"
                    }
                }
            }
        } else {
            return {
                status: 400,
                body: {
                    code: 106,
                    message: "User not found"
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