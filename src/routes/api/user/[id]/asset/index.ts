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
                .select("id, user_id, volume, color")
                .eq("user_id", userId)
            if (color) {
                let colorList = color.split(".")
                let colorQueryText = String()
                colorList.forEach((color, index) => {
                    colorQueryText = colorQueryText.concat( index == 0 ? `color.eq.${color.toUpperCase()}` : `,color.eq.${color.toUpperCase()}` )
                })
                if (colorQueryText)
                    query = query.or(colorQueryText)
            }

            const { data: assets } = await query
            if (assets) {
                return {
                    status: 200,
                    body: assets
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
        
    } else {
        return {
            status: 400,
            body: {
                code: 400,
                message: "Incorrect api key"
            }
        }
    }
}