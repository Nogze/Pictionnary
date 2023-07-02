<script>
    import {onDestroy, onMount} from 'svelte';
    import {initializeSocket, websocket} from "$lib/socket.js";
    import {goto} from '$app/navigation.js'

    let socket;
    let username = ''
    let error = ''

    const unsubscribe = websocket.subscribe(val => socket = val)

    onMount(() => {
        initializeSocket()
    })

    onDestroy(() => {
        unsubscribe()
    })

    const handleSubmit = () => {
        socket.emit({type: "connect", sender: username}, (response) => {
            if (!response.status) return error = response.payload
            socket.username = response.payload.username
            goto("/rooms")
        })
    }

    const onInput = (e) => {
        username = e.target.value
    }

</script>

<div class="flex h-screen justify-center items-center w-full">
    <div class="flex flex-col gap-10">
        <h1 class="text-4xl font-semibold">Choose your username</h1>
        <form on:submit={handleSubmit} class="flex items-center">
            <input on:input={onInput} value={username} type="text"
                   class="text-xl h-10 w-80 rounded-l-xl text-gray-900 text-center" maxlength={20}/>
            <button type="submit" class="bg-gray-500 px-3 py-2 rounded-r-xl hover:bg-gray-600">Play</button>
        </form>
        <p class={`text-xl text-red-500 text-center transitions-all first-letter:uppercase ${error === "" ? "opacity-0" : "opacity-100"}`}>{error}</p>
    </div>
</div>
