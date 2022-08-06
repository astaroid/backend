import supabaseClient from "$lib/utils/supabaseClient"
import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import { decode } from 'base64-arraybuffer'

const {
    VITE_API_KEY
} = import.meta.env

export async function post({ params, request, url }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")

    if (apiKey == VITE_API_KEY) {
        let id = params.id
        let body = await request.json()

        let deleteProfileImage = await supabaseClient.storage.from('profile-image').remove([`${id}-profile-image`])

        if (!deleteProfileImage.error) {
            const { data } = await supabaseClient
                .storage
                .from('profile-image')
                .upload(`${id}-profile-image`, decode(body.data), {
                    contentType: body.type
                })
            if (data) {
                let uploadImageData = supabaseClient
                    .storage
                    .from('profile-image')
                    .getPublicUrl(`${id}-profile-image`)
                if (uploadImageData.data) {
                    return {
                        status: 200,
                        body: {
                            imageUrl: uploadImageData.data.publicURL
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