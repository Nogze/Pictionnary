<script>
    import Canvas from "./Canvas.svelte";
    import {onDestroy, onMount} from "svelte";
    import {initializeSocket, websocket} from "$lib/socket.js";

    let socket

    const unsubscribe = websocket.subscribe(val => socket = val)

    onMount(() => {
        initializeSocket()
    })

    onDestroy(() => {
        unsubscribe()

        socket.emit({type: "leave", sender: socket.username})
    })

    export let data
</script>

<h1>Room {data?.id}</h1>
<Canvas lineWidth={5} strokeStyle="#000"></Canvas>
