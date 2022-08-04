import supabaseClient from "$lib/utils/supabaseClient"
import { Temporal } from "@js-temporal/polyfill"
import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import fetch from "node-fetch"

const {
    VITE_ADMIN_KEY,
    VITE_API_KEY
} = import.meta.env

export async function post({ params, url }:RequestEvent): Promise<RequestHandlerOutput>  {
    let apiKey = url.searchParams.get("api_key")
    
    if (apiKey == VITE_API_KEY) {
        let id = params.id
        let crystalId = url.searchParams.get("crystal_id")
        let boughtAt = url.searchParams.get("bought_at") || Temporal.Now.zonedDateTimeISO().toString()
        if (crystalId) {
            const { data } = await supabaseClient
                .rpc("get_authorize_data", { _user_id: id, _data_request_metadata: { crystal_id: crystalId, type: "crystal_transaction_data" } })
                .limit(1)
                .single()
            if (data) {
                if ("data" in data) {
                    let userData = data.data.user as UsersTableRecord
                    let crystalData = data.data.crystal as MarketTableRecord
                    let assetData = data.data.asset as AssetsTableRecord
                    if (crystalData) {
                        if (!assetData) {
                            assetData = {
                                volume: 0,
                                assets_metadata: [],
                                user_id: id,
                                id: String(),
                                color: crystalData.color
                            }
                        }
                        let sellerMetadata = crystalData.sellers_metadata.at(0)
                        if (sellerMetadata) {
                            let oldPrice = crystalData.price * 0.9
                            let transactionFee = crystalData.price * 0.1
                            if (userData.coin >= crystalData.price) {
                                crystalData.total_market_cap -= 1
                                crystalData.crystal_market_cap -= 1
                                let increaseRate = (crystalData.total_market_cap - crystalData.crystal_market_cap)/crystalData.total_market_cap
                                crystalData.price = 10 + ((Math.ceil(crystalData.total_market_cap)/2) * increaseRate)
                                crystalData.rarest = increaseRate * 100
                                crystalData.sellers_metadata.shift()
                                assetData.volume += 1
                                assetData.assets_metadata.push({
                                    bought_at: boughtAt,
                                    asset_snowflake: sellerMetadata.crystal_snowflake,
                                    created_at: sellerMetadata.created_at
                                })
                                let rpcBuyCrystalFuncParameter = {
                                    _id: crystalData.id,
                                    _color: crystalData.color,
                                    _seller_id: sellerMetadata.user_id,
                                    _buyer_id: userData.id,
                                    _transaction_fee: transactionFee,
                                    _old_price: oldPrice,
                                    _new_price: crystalData.price,
                                    _crystal_market_cap: crystalData.crystal_market_cap,
                                    _total_market_cap: crystalData.total_market_cap,
                                    _rarest: crystalData.rarest,
                                    _sellers_metadata: crystalData.sellers_metadata,
                                    _buyer_crystal_volume: assetData.volume,
                                    _buyer_assets_metadata: assetData.assets_metadata,
                                    _is_buyer_asset_created: assetData.id != String() ? 'true' : 'false',
                                    _buyer_notification_metadata: {
                                        create_at: boughtAt,
                                        type: "bought_crystal_message",
                                        message: `<icon:${crystalData.color}-crystal> was bought for <icon:coin>${oldPrice}.`
                                    }
                                }
                                const { data: newAsset } = await supabaseClient
                                    .rpc("buy_crystal", rpcBuyCrystalFuncParameter)
                                    .limit(1)
                                    .single()
                                if (newAsset) {
                                    if (rpcBuyCrystalFuncParameter._total_market_cap > 10)
                                        fetch(`${url.protocol}//${url.host}/api/market?admin_key=${VITE_ADMIN_KEY}`,  { method: "POST" }).catch(null)
                                    return {
                                        status: 200,
                                        body: newAsset
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
                                        message: "Insufficient coins", 
                                        code: 400
                                    }
                                }
                            }
                        } else {
                            return {
                                status: 400,
                                body: {
                                    message: "Crystal not found", 
                                    code: 400
                                }
                            }
                        }
                    } else {
                        return {
                            status: 400,
                            body: {
                                code: 400,
                                message: "Crystal not found"
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
                    message: "Crystal id required"
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