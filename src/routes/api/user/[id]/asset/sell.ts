import supabaseClient from "$lib/utils/supabaseClient"
import { Temporal } from "@js-temporal/polyfill"
import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"

const {
    VITE_API_KEY
} = import.meta.env

export async function post({ params, url }:RequestEvent): Promise<RequestHandlerOutput>  {
    let apiKey = url.searchParams.get("api_key")

    if (apiKey == VITE_API_KEY) {
        let id = params.id
        let assetId = url.searchParams.get("asset_id")
        let soldAt = url.searchParams.get("bought_at") || Temporal.Now.zonedDateTimeISO().toString()
        if (assetId) {
            const { data } = await supabaseClient
                .rpc("get_authorize_data", { _user_id: id, _data_request_metadata: { asset_id: assetId, type: "assets_transaction_data" } })
                .limit(1)
                .single()
            if (data) {
                if ("data" in data)  {
                    let userData = data.data.user as UsersTableRecord
                    let assetData = data.data.asset as AssetsTableRecord
                    if (assetData) {
                        let crystalData:MarketTableRecord
                        if ("crystal" in data.data) {
                            crystalData = data.data.crystal as MarketTableRecord
                        } else {
                            crystalData = {
                                id: String(),
                                color: assetData.color,
                                total_market_cap: data.data.total_market_cap,
                                crystal_market_cap: 0,
                                sellers_metadata: [],
                                rarest: 0,
                                price: 0
                            }
                        }
                        let assetMetadata = assetData.assets_metadata.at(0)
                        if (assetMetadata && assetData.volume > 0) {
                            crystalData.total_market_cap += 1
                            crystalData.crystal_market_cap += 1
                            let increaseRate = (crystalData.total_market_cap - crystalData.crystal_market_cap)/crystalData.total_market_cap
                            crystalData.price = 10 + ((Math.ceil(crystalData.total_market_cap)/2) * increaseRate)
                            crystalData.rarest = increaseRate * 100
                            assetData.volume -= 1
                            assetData.assets_metadata.shift()
                            crystalData.sellers_metadata.push({
                                sold_at: soldAt,
                                crystal_snowflake: assetMetadata.asset_snowflake,
                                created_at: assetMetadata.created_at,
                                user_id: assetData.user_id
                            })
                            let rpcSellCrystalFuncParameter = {
                                _id: assetData.id,
                                _color: assetData.color,
                                _seller_id: userData.id,
                                _price: crystalData.price,
                                _crystal_market_cap: crystalData.crystal_market_cap,
                                _total_market_cap: crystalData.total_market_cap,
                                _rarest: crystalData.rarest,
                                _crystal_market_metadata: crystalData.sellers_metadata,
                                _seller_asset_volume: assetData.volume,
                                _seller_assets_metadata: assetData.assets_metadata,
                                _is_seller_asset_created: crystalData.id != String() ? 'true' : 'false',
                                _seller_notification_metadata: {
                                    create_at: soldAt,
                                    type: "sold_asset_message",
                                    message: `<icon:${crystalData.color}-crystal> was sold.`
                                }
                            }
                            const { data: newCrystal } = await supabaseClient
                                .rpc("sell_asset", rpcSellCrystalFuncParameter)
                                .limit(1)
                                .single()
                            if (newCrystal) {
                                return {
                                    status: 200,
                                    body: newCrystal
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
                                    message: "Asset not found"
                                }
                            }
                        }
                        
                    } else {
                        return {
                            status: 400,
                            body: {
                                code: 400,
                                message: "Asset not found"
                            }
                        }
                    }  
                } else {
                    return {
                        status: 400,
                        body: data.error
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
                    message: "Asset id required"
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