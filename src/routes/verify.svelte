<script lang="ts">
    import { Stretch } from "svelte-loading-spinners"
    import { ExclamationTriangle } from "radix-icons-svelte"
    import { Button } from '@svelteuidev/core'
    import { page } from "$app/stores"
    import supabaseClient from "$lib/utils/supabaseClient"
    import { goto } from '$app/navigation'

    let title = "Loading..."

    let hasError = false

    let url = $page.url

    let urlHashList:string[] = url.hash.substring(1).split("&")

    let urlHashMap:Map<string, string> = new Map<string, string>()

    urlHashList.forEach((param) => {
        let [key, value] = param.split("=")
        urlHashMap.set(key, value)
    })

    if (urlHashMap.has("error_description")) {
        hasError = true
        title = "Token"
    } else if (urlHashMap.has("access_token")) {
        let type = urlHashMap.get("type") as string
        let accessToken = urlHashMap.get("access_token") as string
        if (type == "recovery") {
            title = "Email Verification"
            let userAuth = supabaseClient.auth.api.updateUser(
                accessToken, 
                { 
                    data: { 
                        email_confirm: true 
                    } 
                }
            )
            .then(({ user }) => {
                if (user) {
                    fetch("/api/session", {
                        method: 'post',
                        body: JSON.stringify({
                            user: {
                                id: user.id,
                                verify: true
                            }
                        }),
                        headers: {'Content-Type': 'application/json'}
                    })
                    .then(async () => {
                        await goto("/")
                    })
                    .catch(_ => {
                        hasError = true
                    })
                } else {
                    hasError = true
                }
            })
            .catch(_ => {
                hasError = true
            })
        } else if (type == "magiclink") {
            title = "Magic Link"
            let userAuth = supabaseClient.auth.api.getUser(accessToken)
                .then(({ user }) => {
                    if (user) {
                        fetch("/api/session", {
                            method: 'post',
                            body: JSON.stringify({
                                user: {
                                    id: user.id,
                                    verify: user.user_metadata.email_confirm
                                }
                            }),
                            headers: {'Content-Type': 'application/json'}
                        })
                        .then(async () => {
                            await goto("/")
                        })
                        .catch(_ => {
                            hasError = true
                        })
                    } else {
                        hasError = true
                    }
                })
                .catch(_ => {
                    hasError = true
                })
        }            
        
    }
</script>
<svelte:head>
    <title>{title} { title == "Loading..." ? "": !hasError ? "| Astaroid" : "Error" }</title>
</svelte:head>
<main>
    {#if !hasError }
        <Stretch color="#303030" unit="px" size={150} />
    {:else}
        <ExclamationTriangle color="rgb(220, 0, 0)" size={130} />
        <span class="error-msg">{title} error</span>
        <Button href="/" variant="outline" color="gray">
            Go back home
        </Button>
    {/if}
</main>
<style lang="less">
    main {
        overflow: hidden;
        background-color: #eeeeee;
        position: fixed;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-wrap: wrap;
        justify-content: center;
        span.error-msg {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 38px;
            text-align: center;
            text-transform: capitalize;
            padding-top: 5px;
            margin-bottom: 10px;
        }
    }
</style>