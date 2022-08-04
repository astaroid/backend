declare interface MarketTableRecord {
    id?: string
    color: string
    price: number
    crystal_market_cap: number
    rarest: number
    sellers_metadata: {
        created_at: string
        sold_at: string
        user_id: string
        crystal_snowflake: string
    }[]
    total_market_cap: number
}


declare interface AssetsTableRecord {
    id: string
    color: string
    volume: number
    user_id: string
    assets_metadata: {
        created_at: string
        bought_at: string
        asset_snowflake: string
    }[]
}

declare interface UsersTableRecord {
    id: string
    coin: number
    email: string
    password: string
    username: string
    created_at: string
    email_confirm: string
    profile_image: string
}