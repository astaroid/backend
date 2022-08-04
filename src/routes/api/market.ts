import supabaseClient from "$lib/utils/supabaseClient"
import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"
import { v4 as uuidV4, NIL as nilV4 } from "uuid"
import { Temporal } from "@js-temporal/polyfill"
import Color from "color"

const {
    VITE_ADMIN_KEY,
    VITE_API_KEY
} = import.meta.env

let rainbowColors:string[] = [
    "#FFC107",
    "#FF6F00",
    "#00E676",
    "#03A9F4",
    "#33691E",
    "#E65100",
    "#F44336",
    "#2196F3",
    "#00BCD4",
    "#FF5722",
    "#673AB7",
    "#4CAF50",
    "#EEFF41",
    "#E91E63",
    "#FFEB3B"
]

function shuffle<T>(array:Array<T>): Array<T> {
    let currentIndex = array.length,  randomIndex;
  
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
  
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

export async function get({ url }:RequestEvent) {
    let apiKey = url.searchParams.get("api_key")
    
    if (apiKey == VITE_API_KEY) {
        let query = supabaseClient
            .from<{ id:string, color:string, rarest:number, price:number, crystal_market_cap:number }>("market")
            .select("color,price,rarest,crystal_market_cap")
        let search = url.searchParams.get("search")
        let order = url.searchParams.get("order") as "asc-price"|"asc-rarest"|"desc-price"|"desc-rarest"
        
        if (search) {
            let searchList = search.split(",")
            let searchQuery = {
                color: String(),
                price: String(),
                rarest: String()
            }
            searchList.forEach(searchValue => {
                let [searchType, searchRange] = searchValue.split(":")
                if (searchType && searchRange) {
                    searchType = searchType.toLowerCase()
                    if (searchType == "color") {
                        searchRange = searchRange.toLowerCase()
                        searchQuery.color = searchQuery.color == "" ? `color.eq.${searchRange}` : searchQuery.color.concat(`,color.eq.${searchRange}`)
                    } else if (searchType == "price") {
                        let price = parseFloat(searchRange)
                        searchQuery.price = searchQuery.price == "" ? `price.eq.${price}` : searchQuery.price.concat(`,price.eq.${price}`)
                    } else if (searchType == "rarest") {
                        let rarest = parseFloat(searchRange)
                        searchQuery.rarest = searchQuery.rarest == "" ? `rarest.eq.${rarest}` : searchQuery.rarest.concat(`,rarest.eq.${rarest}`)
                    }
                }
            })
            let searchQueryGroup = searchQuery.color ? searchQuery.color : ""
            searchQueryGroup = searchQuery.price ? searchQueryGroup.concat(`,or(${searchQuery.price})`) : searchQueryGroup.concat("")
            searchQueryGroup = searchQuery.rarest ? searchQueryGroup.concat(`,or(${searchQuery.rarest})`) : searchQueryGroup.concat("")
            if (searchQueryGroup)
                query = query.or(searchQueryGroup)
        }

        if (order) {
            if (order == "asc-price")
                query = query.order("color", { ascending: true })
            else if (order == "desc-price")
                query = query.order("color", { ascending: false })
            else if (order == "asc-rarest")
                query = query.order("color", { ascending: true })
            else if (order == "desc-rarest")
                query = query.order("color", { ascending: false })
        }

        query = query.gt("crystal_market_cap", 0)
        
        let { data, error } = await query
        if (!error) {
            return {
                status: 200,
                body: JSON.stringify(data)
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
                message: "Incorrect api key"
            }
        }
    }
}

export async function post({ url }:RequestEvent): Promise<RequestHandlerOutput> {
    let adminKey = url.searchParams.get("admin_key")

    if (adminKey == VITE_ADMIN_KEY) { 
        rainbowColors = shuffle(rainbowColors)
        let pickedColor = rainbowColors.at(Math.ceil(0 + (Math.random() * (rainbowColors.length - 1)))) as string
        pickedColor = Color(pickedColor).keyword()
        const { data, error } = await supabaseClient
            .from<MarketTableRecord>("market")
            .select("*")
            .like("color", `%${pickedColor}%`)
            .limit(1)
        if (!error) {
            let crystalData = data.at(0)
            if (crystalData) {
                crystalData.crystal_market_cap += 1
                crystalData.total_market_cap += 1
                let increaseRate = (crystalData.total_market_cap - crystalData.crystal_market_cap)/crystalData.total_market_cap
                crystalData.price = 10 + ((Math.ceil(crystalData.total_market_cap)/2) * increaseRate)
                crystalData.rarest = increaseRate * 100
                crystalData.sellers_metadata.push({
                    crystal_snowflake: uuidV4(),
                    user_id: "ad9af320-04d9-4654-81af-7a96a8cba76a",
                    created_at: Temporal.Now.zonedDateTimeISO().toString(),
                    sold_at: Temporal.Now.zonedDateTimeISO().toString()
                })
                let {
                    id: _id,
                    color: _color,
                    price: _price,
                    crystal_market_cap: _crystal_market_cap,
                    total_market_cap: _total_market_cap,
                    rarest: _rarest,
                    sellers_metadata: _sellers_metadata
                } = crystalData
                await supabaseClient.rpc("create_crystal", { action: "update", _color, _crystal_market_cap, _id, _price, _rarest, _sellers_metadata, _total_market_cap})
                return {
                    status: 200
                }
            } else {
                let firstRecord = await supabaseClient
                    .from<{total_market_cap: number}>("market")
                    .select("total_market_cap")
                    .limit(1)
                if (!firstRecord.error) {
                    let firstRecordData = firstRecord.data.at(0)
                    if (firstRecordData) {
                        let increaseRate = (firstRecordData.total_market_cap - 1)/firstRecordData.total_market_cap
                        let newCrystal:MarketTableRecord = {
                            color:pickedColor,
                            crystal_market_cap: 1,
                            total_market_cap: firstRecordData.total_market_cap + 1,
                            rarest: increaseRate * 100,
                            price: 10 + ((Math.ceil(firstRecordData.total_market_cap)/2) * increaseRate),
                            sellers_metadata: [{
                                crystal_snowflake: uuidV4(),
                                user_id: "ad9af320-04d9-4654-81af-7a96a8cba76a",
                                created_at: Temporal.Now.zonedDateTimeISO().toString(),
                                sold_at: Temporal.Now.zonedDateTimeISO().toString()
                            }]
                        }
                        let {
                            id: _id,
                            color: _color,
                            price: _price,
                            crystal_market_cap: _crystal_market_cap,
                            total_market_cap: _total_market_cap,
                            rarest: _rarest,
                            sellers_metadata: _sellers_metadata
                        } = newCrystal
                        await supabaseClient.rpc("create_crystal", { action: "insert", _id: nilV4, _color, _crystal_market_cap, _price, _rarest, _sellers_metadata, _total_market_cap})
                    } else {
                        let newCrystal:MarketTableRecord = {
                            color:pickedColor,
                            crystal_market_cap: 1,
                            total_market_cap: 1,
                            rarest: 0,
                            price: 10,
                            sellers_metadata: [{
                                crystal_snowflake: uuidV4(),
                                user_id: "ad9af320-04d9-4654-81af-7a96a8cba76a",
                                created_at: Temporal.Now.zonedDateTimeISO().toString(),
                                sold_at: Temporal.Now.zonedDateTimeISO().toString()
                            }]
                        }
                        await supabaseClient
                            .from("market")
                            .insert(newCrystal)
                    }
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
                message: "Incorrect admin key"
            }
        }
    }
}