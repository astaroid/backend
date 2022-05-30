<script lang="ts">
    import { Stretch } from "svelte-loading-spinners"
    import { ExclamationTriangle } from "radix-icons-svelte"
    import { Button } from '@svelteuidev/core'
    import { page, session as SESSION } from "$app/stores"
    import supabaseClient from "$lib/utils/supabaseClient"
    import { goto } from '$app/navigation'
    import { browser } from "$app/env"

    let title = "Loading..."

    let session = $SESSION

    let self:HTMLElement|null = null

    let screenSize = "lg"

    let theme:"dark"|"light"|"system" = "system"

    if (Object(session).user) {
        theme = Object(session).user.theme
    }

    if (browser) {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        if (self) screenSize = getComputedStyle(self).getPropertyValue("--screen-size")
        window
	        .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", (e) => {
                theme = e.matches ? "dark" : "light"
            })
    }

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
<main bind:this={self} class={ theme == "dark" ? "dark" : theme == "light" ? "light" : void 0 }>
    {#if !hasError }
        <Stretch color={ theme == "dark" ? "white" : "#303030" } unit="px" size={150} />
    {:else}
        <ExclamationTriangle size={ screenSize == "lg" ? 140 : 120 } color={ theme == "dark" ? "white" : "#303030" } />
        <span class="error-msg">{title} error</span>
        <Button size={ screenSize == "lg" ? "md" : "sm" } href="/" variant="outline" override={{
            color: theme == "dark" ? "White" : "Black",
            borderColor: theme == "dark" ? "White" : "Black",
            "&:hover": {
                backgroundColor: "transparent"
            }
        }}>
            Go back home
        </Button>
    {/if}
</main>
<style lang="less">
    main {
        --screen-size: lg;
        overflow: hidden;
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
        &.dark {
            background-color: #181818;
            span {
                color: white;
            }
        }
        &.light {
            background-color: #eeeeee;
            span {
                color: black;
            }
        }
        @media only screen and (max-width: 480px) {
            & {
                --screen-size: sm;
            }
        }
    }
</style>