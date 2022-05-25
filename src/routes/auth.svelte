<script lang="ts">
    import { page } from '$app/stores'
    import { Checkbox } from '@svelteuidev/core'
    import { Stretch, Circle } from "svelte-loading-spinners"
    import { goto } from '$app/navigation'

    let currentTab:"signin"|"signup"

    if ($page.url.searchParams.has("type")) {
        let searchParamsTypeValue = $page.url.searchParams.get("type")
        if (searchParamsTypeValue) {
            currentTab = searchParamsTypeValue == "signup" ? "signup" : "signin"
        } else {
            currentTab = "signin"
        }
    } else {
        currentTab = "signin"
    }
     
    
    let signinData = {
        usernameOrEmail: "",
        password: ""
    }

    let signinError:{
        [name:string]: null|string
    } = {
        usernameOrEmail: null,
        password: null
    }

    let signupData = {
        email: "",
        password: "",
        username: "",
        hasAgree: true
    }

    let signupError:{
        [name:string]: null|string
    } = {
        username: null,
        password: null,
        email: null
    }

    let isAuthLoading = false

    let isMagicLinkRequest = false

    const onMagicLink = async (e:MouseEvent) => {
        e.preventDefault()
        isMagicLinkRequest = true
        let { usernameOrEmail } = signinData
        let isUsernameOrEmailVerify = true
        const emailRegExpValidator = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
        if (!usernameOrEmail) {
            signinError["usernameOrEmail"] = "Field is empty"
            isUsernameOrEmailVerify = false
        }

        if (isUsernameOrEmailVerify && !emailRegExpValidator.test(usernameOrEmail.toLowerCase())) {
            signinError["usernameOrEmail"] = "Invailed email format"
            isUsernameOrEmailVerify = false
        } 

        if (isUsernameOrEmailVerify) {
            let res = await fetch("/api/auth/magic-link", {
                method: 'post',
                body: JSON.stringify({
                    email: usernameOrEmail
                }),
                headers: {'Content-Type': 'application/json'}
            })
            if (res.status == 400) {
                isMagicLinkRequest = false
                signinError["usernameOrEmail"] = "Email doesn't exist"
            } else {
                signinError["usernameOrEmail"] = null
                isMagicLinkRequest = false
            }
        }

        isMagicLinkRequest = false
    }

    const onSignIn = async () => {
        isAuthLoading = true
        let { usernameOrEmail, password } = signinData
        let isUsernameOrEmailVerify = true, 
            isPasswordVerify = true
        if (!usernameOrEmail) {
            signinError["usernameOrEmail"] = "Field is empty"
            isUsernameOrEmailVerify = false
        }
        if (!password) {
            signinError["password"] = "Password field is empty"
            isPasswordVerify = false
        }
        if (isUsernameOrEmailVerify && isPasswordVerify) {
            let res = await fetch("/api/auth/signin", {
                method: 'post',
                body: JSON.stringify({
                    usernameOrEmail,
                    password,
                }),
                headers: {'Content-Type': 'application/json'}
            })
            if (res.status == 200) {
                let body = await res.json()
                fetch("/api/session", {
                    method: 'post',
                    body: JSON.stringify(body),
                    headers: {'Content-Type': 'application/json'}
                })
                .then(() => {
                    signinError["usernameOrEmail"] = null
                    signinError["password"] = null
                    isAuthLoading = true
                    goto("/")
                })
                .catch(_ => {
                    signinError["usernameOrEmail"] = "Unresigstered session"
                    signinError["password"] = "Unresigstered session"  
                })
            } else if (res.status == 400) {
                let { message } = await res.json() as { message:string }
                if (message.toLowerCase().search("username") > -1) {
                    signinError["usernameOrEmail"] = message
                } else if (message.toLowerCase().search("password") > -1) {
                    signinError["password"] = message
                } else {
                    signinError["username"] = "Backend error"
                    signinError["password"] = "Backend error"  
                    signinError["email"] = "Backend error"
                }
            }
        }
        isAuthLoading = false
    }
   
    const onSignUp = async () => {
        isAuthLoading = true
        let { 
            email,
            password,
            username,
            hasAgree 
        } = signupData
        const emailRegExpValidator = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
        const passwordRegExpValidator = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/
        let isEmailVerify = true, 
            isPasswordVerify = true,
            isUsernameVerify = true
        
        if (!email) {
            signupError["email"] = "Email field is empty"
            isEmailVerify = false
        }  

        if (!username) {
            signupError["username"] = "Username field is empty" 
            isUsernameVerify = false
        }

        if (!password) {
            signupError["password"] = "Password field is empty"
            isPasswordVerify = false
        }
            
        if (!emailRegExpValidator.test(email.toLowerCase()) && email) {
            signupError["email"] = "Invailed email format"
            isEmailVerify = false
        }

        if(username.length < 5) {
            signupError["username"] = "Username must be at least six characters"
            isEmailVerify = false
        }

        if (!passwordRegExpValidator.test(password.toLowerCase()) && password) {
            signupError["password"] = "Password must be at least six characters with one number and special character"
            isPasswordVerify = false
        }

        
        if (hasAgree && isEmailVerify && isPasswordVerify && isUsernameVerify) {
            let res = await fetch("/api/auth/signup", {
                method: 'post',
                body: JSON.stringify({
                    email,
                    password,
                    username
                }),
                headers: {'Content-Type': 'application/json'}
            })

            if (res.status == 200) {
                let body = await res.json()
                fetch("/api/session", {
                    method: 'post',
                    body: JSON.stringify(body),
                    headers: {'Content-Type': 'application/json'}
                })
                .then(() => {
                    signupError["username"] = null
                    signupError["password"] = null
                    signupError["email"] = null
                    isAuthLoading = true
                    goto("/")
                })
                .catch(_ => {
                    signupError["username"] = "Unresigstered session"
                    signupError["password"] = "Unresigstered session"  
                    signupError["email"] = "Unresigstered session"  
                })
            } else if (res.status == 400) {
                let { message } = await res.json() as { message:string }
                if (message.toLowerCase().search("username") > -1) {
                    signupError["username"] = message
                } else if (message.toLowerCase().search("email") > -1) {
                    signupError["email"] = message
                } else {
                    signupError["username"] = "Backend error"
                    signupError["password"] = "Backend error"  
                    signupError["email"] = "Backend error"
                }
            }
            
            
        }
        isAuthLoading = false
    }
</script>
<svelte:head>
    <title>
        {currentTab == "signin" ? "Sign in" : "Sign up"} | Astaroid
    </title>
</svelte:head>
<main>
    <section class="tab-container">
        <header>
            <button on:click={_ => currentTab = "signin"} style="border-color: {currentTab == "signin" ? "#303030" : "transparent"}" >Sign in</button>
            <button on:click={_ => currentTab = "signup"} style="border-color: {currentTab == "signup" ? "#303030" : "transparent"}" >Sign up</button>
        </header>
        {#if currentTab == "signin"}
            <section class="tab" id="sign-in">
                <input data-type={ signinError.usernameOrEmail ? "text-error" : "text" } placeholder="Username or email" bind:value={signinData.usernameOrEmail}>
                {#if signinError.usernameOrEmail }
                    <p data-type="error-message">{signinError.usernameOrEmail}</p>
                {/if}
                <input type="password" data-type={ signinError.password ? "text-error" : "text" } placeholder="Password" bind:value={signinData.password}>
                {#if signinError.password }
                    <p data-type="error-message">{signinError.password}</p>
                {/if}
                <div data-type="magic-link-container">
                    {#if !isMagicLinkRequest }
                        <a on:click={onMagicLink} href="/api/auth/magic-link">Send magic link</a>
                    {:else}
                        <Circle unit="px" size={15} color="#303030" />
                    {/if}
                    
                </div>
                <button on:click={onSignIn} >
                    {#if !isAuthLoading }
                        Continue
                    {:else}
                        <Stretch color="white" unit="px" size={45} />
                    {/if}
                </button>
            </section>
        {:else if currentTab == "signup"}
            <section class="tab" id="sign-up">
                <input data-type={ signupError.email ? "text-error" : "text"  } placeholder="Email" bind:value={signupData.email}>
                {#if signupError.email }
                    <p data-type="error-message">{signupError.email}</p>
                {/if}
                <input data-type={ signupError.username ? "text-error" : "text"  } placeholder="Username" bind:value={signupData.username}>
                {#if signupError.username }
                    <p data-type="error-message">{signupError.username}</p>
                {/if}
                <input type="password" data-type={ signupError.password ? "text-error" : "text"  } placeholder="Password" bind:value={signupData.password}>
                {#if signupError.password }
                    <p data-type="error-message">{signupError.password}</p>
                {/if}
                <div data-type="policy-container">
                    <Checkbox size="xs" bind:checked={signupData.hasAgree} />
                    <span>Agree to the <a href="/policy" target="_blank" rel="noopener noreferrer">Privacy policy</a></span>
                </div>
                <button on:click={onSignUp} disabled={!signupData.hasAgree && !isAuthLoading} >
                    {#if !isAuthLoading }
                        Continue
                    {:else}
                        <Stretch color="white" unit="px" size={45} />
                    {/if}
                </button>
            </section>
        {/if}
        
    </section>
</main>
<style lang="less">
    main {
        overflow: hidden;
        background-color: #eeeeee;
        height: 100%;
        width: 100%;
        position: fixed;
        display: flex;
        flex-direction: column;
        align-content: center;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;
        section.tab-container {
            background-color: white;
            width: 340px;
            height: 490px;
            padding: 0 0 0 0;
            border-style: solid;
            border-width: 1px;
            border-color: #d6d6d6;
            header {
                width: 100%;
                height: 70px;
                background-color: #fafafa;
                border-style: solid;
                border-width: 0 0 1px 0;
                border-color: #d6d6d6;
                box-shadow: 0px 2px 1px 0px #f5f5f5;
                display: flex;
                button {
                    height: 100%;
                    width: 50%;
                    font-size: 19px;
                    background-color: transparent;
                    border-color: transparent;
                    border-style: solid;
                    border-width: 0px;
                    border-bottom-width: 3px;
                    font-weight: bold;
                    color: #303030;
                    &:focus {
                        outline: none;
                    }
                }
            }
            section.tab {
                width: calc(100% - 45px);
                height: calc(100% - 70px);
                padding: 22.5px;
                button {
                    width: calc(100%);
                    margin-bottom: 20px;
                    font-size: 17px;
                    padding: 12px;
                    outline: none;
                    height: 45px;
                    border-width: 0;
                    border-radius: 5px;
                    color: white;
                    font-weight: bold;
                    background-color: #303030;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex-wrap: nowrap;
                    &:hover {
                        background-color: #424242;
                    }
                    &:disabled {
                        background-color: lighten(#303030, 15%);
                    }
                }
                p[data-type="error-message"] {
                    margin: -5px 0 0 0;
                    padding: 0 0 13px 3px;
                    font-size: 15.5px;
                    color: rgb(245, 0, 0);
                    font-family: Arial, Helvetica, sans-serif;
                }
                input[data-type="text"], 
                input[data-type="text-error"] {
                    width: calc(100% - 24px);
                    margin-bottom: 20px;
                    font-size: 15px;
                    padding: 12px;
                    outline: none;
                    height: 20px;
                    border-width: 1px;
                    border-style: solid;
                    border-radius: 5px;
                    border-color: #bdbdbd;
                    &:focus {
                        outline: none;
                        border-color: #2196f3;
                        box-shadow: 0 0 1.5px 0px #2196f3;
                    }
                }
                input[data-type="text-error"] {
                    box-shadow: 0 0 1.5px 0px red;
                    border-color: red;
                }
                a {
                    color: #424242;
                    &:link {
                        outline: none;
                    }
                }
                &#sign-in {
                    div[data-type="magic-link-container"] {
                        display: flex;
                        margin-bottom: 15px;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 15.5px; 
                        justify-content: flex-end;
                        a {
                            text-decoration: none;
                            &:hover {
                                text-decoration: underline;
                            }
                        }
                    }
                }
                &#sign-up {
                    div[data-type="policy-container"] {
                        display: flex;
                        margin-bottom: 15px;
                        span {
                            color: #616161;
                            padding-top: 2px;
                            padding-left: 8px;
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 15.5px; 
                        }
                    }
                }
            }
            @media only screen and (max-width: 480px) {
                width: 100%;
                height: 100%;
            }
            @media only screen and (min-width : 768px) and (max-width : 978px) {
                width: 340px;
                height: 490px;
            }
            @media only screen and (min-width: 979px) and (max-width : 1023px) {
                width: 360px;
                height: 490px;
            }
            @media only screen and (min-width: 1024px) and (max-width : 1119px) {
                width: 400px;
                height: 490px;
            }
            @media only screen and (min-width: 1200px) {
                width: 420px;
                height: 490px;
            }
        }
    }
</style>