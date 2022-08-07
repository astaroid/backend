<script context="module" lang="ts">
    /** @type {import('@sveltejs/kit').Load} */
    export async function load(e:any) {
      return {
        props: {
            status: e.status,
            path: e.url.pathname,
        }
      };
    }
</script>

<script lang="ts">
    export let status:number
    
    export let path:string

</script>

<div style="margin: 15px; font-size: 15px">
    <code>{status} - {path} not found</code>
</div>
