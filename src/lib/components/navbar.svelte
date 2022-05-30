<script lang="ts">
    import { 
        Home, 
        Archive, 
        Bell, 
        PaperPlane,
        Person
    } from 'radix-icons-svelte'

    interface User {
        id: string
        username: string
        password: string
        email: string
        profile_image: string
        created_at: string
        coin: number
        email_confirm: string
    }

    export let theme:"light"|"dark"|"system" = "system"

    export let currentTab:string

    export let user:User

    const Tabs = ["home", "assests", "notifications", "requests"]
</script>
<nav class={ theme == "dark" ? "dark" : theme == "light" ? "light" : void 0 }>
    <section class="top-nav-bar">
        {#each Tabs as  tab }
        <button class="tab-button" data-tab={ currentTab == tab ? "current" : void 0}>
            {#if tab == "home"}
                <Home size={30} color={ currentTab == tab ? theme == "dark" ? "white" : "rgb(5, 5, 5)" : theme == "dark" ? "rgb(190, 190, 190)" : "rgb(120, 120, 120)"} />
            {:else if tab == "assests"}
                <Archive size={30} color={ currentTab == tab ? theme == "dark" ? "white" : "rgb(5, 5, 5)" : theme == "dark" ? "rgb(190, 190, 190)" : "rgb(120, 120, 120)" } />
            {:else if tab == "notifications"}
                <Bell size={30} color={ currentTab == tab ? theme == "dark" ? "white" : "rgb(5, 5, 5)" : theme == "dark" ? "rgb(190, 190, 190)" : "rgb(120, 120, 120)" } />
            {:else if tab == "requests"}
                <PaperPlane size={30} color={ currentTab == tab ? theme == "dark" ? "rgb(5, 5, 5)" : "black" : theme == "dark" ? "rgb(190, 190, 190)" : "rgb(120, 120, 120)" } />
            {/if}
            <span>{tab}</span>
        </button>
    {/each}
    </section>
    <section class="bottom-nav-bar">
        <button title={user.username}>
            {#if  user.profile_image }
                <img src={user.profile_image} alt="" />
            {:else}
                <Person size={27} color="white" />
            {/if}
            <span>{user.username}dertr</span>
        </button>
    </section>
</nav>
<style lang="less">
    nav {
        background-color: white;
        position: fixed;
        height: calc(100% - 20px);
        width: 190px;
        border-style: solid;
        border-width: 0;
        padding: 20px 0 20px 0;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: space-between;
        section {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            button {
                height: 55px;
                padding-left: 20px;
                width: 100%;
                outline: none;
                border-style: solid;
                border-width: 0px;
                background-color: transparent;
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                cursor: pointer;
            }
            &.top-nav-bar {
                height: calc(55px * 4);
                button.tab-button {
                    border-left-width: 4px;
                    border-color: transparent;
                    span {
                        margin-left: 18px;
                        font-size: 18px;
                        margin-top: 2px;
                        text-transform: capitalize;
                    }
                }
            }
            &.bottom-nav-bar {
                height: 55px;
                button {
                    background-color: #06d6a0;
                    img {
                        height: 30px;
                        width: 30px;
                        border-radius: calc(30px/2);
                        border-width: 2px;
                        border-style: solid;
                        border-color: white;
                    }
                    span {
                        margin-left: 18px;
                        margin-top: 2px;
                        font-size: 17.25px;
                        color: white;
                        font-weight: lighter;
                        width: 112px;
                        white-space:nowrap;
                        overflow:hidden;
                        text-overflow:ellipsis;
                    }
                }
            } 
        }

        &.dark {
            background-color: #212121;
            border-color: rgb(60, 60, 60);
            border-right-width: 0.5px;
            section.top-nav-bar button.tab-button {
                span {
                    color: rgb(190, 190, 190);
                    font-weight: lighter;
                }
                &[data-tab="current"] {
                    border-color: white;
                    span {
                        font-weight: bolder;
                        color: white;
                    }
                }
                &:hover {
                    background-color: lighten(#212121, 7%);
                }
            }

            @media only screen and (max-width: 480px) {
                & {
                    border-color: rgb(65, 65, 65);

                    section.top-nav-bar button.tab-button[data-tab="current"] {
                        border-color: transparent;
                    }

                }
            }
        }

        &.light {
            background-color: white;
            border-color: #d6d6d6;
            border-right-width: 0.5px;
            section.top-nav-bar button.tab-button {
                span {
                    color: rgb(25, 25, 25);
                    font-weight: lighter;
                }
                &[data-tab="current"] {
                    border-color: rgb(10, 10, 10);
                    span {
                        font-weight: bolder;
                        color: rgb(10, 10, 10);
                    }
                }
                &:hover {
                    background-color: darken(white, 5.35%);
                }
            }

            @media only screen and (max-width: 480px) {
                & {
                    border-color: rgb(65, 65, 65);
                    section.top-nav-bar button.tab-button[data-tab="current"] {
                        border-color: transparent;
                    }

                    section.bottom-nav-bar button img {
                        border-color: #c7c6c6;
                    }
                }
            }
        }

        @media only screen and (max-width: 480px) {
            & {
                width: 100%;
                height: 55px;
                bottom: 0;
                border-top-width: 1px;
                border-style: solid;
                border-width: 0;
                padding: 0 0 0 0;
                display: flex;
                flex-direction: column;
                flex-wrap: wrap;
                justify-content: space-between;
                section {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    button {
                        height: 100%;
                        width: calc(100% / 5);
                        outline: none;
                        border-style: solid;
                        border-width: 0px;
                        background-color: transparent;
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: center;
                        align-content: center;
                    }
                    &.top-nav-bar {
                        width: calc((100% / 5) * 4);
                        button.tab-button {
                            padding-right: 0px;
                            padding-left: 0px;
                            border-width: 0px;
                            border-color: transparent;
                            span {
                                display: none;
                            }
                        }
                    }
                    &.bottom-nav-bar {
                        width: calc(100% / 5);
                        height: 100%;
                        button {
                            background-color: transparent;
                            width: 100%;
                            justify-content: space-between;
                            padding-right: 0px;
                            img {
                                height: 35px;
                                width: 35px;
                                border-radius: calc(35px/2);
                                border-width: 2px;
                                border-style: solid;
                                border-color: white;
                            }
                            span {
                                display: none;
                            }
                        }
                    } 
                }
            }
        }

        @media only screen and (min-width: 992px) {
            & {
                width: 230px;
                section.bottom-nav-bar button span {
                    width: 136px;
                }
            }
        }
    }
</style>