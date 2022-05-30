<script lang="ts">
    import { ExclamationTriangle, Reload } from "radix-icons-svelte"
    import { onMount } from "svelte"
    import { Button } from "@svelteuidev/core"

    export let theme:"dark"|"light" = "light"

    let self:HTMLElement|null = null

    let screenSize = "lg"

    onMount(() => {
        if  (self) screenSize = getComputedStyle(self).getPropertyValue("--screen-size")
    })
</script>
<main bind:this={self} class={ theme == "dark" ? "dark" : "light" }>
    <ExclamationTriangle size={ screenSize == "lg" ? 140 : 120 } color={ theme == "dark" ? "white" : "#303030" } />
    <span>No connection</span>
    <Button size={ screenSize == "lg" ? "md" : "sm" } href="/app" variant="outline" override={{
        color: theme == "dark" ? "White" : "Black",
        borderColor: theme == "dark" ? "White" : "Black",
        "&:hover": {
            backgroundColor: "transparent"
        }
    }}>
        <Reload slot="leftIcon" />
        Retry
    </Button>
</main>
<style lang="less">
    main {
        --screen-size: lg;  
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        span {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 40px;
            text-align: center;
            text-transform: capitalize;
            padding-top: 5px;
            margin-bottom: 20px;
        }
        &.light {
            background-color: #eeeeee;
            span {
                color: black;
            }
        }
        &.dark {
            background-color: #181818;
            span {
                color: white;
            }
        }
        @media only screen and (max-width: 480px) {
            & {
                --screen-size: sm;  
                span {
                    font-size: 33px;
                }
            }
        }
    }
</style>