import supabaseClient from "$lib/utils/supabaseClient"
import type { RequestHandlerOutput } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit/types/internal"

const {
    VITE_API_KEY
} = import.meta.env

export async function get({ url, params }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")
    
    if (apiKey == VITE_API_KEY) {
        let id = params.id
        const { data } = await supabaseClient
            .rpc("get_authorize_data", { _user_id: id, _data_request_metadata: { type: "notification_data" } })
            .limit(1)
            .single()
        if (data) {
            if ("data" in data)  {
                return {
                    status: 200,
                    body: {
                        data: data.data,
                        error: null,
                        ok: true
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
                    code: 102,
                    message: "Incorrect api key"
                },
                ok: false
            }
        }
    }
}

export async function post({ url, params }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")
    
    if (apiKey == VITE_API_KEY) {
        let id = params.id
        let notificationId = url.searchParams.get("notification_id")
        let read = url.searchParams.get("read") || "false"
        if (notificationId) {
            const { data } = await supabaseClient
                .rpc("update_notification", { _user_id: id, _notification_id: notificationId, _read: read.toLowerCase().trim() })
                .limit(1)
                .single()
            if (data) {
                if ("data" in data)  {
                    let notification = data.data
                    if (notification) {
                        return {
                            status: 200,
                            body: {
                                data: notification,
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
                                    code: 214,
                                    message: "Notification not found"
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
                        code: 213,
                        message: "Notification id required"
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

export async function del({ url, params }:RequestEvent): Promise<RequestHandlerOutput> {
    let apiKey = url.searchParams.get("api_key")
    
    if (apiKey == VITE_API_KEY) {
        let id = params.id
        let notificationId = url.searchParams.get("notification_id")
        if (notificationId) {
            const { data } = await supabaseClient
                .rpc("delete_notification", { _user_id: id, _notification_id: notificationId })
                .limit(1)
                .single()
            if (data) {
                if ("data" in data)  {
                    let notification = data.data
                    if (notification) {
                        return {
                            status: 200,
                            body: {
                                data: notification,
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
                                    code: 214,
                                    message: "Notification not found"
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
                        code: 213,
                        message: "Notification id required"
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