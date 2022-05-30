<script lang="ts">
    export let theme:"system"|"dark"|"light" = "system"
</script>
<main 
    class="splash-screen" 
    id={ theme == "dark" ? "dark" :  theme == "light" ? "light" : void 0 } 
>
    
</main>