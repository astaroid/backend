import supabaseClient from "$lib/utils/supabaseClient"
import { Temporal } from "@js-temporal/polyfill"
import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import Color from "color"
import { v4 as uuidV4 } from "uuid"

const {
    VITE_API_KEY
} = import.meta.env

const colorMixer = (colorA:Color, colorB:Color, percentage?:number):Color => {
    let colorAMap = colorA.object()
    let colorBMap = colorB.object()
    percentage = percentage || 0.5
    let mixedColor = {
        r: parseInt(Math.sqrt(((1.0 - percentage)*(colorAMap.r**2))+(percentage*(colorBMap.r**2))).toString()),
        g: parseInt(Math.sqrt(((1.0 - percentage)*(colorAMap.g**2))+(percentage*(colorBMap.g**2))).toString()),
        b: parseInt(Math.sqrt(((1.0 - percentage)*(colorAMap.b**2))+(percentage*(colorBMap.b**2))).toString())
    }
    return Color(mixedColor)
}

export async function post({ params, url }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")
    let createdAt = url.searchParams.get("created_at") || Temporal.Now.zonedDateTimeISO().toString()

    if (apiKey == VITE_API_KEY) {
        let id = params.id
        let assets = url.searchParams.get("assets")
        if (assets) {
            let query = assets
                .split(',')
                .map(asset => asset.toLowerCase().trim())
                .join(`' or color = '`)
                .concat(`'`)
            query = String(`color = '`).concat(query)
            if (query == `color = '`)
                query = String()
            const { data } = await supabaseClient
                .rpc("get_authorize_data", { _user_id: id, _data_request_metadata: { query, type: "asset_to_merge_data" } })
                .limit(1)
                .single()
            
            if (data) {
                if ("data" in data) {
                    let colorsToMerge = data.data.assets as string[]
                    if (colorsToMerge) {
                        colorsToMerge = colorsToMerge.map(color  => color.toLowerCase())
                        let mixColor:string|null = null
                        if (colorsToMerge.length == 0) {
                            return {
                                status: 400,
                                body: {
                                    data: null,
                                    error: {
                                        code: 208,
                                        message: "Asset not found"
                                    },
                                    ok: false
                                }
                            }
                        } else if (colorsToMerge.length == 1) {
                            return {
                                status: 400,
                                body: {
                                    data: null,
                                    error: {
                                        code: 210,
                                        message: "2 or more assets required"
                                    },
                                    ok: false
                                } 
                            }
                        } else if (colorsToMerge.length > 1) {
                            let colorMixWeightList = [ 0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88 ]
                            mixColor = colorsToMerge.reduce((mixedColor, color) => {
                                colorMixWeightList.reverse()
                                let colorMixWeight = colorMixWeightList.at(Math.ceil(Math.random() * (colorMixWeightList.length - 1))) 
                                return colorMixer(Color(mixedColor), Color(color), colorMixWeight).keyword()
                            })
                        } 
                        
                        if (mixColor) {
                            let merge_asset_metadata = {
                                created_at: createdAt,
                                bought_at: null,
                                asset_snowflake: uuidV4(),
                            } 
                            const { data } = await supabaseClient
                                .rpc("insert_merged_asset", { _user_id: id, _color: mixColor, _merged_asset_metadata: merge_asset_metadata, _parent_color_query: query })
                                .limit(1)
                                .single()
                            
                            if (data) {
                                return {
                                    status: 200,
                                    body: {
                                        data: data.asset,
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
                                        code: 209,
                                        message: "Assets required"
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
                                    code: 208,
                                    message: "Asset not found"
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
                            error: data.error,
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
        } else {
            return {
                status: 400,
                body: {
                    data: null,
                    error: {
                        code: 209,
                        message: "Assets required"
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