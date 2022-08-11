import supabaseClient from "$lib/utils/supabaseClient"
import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"

const {
    VITE_API_KEY
} = import.meta.env

export async function get({ params, url }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")

    let color = url.searchParams.get("color")

    if (apiKey == VITE_API_KEY) {
        let userId = params.id
        let userChecker = await supabaseClient.auth.api.getUserById(userId)
        if (userChecker.data) {
            let query = supabaseClient
                .from("assets")
                .select("id,volume,color,user_id")
                .eq("user_id", userId)
                .gt("volume", 0)
            if (color) {
                let colorList = color.split(",")
                let colorQueryText = String()
                colorList.forEach((color, index) => {
                    colorQueryText = colorQueryText.concat( index == 0 ? `color.eq.${color.toLowerCase()}` : `,color.eq.${color.toLowerCase()}` )
                })
                
                if (colorQueryText)
                    query = query.or(colorQueryText)
            }

            const { data: assets } = await query
            if (assets) {
                return {
                    status: 200,
                    body: {
                        data: assets,
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