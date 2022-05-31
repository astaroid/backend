<script lang="ts">
    import { Stretch } from "svelte-loading-spinners"

    export let email:string

    export let id:string
    
   $:isLoading = false

    const verify = () => {
        isLoading = true
        fetch("/api/auth/confirm-email", {
            method: 'post',
            body: JSON.stringify({
                id
            }),
            headers: {'Content-Type': 'application/json'}
        })
        .finally(() => isLoading = false)
        
    }
</script>
<section>
    <p>Verify email <span>{email}</span></p>
    {#if !isLoading }
        <button on:click={verify} id="verifier">Send verification</button>
    {:else}
        <Stretch color="white" size={40} unit="px" />
    {/if}
</section>
<style lang="less">
    section {
        width: calc(100% - 26px);
        height: 40px;
        color: white;
        background-color: #06d6a0;
        font-size: 18px;
        padding-top: 8px;
        padding-left: 13px;
        padding-right: 13px;
        padding-bottom: 8px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        font-family: Arial, Helvetica, sans-serif;
        p {
            margin: 0 0 0 0;
            span {
                font-weight: bold;
            }
        }
        button#verifier {
            background-color: transparent;
            border-style: solid;
            border-width: 1.5px;
            border-radius: 4px;
            color: white;
            border-color: white;
            cursor: pointer;
            height: 35px;
            width: 150px;
            font-size: 16px;
        }
        @media only screen and (max-width: 480px) {
            & {
                font-size: 14.5px;
                button#verifier {
                    font-size: 13px;
                    width: 135px;
                    height: 30px;
                }
            }
        } 

        @media only screen and (min-width: 481px) and (max-width: 750px) {
            & {
                font-size: 15.25px;
                button#verifier {
                    font-size: 14px;
                    width: 130px;
                    height: 30px;
                }
            }
        }
    }
</style>